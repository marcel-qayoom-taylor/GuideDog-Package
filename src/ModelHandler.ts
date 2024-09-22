import OpenAI from "openai";
import * as fs from 'fs';

async function CreateAssistant(apiKey: string,htmlFiles: string[]){
    const client = new OpenAI({ apiKey });

    const contextVectorID = await CreateVectorStore(htmlFiles, client);

    const assistant = await client.beta.assistants.create({
        name: 'GuideDog',
        instructions:
          'You are an expert frontend developer that is tasked with helping me improve the accessibility of my frontend code.',
        tools: [{ type: 'file_search' }],
        tool_resources: {
          file_search: {
            vector_store_ids: [contextVectorID]
          }
        },
        model: 'gpt-4o-mini',
      });

      return assistant;
}

async function SuggestRepoChanges(apiKey: string, assistantId: string){
  const client = new OpenAI({ apiKey });

  const prompt = "Please draw on your file knowledge base to make the following HTML more semantic and accessible. Consider using header tags instead of just <p> or using <section>/<article> instead of <div> where appropriate. Do not response with any other words or content EXCEPT for the html code. This is extremely important. The returned file should be a json with a list of objects containing the following data fields: Filename, suggestion line number, type of accessibility issue and suggested code improvement";

  const thread = await client.beta.threads.create({
    messages: [ { role: "user", content: prompt} ],
    tool_resources: {
      "file_search": {
        "vector_store_ids": ["vs_2"]
      }
    }
  });

  const run = await client.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistantId,
  });

  const messages = await client.beta.threads.messages.list(thread.id, {
    run_id: run.id,
  });
}

async function CreateVectorStore(htmlFiles: string[], client: OpenAI): Promise<string>{

    const fileStreams = htmlFiles.map((filePath) =>
      fs.createReadStream(filePath),
    );

    let vectorStore = await client.beta.vectorStores.create({
      name: "Codebase Context",
    });

    await client.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
      files: fileStreams,
    });

    return vectorStore.id;
  }



  export {CreateAssistant, SuggestRepoChanges}