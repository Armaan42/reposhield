// src/inngest/functions.ts

import { getRepoFileContents } from "@/module/github/lib/github";
import { inngest } from "../client";
import { indexCodebase } from "@/module/ai/lib/rag";
import prisma from "@/lib/db";


export const indexRepo = inngest.createFunction(
  {
    id: "index-repo",
    triggers: [{ event: "repository.connected" }],
  },
  async ({ event, step }) => {
    const {owner, repo, userId} = event.data

    // fetch repo content
    // split into chunks
    // embed chunks
    // store in pinecone

    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where:{
          userId:userId,
          providerId:"github"
        }
      })

      if(!account?.accessToken) {
        throw new Error("No Github access token found");
      }

      return await getRepoFileContents(account.accessToken, owner, repo);

    })

    await step.run("index-codebase", async () => {
      await indexCodebase(`${owner}/${repo}`, files)
    })

    return {
      success:true,
      indexFiles:files.length
    }

  }
)