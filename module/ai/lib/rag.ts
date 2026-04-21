import { pineconeIndex } from "@/lib/pinecone";
import {embed} from "ai";
import {google} from "@ai-sdk/google";

export async function generateEmbedding(text:string) {
    const {embedding} = await embed ({
        model:google.textEmbeddingModel("gemini-embedding-001"),
        value:text
    })

    return embedding;
}

export async function indexCodebase(repoId:string, files:{path:string; content:string}[]) {
    const vectors = [];

    for(const file of files){
        const content =`File: ${file.path}\n\n${file.content}`;

        // we are truncating this just to reduce the token size
        const truncatedContent = content.slice(0, 8000)

        try{
            const embedding = await generateEmbedding(truncatedContent);

            vectors.push({
                id: `${repoId}-${file.path.replace(/\//g, '_')}`,
                values:embedding,
                metadata:{
                    repoId,
                    path:file.path,
                    content:truncatedContent
                }
            })
        } catch (e) {
            console.error(`Failed to embed ${file.path}:`, e);
            throw e;
        }
    }

    console.log(`Embedded ${vectors.length}/${files.length} files successfully`);

    if(vectors.length > 0){
        const batchSize = 100;

        for(let i = 0; i<vectors.length; i+=batchSize) {
            const batch = vectors.slice(i, i+batchSize);
            if(batch.length === 0) continue;

            await pineconeIndex.upsert({ records: batch })
        }
    }

    console.log("indexing complete");

}


export async function retrieveContext(query:string, repoId:string, topK:number = 5){
    const embedding = await generateEmbedding(query);

    const results = await pineconeIndex.query({
        vector:embedding,
        filter:{repoId},
        topK,
        includeMetadata:true
    });

    return results.matches.map(match => match.metadata?.content as string).filter(Boolean);
}