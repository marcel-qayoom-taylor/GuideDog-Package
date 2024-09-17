import * as fs from 'fs';
import * as path from 'path';

const repoPath: string = process.cwd();

function isHtmlFile(fileName: string): boolean {
  const extensions: string[] = ['.html', '.jsx', '.tsx', '.vue']; //Will change to come from config
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

function chunkFile(content: string, chunkSize: number = 2000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.substring(i, i + chunkSize));
  }
  return chunks;
}

// Main function to run the code search
async function runCodeSearch(): Promise<void> {
  console.log('Starting code search...');
  
  const htmlFiles: string[] = getHtmlFiles(repoPath);
  console.log('Found HTML-related files:', htmlFiles);
}

// Execute the code search when the script is run
runCodeSearch().catch(console.error);
