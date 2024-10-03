import OpenAI from 'openai';
import * as fs from 'fs';

export async function CreateAssistant(apiKey: string, htmlFile: string) {
  console.log('Creating assistant "GuideDog"...');
  try {
    const client = new OpenAI({ apiKey });
    // TODO: Put in accessibility criteria file (JSON)
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
    Please use the vector store of repo files, which contains full file contents, to analyze accessibility issues according to WCAG 2.2 guidelines. Based on the issues identified, provide suggestions for code improvements.
    The axe-core results are provided in JSON format and should be combined with the code from the vector store to generate suggestions.

    Ensre to return a valid JSON, with no extra text, code block delimiters, or newlines. The JSON should be an array of objects, where each object represents a file with accessibility issues.
    Each object should contain the following fields:
    - fileName (string): The file's name.
    - issues (array of objects): An array of objects, where each object represents an issue in the file with the following fields:
      - location (array of numbers): [line, column] The exact line and column of the issue.
      - type (string): The type of accessibility issue, based on predefined WCAG guidelines.
      - improvement (string): The suggested code improvement to fix the issue. For multiline fixes, suggest a string of complete code block that addresses the issue.
    If some issues can't be automatically resolved, provide a message with relevant keywords for users to search and resolve the issue manually.

    Example of output:
    [
      {
        "fileName": "index.html",
        "issues": [
          {
            "location": [5,1], 
            "type": "Lack of semantic structure", 
            "improvement": "<header><h1>Welcome to my website!</h1></header>"
          },
          {
            "location": [10,3], 
            "type": "Missing aria-label", 
            "improvement": "<button aria-label='submit'>Submit</button>"
          }
        ]
      },
      {
        "fileName": "app.js",
        "issues": [
          {
            "location": [20,1], 
            "type": "Insufficient color contrast", 
            "improvement": "Ensure contrast ratio of 4.5:1 between text and background"
          }
        ]
      }
    ]
    Make sure the response is valid JSON.

    In addition to your own analysis, please also include information from axe-core's accessibility check results. If possible, map these issues to the relevant lines of the codebase and link any cross-file relationships. Here is a sample format for axe-core violations:
    Example of axe-core results:
    {
      "testEngine": {
        "name": "axe-core",
        "version": "4.10.0"
      },
      "testEnvironment": {
        "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/128.0.0.0 Safari/537.36",
        "windowWidth": 800,
        "windowHeight": 600,
        "orientationAngle": 0,
        "orientationType": "portrait-primary"
      },
      "timestamp": "2024-10-02T16:00:01.190Z",
      "url": "http://localhost:3000/",
      "violations": [
        {
          "id": "color-contrast",
          "impact": "serious",
          "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
          "nodes": [
            {
              "html": "<span>Some element</span>",
              "target": ["fileName > span"],
              "failureSummary": "Element has insufficient color contrast"
            }
          ]
        }
      ]
    }
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
