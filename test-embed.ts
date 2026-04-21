import { config } from "dotenv";
config();
import { google } from "@ai-sdk/google";
import { embed } from "ai";

async function main() {
    // Test text-embedding-004 via v1 endpoint (not v1beta)
    try {
        const { embedding } = await embed({
            model: google.textEmbeddingModel("text-embedding-004"),
            value: "Hello world"
        });
        console.log("text-embedding-004 works! Length:", embedding.length);
    } catch (e: any) {
        console.log("text-embedding-004 FAILED:", e.message?.substring(0, 200));
    }

    // Test gemini-embedding-001
    try {
        const { embedding } = await embed({
            model: google.textEmbeddingModel("gemini-embedding-001"),
            value: "Hello world"
        });
        console.log("gemini-embedding-001 works! Length:", embedding.length);
    } catch (e: any) {
        console.log("gemini-embedding-001 FAILED:", e.message?.substring(0, 200));
    }
}
main();
