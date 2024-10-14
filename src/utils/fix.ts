import { getRepoSuggestions } from '@/helpers/ModelHandler';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

interface Issue {
    lineNumber: number;
    impact: string;
    type: string;
    improvement: string;
}

interface FileIssue {
    fileName: string;
    issues: Issue[];
}

export const jsonPath = path.join(process.cwd(), '.guidedog', 'suggestions.json');

export async function fixFile(dir: string) {
  console.log(`fix specific file at [${dir}]`);
}

export function applySuggestion(fileIssue: FileIssue, issue: Issue): void {
  const { fileName } = fileIssue;
  const { lineNumber, improvement } = issue;

  const filePath = path.resolve(fileName);
  if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${fileName}`);
      return;
  }

  let fileContent: string = fs.readFileSync(filePath, 'utf-8');
  const fileLines: string[] = fileContent.split('\n');

  if (lineNumber - 1 >= fileLines.length) {
      console.error(`Line number ${lineNumber} out of range for file ${fileName}`);
      return;
  }

  fileLines[lineNumber - 1] = improvement;

  fileContent = fileLines.join('\n');
  fs.writeFileSync(filePath, fileContent, 'utf-8');

  console.log(`Updated line ${lineNumber} in ${fileName}`);
}

export async function applyAllSuggestions(): Promise<void> {
  const fileIssues: FileIssue[] = JSON.parse(jsonPath);

  fileIssues.forEach((fileIssue) => {
      fileIssue.issues.forEach((issue) => {
          applySuggestion(fileIssue, issue);
      });
  });

  console.log('All suggestions have been applied across the repository.');
}

export async function applyFileSuggestions(fileIndex: number, suggestionJson: string): Promise<void> {
  const fileIssues: FileIssue[] = JSON.parse(suggestionJson);

  if (fileIndex >= 0 && fileIndex < fileIssues.length) {
      const fileIssue = fileIssues[fileIndex];

      if (fileIssue) {
          fileIssue.issues.forEach((issue) => {
              applySuggestion(fileIssue, issue);
          });

          console.log(`All issues for file ${fileIssue.fileName} have been applied.`);
      } else {
          console.error(`File issue at index ${fileIndex} is undefined.`);
      }
  } else {
      console.error(`Invalid file index: ${fileIndex}`);
  }
}

