import { config } from "dotenv";
config();
import { Pinecone } from "@pinecone-database/pinecone";

async function main() {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_DB_API_KEY! });
    
    // Delete old index
    console.log("Deleting old index...");
    await pc.deleteIndex("reposhield");
    console.log("Deleted.");

    // Wait a moment
    await new Promise(r => setTimeout(r, 3000));

    // Create new index with 3072 dimensions for gemini-embedding-001
    console.log("Creating new index with 3072 dimensions...");
    await pc.createIndex({
        name: "reposhield",
        dimension: 3072,
        metric: "cosine",
        spec: {
            serverless: {
                cloud: "aws",
                region: "us-east-1"
            }
        }
    });
    console.log("Done! Index 'reposhield' created with 3072 dimensions.");
}
main();
