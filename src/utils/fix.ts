import { getRepoSuggestions, type Issue, type Suggestion } from '@/helpers/ModelHandler';
import * as fs from 'fs';
import * as path from 'path';
import { createNewRun, DIR_PATH, RUNS_PATH } from '@/helpers/config';
import { getPromptFiles, runCodeScan } from '@/helpers/CodeBaseScan';
import { createfileLineBreakdown } from '@/helpers/FileLineBreakdown';

export const jsonPath = path.join(DIR_PATH, 'suggestions.json');

export const getSuggestions = async (): Promise<Suggestion[]> => {
  try {
    const filePaths = await runCodeScan();
    const { timestamp, newRunPath } = createNewRun();

    createfileLineBreakdown(filePaths, newRunPath, timestamp);

    const promptFiles = await getPromptFiles(timestamp);

    const suggestions = await getRepoSuggestions(promptFiles);

    fs.writeFileSync(
      `${RUNS_PATH}/run-${timestamp}/suggestions.json`,
      JSON.stringify(suggestions, null, 2),
      {
        encoding: 'utf8',
        flag: 'w',
      },
    );

    return suggestions;
  } catch (error) {
    throw error;
  }
};

export async function applySuggestion(
  fileName: string,
  issue: Issue,
): Promise<void> {
  const { lineNumber, improvement } = issue;

  const filePath = path.resolve(fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${fileName}`);
    return;
  }

  let fileContent: string = fs.readFileSync(filePath, 'utf-8');
  const fileLines: string[] = fileContent.split('\n');

  if (lineNumber - 1 >= fileLines.length) {
    console.error(
      `Line number ${lineNumber} out of range for file ${fileName}`,
    );
    return;
  }

  fileLines[lineNumber - 1] = improvement;

  fileContent = fileLines.join('\n');
  fs.writeFileSync(filePath, fileContent, 'utf-8');

  console.log(`Updated line ${lineNumber} in ${fileName}`);
}

export async function applyAllSuggestions(): Promise<void> {
  const fileIssues = await getSuggestions();

  // const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  // const fileIssues: FileIssue[] = JSON.parse(fileContent);

  fileIssues.forEach((file) => {
    const { fileName } = file;

    file.issues.forEach((issue) => {
      applySuggestion(fileName, issue);
    });
  });

  console.log('All suggestions have been applied across the repository.');
}

export async function applyFileSuggestions(fileName: string, filesWithSuggestions: Suggestion[]): Promise<void> {

  // const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  // const fileIssues: FileIssue[] = JSON.parse(fileContent);

  const fileIssue = filesWithSuggestions.find((file) => file.fileName === fileName);

  if (fileIssue) {
    const { fileName } = fileIssue;

    fileIssue.issues.forEach((issue) => {
      applySuggestion(fileName, issue);
    });

    console.log(`All issues for file ${fileIssue.fileName} have been applied.`);
  } else {
    console.error(`File with name ${fileName} not found in the JSON data.`);
  }
}

export function getAllFiles(): { filePath: string; fileName: string }[] {
  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const fileIssues: Suggestion[] = JSON.parse(fileContent);

  const response = fileIssues.map((fileIssue) => ({
    filePath: path.resolve(fileIssue.fileName),
    fileName: fileIssue.fileName,
  }));

  return response;
}
