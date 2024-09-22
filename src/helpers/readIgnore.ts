import fs from 'fs';
import path from 'path';

export function readIgnore() {
  const ignorePath = path.join(process.cwd(), '.guidedogignore');

  try {
    const data = fs.readFileSync(ignorePath, 'utf-8');

    const ignorePatterns = data
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#')); // Filter out empty lines and comments

    return ignorePatterns;
  } catch (error) {
      return [];
  }
}