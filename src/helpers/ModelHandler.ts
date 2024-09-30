import OpenAI from 'openai';
import * as fs from 'fs';

export async function CreateAssistant(apiKey: string, htmlFile: string) {
  console.log('Creating assistant "GuideDog"...');
  try {
    const client = new OpenAI({ apiKey });

    const contextVectorID = await CreateVectorStore(htmlFile, client);

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
    return { assistant, contextVectorID };
  } catch (error) {
    throw error;
  }
}

export async function SuggestRepoChanges(
  apiKey: string,
  assistantId: string,
  contextId: string,
) {
  const client = new OpenAI({ apiKey });

  // Prompt should be a string
  const prompt: string = `
  Please analyze the following HTML for accessibility and semantic improvements. 
  Only return valid JSON with no extra text or code block delimiters or newline characters. 

  You will be provided with a file path to the JSON file. Each key in the json object is a file path. The value for each file path is an array of strings
  where each string is a line of code from the file. 

  You need to output the following: 
  
  The JSON should be an array of objects with the following fields:
  - Filename (string)
  - Suggestion line number (number)
  - Type of accessibility issue (string)
  - Suggested code improvement (string)
  
  Example:
  [
    {
      "Filename": "index.html",
      "suggestion line number": 5,
      "type of accessibility issue": "Lack of semantic structure",
      "suggested code improvement": "<header><h1>Welcome to my website!</h1></header>"
    }
  ]
  Make sure the response is valid JSON.
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

  //kinda strange to be converting obj -> json -> obj but for some reason the initial obj throws error when trying to access text field.
  const lastMessage = JSON.stringify(
    messages.data[messages.data.length - 1]?.content[0],
  );
  const jsonResponse = JSON.parse(lastMessage);
  const suggestions = jsonResponse.text.value;

  console.log(suggestions);
  return jsonResponse;
}

async function CreateVectorStore(
  htmlFile: string,
  client: OpenAI,
): Promise<string> {
  const fileStream = fs.createReadStream(htmlFile);

  let vectorStore = await client.beta.vectorStores.create({
    name: 'Codebase Context',
  });

  await client.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
    files: [fileStream],
  });

  return vectorStore.id;
}
