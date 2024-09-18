import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { Minimatch } from 'minimatch';

const repoPath: string = process.cwd();

async function runCodeScan(): Promise<string[]>{
  console.log('Running code scan');

  const gitignorePatterns = await loadGitignorePatterns(repoPath);

  return getHtmlFiles(repoPath, gitignorePatterns);
}

function getHtmlFiles(dir: string, gitignorePatterns: string[]): string[] {
  const results: string[] = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...getHtmlFiles(fullPath, gitignorePatterns));
    } else if (isHtmlFile(fullPath) && !isIgnored(fullPath, gitignorePatterns)) {
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

//Chat code to ignore files in gitignore
function isIgnored(filePath: string, patterns: string[]): boolean {
  const relativePath = path.relative(repoPath, filePath);
  return patterns.some(pattern => new Minimatch(pattern).match(relativePath));
}

function loadGitignorePatterns(repoPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const gitignorePath = path.join(repoPath, '.gitignore');
    
    fs.readFile(gitignorePath, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // .gitignore file doesn't exist
          resolve([]);
        } else {
          reject(err);
        }
        return;
      }

      const patterns = data
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#')); // Ignore comments and empty lines

      resolve(patterns);
    });
  });
}



export {runCodeScan};
