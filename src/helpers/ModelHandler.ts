import OpenAI from 'openai';
import * as fs from 'fs';
import { getOpenAIClient } from './OpenaiClient';
import { getConfig } from './config';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import { LATEST_RUN_PATH } from './config';

const ResponseFormat = z.object({
  fileName: z.string(),
  issue: z.array(
    z.object({
      location: z.number(),
      impact: z.enum(['critical', 'serious', 'moderate', 'minor']),
      type: z.string(),
      improvement: z.string(),
    }),
  ),
});

export async function getRepoSuggestions(fileLineBreakdownPath: string) { 
  try {
    console.log("Getting Suggestions")
    const apiKey = process.env.OPENAI_API_KEY || undefined;
    const openai = new OpenAI({ apiKey: apiKey });

    const files_data = fs.readFileSync(fileLineBreakdownPath, 'utf8');

    const prompt = `I am providing you a json file which is a line by line breakdown of every front end related file in my codebase. This file is in the format of:
          {
            "fileName": [
              "line 1",
              "line 2",
              "line 3",
              ...
            ]
          } for each file in my codebase. each line represents the exact line of code except for the first characters which indicate the line number, colon and one space e.g. "3: " is line 3 in the file.

          From this input data, please use identify any accessibility issues in the codebase according to WCAG 2.2 guidelines. Provide suggestions for code improvements based on the issues identified. Ensure that the suggestions are accurate and adhere to accessibility best practices. 
          
          Here is the json file of the line by line breakdown of my codebase:

          ${files_data}
        `

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: "You are an expert frontend developer in ReactJS, VueJS, Angular and Web accessibility and tasked with helping me improve the accessibility of my frontend code according to WCAG 2.2 guidelines." },
        { role: "user", content: prompt},
      ],
      response_format: zodResponseFormat(ResponseFormat, "response_format"),
    });

    const suggestions = completion?.choices[0]?.message.parsed;
    console.log("SUGGESTIONS: ", suggestions);
    return suggestions;
  } catch (error) {
    throw error;
  }
}

export async function CreateAssistant() {
  console.log('Creating assistant "GuideDog"...');
  try {
    const client = getOpenAIClient();

    const vectorStore = await client.beta.vectorStores.create({
      name: 'Codebase Context',
    });

    const assistant = await client.beta.assistants.create({
      name: 'GuideDog',
      instructions: `
        You are an expert frontend developer in ReactJS, VueJS, Angular and Web accessibility and tasked with helping me improve the accessibility of my frontend code according to WCAG 2.2 guidelines.
      `,
      tools: [{ type: 'file_search' }],
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStore.id],
        },
      },
      model: 'gpt-4o-mini',
    });

    console.log('Created assistant "GuideDog"');
    return { assistant, contextVectorID: vectorStore.id };
  } catch (error) {
    throw error;
  }
}

export async function suggestRepoChanges(
  assistantId: string | undefined,
  contextId: string | undefined,
) {
  try {
    if (!assistantId || !contextId) {
      throw new Error(
        'assistantId or contextId cannot be found in configuration file',
      );
    }

    const client = getOpenAIClient();

    // Prompt should be a string
    const prompt: string = `
      Please use the vector store of repo files, which contains "files-*.json", "axecore-*.json", and "wcag.json", to analyze accessibility issues according to WCAG 2.2 guidelines. Based on the issues identified, provide suggestions for code improvements.
      The "files-*.json" file:
        - Description: a structured JSON object that maps filenames in the codebase to their corresponding lines of code.
        - Structure:
          {
            fileName: string[], // Maps each file name in the scanned file to an array of lines as strings
          }

      The axecore-*.json file
        - Description: a structured JSON object that contains the results of accessibility tests conducted by the axe-core library.
        - Structure:
          {
            testEngine: {
              name: string;  // The name of the test engine (e.g., "axe-core")
              version: string;  // The version of the test engine
            };
            testEnvironment: {
              userAgent: string;  // The user agent string of the browser
              windowWidth: number;  // The width of the browser window in pixels
              windowHeight: number;  // The height of the browser window in pixels
              orientationAngle: number;  // The orientation angle of the device
              orientationType: string;  // The type of orientation (e.g., portrait-primary)
            };
            timestamp: string;  // The timestamp of when the test was conducted
            url: string;  // The URL that was tested
            violations: {
              id: string;  // The unique identifier for the violation
              impact: string;  // The severity of the violation (e.g., serious, moderate, minor)
              description: string;  // A description of the violation
              nodes: {
                html: string;  // The HTML element that has the violation
                target: string[];  // The target selector(s) for the violating element(s)
                failureSummary: string;  // A summary of the failure
              }[];  // Array of nodes that are affected by the violation
            }[];  // An array of violations found during the test
          }
        - Sample of "axecore-*.json" file:
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

      Your task is to:
      1. Retrieve the latest files that matches the pattern "files-*.json" and "axecore-*.json" based on their timestamps and "wcag.json".
      2. Analyze accessibility issues in the latest "files-*.json" according to WCAG 2.2 guidelines.
        - The analysis must include both your own findings and the violations from the latest "axecore-*.json"
        - Contextualize your analysis by reviewing the entire file, considering how different elements interact and how they might affect accessibility.
        - Include issues identified in the latest 'axecore-*.json' file, mapping them to the relevant locations in "file-*.json" where possible.
      3. Provide solutions based on the issues identified, suggest accurate code improvements.
        - Locate the issue: Each issue must have a valid location (line) defined in "file-*.json".
        - Resolve the issue: Provide one single solution per issue.
        - Skip: If you cannot map or resolve an issue, skip it without generating a solution.
        - If the issue can be resolved with a single line of code, provide the original line, not placeholder text (e.g., "...").
        - For multiline fixes, fix the issue, the unchanged content inside can be replace with '...' to indicate that the code is incomplete.
        - Ensure that the suggested improvements are functional and adhere to accessibility best practices and correctness.
        - If no definitive improvement can be made, provide a message with relevant keywords for users to search and resolve the issue manually.
      4. Before returning the suggestions, validate the suggestions and modify them accordingly if not pass any of these validation criteria:
        - Validate that the suggestions consider the surrounding code context. This includes ensuring that conditional rendering, variable states, and the overall structure of the component or file are taken into account.
        - Suggestions should not introduce new bugs or alter the intended behavior of the application.
        - Ensure that the improvements adhere to established accessibility guidelines WCAG 2.2
        - Validate that the suggested changes do not negatively affect the visual presentation or user experience.
      5. Strictly return a valid JSON, with no extra explanation, text, code block delimiters, or newlines. The JSON should be an array of objects, where each object represents a file with accessibility issues.

      The output must be strictly following this structure:
      [
        {
          fileName:string, //  The name of file having issues
          issues: [ // An array of objects, where each object represents an issue in the file
            {
              location: number, // The exact line of the issue.
              impact: string, // The severity of the issue based on axe-core's analysis.
              type: string, // The type of accessibility issue, based on predefined WCAG guidelines.
              improvement: string // The suggested code improvement to fix the issue.
            }
          ]
        }
      ]
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

    // kinda strange to be converting obj -> json -> obj but for some reason the initial obj throws error when trying to access text field.
    const lastMessage = JSON.stringify(messages.data.pop()?.content[0]);

    if (!lastMessage || typeof lastMessage !== 'string') {
      throw new Error('Invalid message format or empty response');
    }

    const response = JSON.parse(lastMessage);
    const suggestions = JSON.parse(response.text.value);

    return suggestions;
  } catch (error) {
    throw error;
  }
}

export async function uploadFiles(uploadingFiles: string[]): Promise<void> {
  try {
    const client = getOpenAIClient();
    const _config = await getConfig();

    if (!_config?.contextId)
      throw new Error('Missing context id in configuration file!');

    const fileStreams = uploadingFiles.map((file) => fs.createReadStream(file));

    await client.beta.vectorStores.fileBatches.uploadAndPoll(
      _config.contextId,
      {
        files: fileStreams,
      },
    );
  } catch (error) {
    throw error;
  }
}
