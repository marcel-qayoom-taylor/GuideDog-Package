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
  Please draw on the vector store knowledge base of repo files to provide accesibility suggestiosn according to WCAG guidelines.
  Only return valid JSON with no extra text or code block delimiters or newline characters.
  The JSON should be an array of objects with the following fields:
  - Filename (string)
  - Suggestion line number (number): This should be the line of the original code from the vector store where the suggestions is for. If the suggestions is something that covers multiple lines it should be the first line of the file.
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
