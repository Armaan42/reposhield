import {Octokit} from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

/**
 * Getting the github access token
 */

export const getGithubToken = async()=>{
    const session = await auth.api.getSession({
        headers:await headers()
    })

    if(!session){
        throw new Error("Unauthorized")
    }

    // how i can access my account by passing the userid and then extract the access token

    const account = await prisma.account.findFirst({
        where:{
            userId:session.user.id,
            providerId:"github"
        }
    })

    if(!account?.accessToken){
        throw new Error("No github access token found")
    }

    return account.accessToken;

}

/** 
 * fetching the user contribution
 */

export async function fetchUserContributions(token:string , username:string) {
    const octokit = new Octokit({auth:token})

    const query = `
    query($username: String!){
        user(login: $username){
            contributionsCollection {
                contributionCalendar{
                    totalContributions
                    weeks {
                        contributionDays {
                            contributionCount
                            date
                            color
                        }
                    }
                }
            }
        }
    }
    `;


    // interface contributiondata {
    //     user: {
    //         contributionCollection: {
    //             contributionCalendar: {
    //                 totalContributions: number;
    //                 weeks: {
    //                     contributionDays: {
    //                         contributionCount: number;
    //                         date: string;
    //                         color: string;
    //                     }[];
    //                 }[];
    //             }
    //         }
    //     }
    // }

    try{
        const response: any = await octokit.graphql(query, {
            username
        })
        return response.user.contributionsCollection.contributionCalendar
    } catch (error){
        console.error("Error fetching contributions:", error);
        return null;
    }
}


export const getRepository = async ( page:number = 1, perPage:number=10) => {
    const token = await getGithubToken();
    const octokit = new Octokit({auth:token});

    const {data} = await octokit.rest.repos.listForAuthenticatedUser({
        sort:"updated",
        direction:"desc",
        visibility:"all",
        page:page
    })

    return data;
}


export const createWebhook = async (owner:string, repo:string) => {
    const token = await getGithubToken();
    const octokit = new Octokit({auth:token});

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`

    const {data:hooks} = await octokit.rest.repos.listWebhooks({
        owner,
        repo
    })
    const existingHook = hooks.find(hook => hook.config.url === webhookUrl);
    if(existingHook){
        return existingHook
    }

    const {data} = await octokit.rest.repos.createWebhook({
        owner,
        repo,
        config:{
            url:webhookUrl,
            content_type:"json"
        },
        events:["pull_request"]
    });
    return data;
}


export const deleteWebhook = async (owner:string, repo:string)=>{
    const token = await getGithubToken();
    const octokit = new Octokit({auth:token});
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

    try{
        const {data:hooks} = await octokit.rest.repos.listWebhooks({
            owner,
            repo
        });

        const hookToDelete = hooks.find(hook => hook.config.url === webhookUrl);

        if(hookToDelete) {
            await octokit.rest.repos.deleteWebhook({
                owner,
                repo,
                hook_id:hookToDelete.id
            })
            return true
        }

        return false

    } catch (error) {
        console.error("Error deleting webhook:", error);
        return false;
    }
}



export async function getRepoFileContents(
    token: string,
    owner: string,
    repo: string,
    path: string = ""
):Promise<{path:string, content:string}[]> {
    const octokit = new Octokit({auth:token});

    let data;
    try {
        const response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path
        });
        data = response.data;
    } catch (error: any) {
        if (error.status === 404) {
            return [];
        }
        throw error;
    }

    if(!Array.isArray(data)){
        //it's a file
        if(data.type === "file" && data.content) {
            return [{
                path: data.path,
                content: Buffer.from(data.content, "base64").toString("utf-8"),
            }];
        }
        return [];
    }

    let files: {path:string, content:string}[] = [];

    for(const item of data){
        if(item.type === "file"){
            let fileData;
            try {
                const response = await octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path:item.path
                });
                fileData = response.data;
            } catch (error: any) {
                // Skip if the file was somehow missing
                if (error.status === 404) {
                    continue;
                }
                throw error;
            }

            if (!Array.isArray(fileData) && fileData.type === "file" && fileData.content) {
                // Filter out non-code files if needed (images, etc.)
                // For now, let's include everything that looks like text
                if (!item.path.match(/\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz)$/i)) {
                    files.push({
                        path: item.path,
                        content: Buffer.from(fileData.content, "base64").toString("utf-8"),
                    });
                }
            }
        }

        else if(item.type === "dir"){
            const subFiles = await getRepoFileContents(token, owner, repo, item.path)

            files = files.concat(subFiles)
        }
    }

    return files;
}