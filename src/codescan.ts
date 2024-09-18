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

async function runCodeScan(): Promise<string>{
  console.log('Running code scan');

  return CreateVectorStore( getHtmlFiles(repoPath));
}

async function CreateVectorStore(htmlFiles: string[]): Promise<string>{
  const fileStreams = htmlFiles.map((filePath) =>
    fs.createReadStream(filePath),
  );

  let vectorStore = await openai.beta.vectorStores.create({
    name: "Codebase Context",
  });

  await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
    files: fileStreams,
  });

  return vectorStore.id;
}

export {runCodeScan};
