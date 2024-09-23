import OpenAI from 'openai';
import * as fs from 'fs';

export async function CreateAssistant(apiKey: string, htmlFiles: string[]) {
  console.log('Creating assistant "GuideDog"...');
  try {
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

    console.log('✅Created assistant "GuideDog"');
    return assistant;
  } catch (error) {
    throw error;
  }
}

async function SuggestRepoChanges(apiKey: string, assistantId: string, contextId: string){
  const client = new OpenAI({ apiKey });

  // Prompt should be a string
  const prompt: string = `
    Please draw on your file knowledge base to make the following HTML more semantic and accessible. 
    Consider using header tags instead of just <p> or using <section>/<article> instead of <div> where appropriate. 
    Do not respond with any other words or content EXCEPT for the HTML code and suggestions.
    Return the result as a JSON with a list of objects containing the following data fields:
    Filename, suggestion line number, type of accessibility issue, and suggested code improvement.
  `;

  const thread = await client.beta.threads.create({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    tool_resources: {
      file_search: {
        vector_store_ids: [contextId],
      },
    },
  });

  const run = await client.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistantId,
  });

  const messages = await client.beta.threads.messages.list(thread.id, {
    run_id: run.id,
  });

  const lastMessage = messages.data[messages.data.length - 1]?.content;

  if (typeof lastMessage === 'string') {
    try {
      const jsonResponse = JSON.parse(lastMessage);
      console.log(jsonResponse);
      return jsonResponse;
    } catch (error) {
      console.error('Error parsing the assistant response as JSON:', error);
    }
  } else {
    console.error('No valid content found in the assistant response.');
  }
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
