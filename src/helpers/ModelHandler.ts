import * as fs from 'fs';
import { getOpenAIClient } from './OpenaiClient';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import { DIR_PATH } from './config';

const ResponseFormat = z.object({
  suggestions: z.array(
    z.object({
      fileName: z.string(),
      issues: z.array(
        z.object({
          lineNumber: z.number(),
          impact: z.enum(['critical', 'serious', 'moderate', 'minor']),
          type: z.string(),
          improvement: z.string(),
        }),
      ),
    }),
  ),
});

export async function getRepoSuggestions(fileLineBreakdownPath: string) {
  try {
    const openai = getOpenAIClient();

    const files_data = fs.readFileSync(fileLineBreakdownPath, 'utf8');
    const wcag_data = fs.readFileSync(`${DIR_PATH}/wcag.json`, 'utf8');

    const prompt = `I am providing you two json files. The first is a line by line breakdown of every front end related file in my codebase. This file is in the format of:
          {
            "fileName": [
              "line 1",
              "line 2",
              "line 3",
              ...
            ]
          } for each file in my codebase. each line represents the exact line of code except for the first characters which indicate the line number, colon and one space e.g. "3: " is line 3 in the file.

          From this input data, please use identify any accessibility issues in the codebase according to WCAG 2.2 guidelines. Provide suggestions for code improvements based on the issues identified. Ensure that the suggestions are accurate and adhere to accessibility best practices. 

          The second json file you will receive is the WCAG 2.2 guidelines. Please use these to inform the suggestions you provide.

          Your task is to:
          1. Read through the upcoming json file and identify accessibility issues according to WCAG 2.2 guidelines.
            - Contextualize your analysis by reviewing the entire file, considering how different elements interact and how they might affect accessibility.
          2. Provide solutions based on the issues identified, suggest accurate code improvements.
            - Locate the issue: Each issue must have a valid line number".
            - Resolve the issue: Provide one single solution per issue. 
            - Skip: If you cannot map or resolve an issue, skip it without generating a solution.
            - If the issue can be resolved with a single line of code, provide the original line, not placeholder text (e.g., "...").
            - Do not do multi line fixes. Just provide the exact line of code that needs to be fixed. You can do multiple suggestions for the same file just one line at a time.
            - Ensure that the suggested improvements are functional and adhere to accessibility best practices and correctness.
            - If no definitive improvement can be made, provide a message with relevant keywords for users to search and resolve the issue manually.
            - The suggestion should be the exact code and nothing else. The code provided is going to replace the exact line of the identified issue. So please ensure you provide the exact code that should replace the line.
            - For any quotes required in the suggestion please use single quotes. Do not try to use escape characters as this breaks the response for us. 
            - For the type of issue, use the exact title of the issue as per the WCAG 2.2 guidelines.
          3. Before returning the suggestions, validate the suggestions and modify them accordingly if not pass any of these validation criteria:
            - Validate that the suggestions consider the surrounding code context. This includes ensuring that conditional rendering, variable states, and the overall structure of the component or file are taken into account.
            - Suggestions should not introduce new bugs or alter the intended behavior of the application.
            - Ensure that the improvements adhere to established accessibility guidelines WCAG 2.2
            - Validate that the suggested changes do not negatively affect the visual presentation or user experience.
          4. Strictly return a valid JSON, with no extra explanation, text, code block delimiters, or newlines. The JSON should be an array of objects, where each object represents a file with accessibility issues.
          5. You must do this for every file provided. There are often multiple files needing accessibility improvements.

          The output must be strictly following this structure:
          [
            {
              fileName:string, //  The name of file having issues
              issues: [ // An array of objects, where each object represents an issue in the file
                {
                  location: number, // The exact line of the issue.
                  impact: string, // The severity of the issue based on axe-core's analysis.
                  type: string, // The type/title of accessibility issue, based on predefined WCAG guidelines.
                  improvement: string // The suggested code improvement to fix the issue.
                }
              ]
            }
          ]

          HERE IS THE JSON FILE OF THE WCAG 2.2 GUIDELINES:

          ${wcag_data}

          HERE IS THE JSON FILE OF THE LINE BY LINE BREAKDOWN OF MY CODEBASE:

          ${files_data}
        `;

    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert frontend developer in ReactJS, VueJS, Angular and Web accessibility and tasked with helping me improve the accessibility of my frontend code according to WCAG 2.2 guidelines.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: zodResponseFormat(ResponseFormat, 'response_format'),
    });

    const suggestions = completion?.choices[0]?.message.parsed;

    if (!suggestions) {
      throw new Error('No suggestions were generated.');
    }

    const formattedSuggestions = sanitizeSuggestions(suggestions);

    return formattedSuggestions;
  } catch (error) {
    throw error;
  }
}

// This function sanitize the suggestions. This is to improve consistency of format and can be expanded on over time.
const sanitizeSuggestions = (suggestionFile: any) => {
  return suggestionFile.suggestions.map((file: any) => ({
    ...file,
    issues: file.issues.map((issue: any) => ({
      ...issue,
      // Replace double quotes and escape chars with single quotes
      improvement: issue.improvement
        .replace(/"/g, "'")
        .replace(/\\"/g, "'")
        .trim(),
    })),
  }));
};
