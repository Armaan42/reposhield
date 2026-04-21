import { config } from "dotenv";
config();
import { Pinecone } from "@pinecone-database/pinecone";

async function main() {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_DB_API_KEY! });
    const desc = await pc.describeIndex("reposhield");
    console.log("Index dimension:", desc.dimension);
    console.log("Index metric:", desc.metric);
}
main();
