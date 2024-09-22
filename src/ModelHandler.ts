import OpenAI from 'openai';
import * as fs from 'fs';

async function CreateAssistant(apiKey: string, htmlFiles: string[]) {
  const client = new OpenAI({ apiKey });

  const contextVectorID = await CreateVectorStore(htmlFiles, client);

  const assistant = await client.beta.assistants.create({
    name: 'GuideDog',
    instructions:
      'You are an expert frontend developer that is tasked with helping me improve the accessibility of my frontend code.',
    tools: [{ type: 'file_search' }],
    tool_resources: {
      file_search: {
        vector_store_ids: [contextVectorID],
      },
    },
    model: 'gpt-4o-mini',
  });

  return assistant;
}

async function CreateVectorStore(
  htmlFiles: string[],
  client: OpenAI,
): Promise<string> {
  const fileStreams = htmlFiles.map((filePath) =>
    fs.createReadStream(filePath),
  );

  let vectorStore = await client.beta.vectorStores.create({
    name: 'Codebase Context',
  });

  await client.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
    files: fileStreams,
  });

  return vectorStore.id;
}

export { CreateAssistant };
