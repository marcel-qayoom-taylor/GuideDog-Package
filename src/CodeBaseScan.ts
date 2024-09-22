import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

const repoPath: string = process.cwd();

async function runCodeScan(): Promise<string[]> {
  console.log('Running code scan');

  return getHtmlFiles(repoPath);
}

function getHtmlFiles(dir: string): string[] {
  const results: string[] = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      if (path.basename(fullPath) !== 'node_modules') {
        // Ignore node_modules folder
        results.push(...getHtmlFiles(fullPath));
      }
    } else if (isHtmlFile(fullPath)) {
      results.push(fullPath);
      console.log(fullPath);
    }
  });

  return results;
}

function isHtmlFile(fileName: string): boolean {
  const extensions: string[] = ['.html', '.jsx', '.tsx', '.vue']; //Plan to change to be more intuitive (config usage, more dynamic way to determine html file)
  return extensions.some((ext) => fileName.endsWith(ext));
}

export { runCodeScan };
