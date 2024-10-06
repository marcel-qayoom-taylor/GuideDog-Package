// src/helpers/createfileLineBreakdown.ts
import path from 'path';
import * as fs from 'fs';

export function createfileLineBreakdown(
  filePaths: string[],
  runPath: string,
  timestamp: string
): string {
  const fileLineBreakdown: { [key: string]: string[] } = {}; // Initialize as an object

  try {
    for (const filePath of filePaths) {
      const content: string = fs.readFileSync(filePath, 'utf8'); // Read file as string
      const code = content.split('\n');
      fileLineBreakdown[filePath] = code.map(
        (line, index) => `${index + 1}: ${line}`,
      );
    }

    if (!fs.existsSync(runPath)) {
      fs.mkdirSync(runPath, { recursive: true });
    }

    // Write the mega file to the src directory
    const outputPath = path.join(runPath, `files-${timestamp}.json`);

    fs.writeFileSync(
      outputPath,
      JSON.stringify(fileLineBreakdown, null, 2),
      'utf8',
    );

    return outputPath;
  } catch (error) {
    throw error;
  }
}
