import { getPineconeIndex } from "@/lib/pinecone";
import { embed } from "ai";
import { google } from "@ai-sdk/google";

const EMBED_DELAY_MS = 1000;      // delay between individual embedding calls
const BATCH_PAUSE_MS = 2000;     // extra pause between batches of files
const EMBED_BATCH_SIZE = 5;      // files to embed per batch before pausing

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateEmbedding(text: string) {
    const { embedding } = await embed({
        model: google.textEmbeddingModel("gemini-embedding-001"),
        value: text
    });
    return embedding;
}

export async function indexCodebase(repoId: string, files: { path: string; content: string }[]) {
    const pineconeIndex = getPineconeIndex();
    const vectors = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = `File: ${file.path}\n\n${file.content}`;
        const truncatedContent = content.slice(0, 8000);

        try {
            // Throttle: wait between every embedding call
            if (i > 0) {
                await sleep(EMBED_DELAY_MS);
            }

            // Extra pause between batches to avoid burst quota limits
            if (i > 0 && i % EMBED_BATCH_SIZE === 0) {
                console.log(`Batch pause after ${i} files...`);
                await sleep(BATCH_PAUSE_MS);
            }

            const embedding = await generateEmbedding(truncatedContent);
            vectors.push({
                id: `${repoId}-${file.path.replace(/\//g, '_')}`,
                values: embedding,
                metadata: {
                    repoId,
                    path: file.path,
                    content: truncatedContent
                }
            });
        } catch (e) {
            // Skip failed files instead of aborting the whole job
            console.error(`Failed to embed ${file.path}, skipping:`, e);
        }
    }

    console.log(`Embedded ${vectors.length}/${files.length} files successfully`);

    if (vectors.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            if (batch.length === 0) continue;
            await pineconeIndex.upsert({ records: batch });
        }
    }

    console.log("indexing complete");
}

export async function retrieveContext(query: string, repoId: string, topK: number = 5) {
    const pineconeIndex = getPineconeIndex();
    const embedding = await generateEmbedding(query);

    const results = await pineconeIndex.query({
        vector: embedding,
        filter: { repoId },
        topK,
        includeMetadata: true
    });

    return results.matches.map(match => match.metadata?.content as string).filter(Boolean);
}