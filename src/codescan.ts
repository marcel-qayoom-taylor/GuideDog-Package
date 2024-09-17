import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

const repoPath: string = process.cwd();

const openai = new OpenAI();

function isHtmlFile(fileName: string): boolean {
  const extensions: string[] = ['.html', '.jsx', '.tsx', '.vue']; //Plan to change to be more intuitive (config usage, more dynamic way to determine html file)
  return extensions.some((ext) => fileName.endsWith(ext));
}

function getHtmlFiles(dir: string): string[] {
  const results: string[] = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...getHtmlFiles(fullPath));
    } else if (isHtmlFile(fullPath)) {
      results.push(fullPath);
    }
  });

  return results;
}

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

//probs not needed
function chunkFile(content: string, chunkSize: number = 2000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.substring(i, i + chunkSize));
  }
  return chunks;
}

async function runCodeScan(): Promise<void> {
  console.log('Running code scan');
  
  const htmlFiles: string[] = getHtmlFiles(repoPath);

  htmlFiles.forEach(async (file) => {
    await openai.files.create({
        file: fs.createReadStream(file),
        purpose: "assistants",
    });

    console.log(`Added ${file} to assistant`);
  });
}

