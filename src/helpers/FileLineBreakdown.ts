// src/helpers/createfileLineBreakdown.ts
import path from 'path';
import * as fs from 'fs';

export async function createfileLineBreakdown(
  filePaths: string[],
): Promise<string> {
  console.log('Creating fileLineBreakdown file...');
  const fileLineBreakdown: { [key: string]: string[] } = {}; // Initialize as an object

  try {
    for (const filePath of filePaths) {
      const content: string = await fs.promises.readFile(filePath, 'utf8'); // Read file as string
      const code = content.split('\n');
      fileLineBreakdown[filePath] = code.map(
        (line, index) => `${index + 1}: ${line}`,
      );
    }

    const directoryPath = path.join(process.cwd(), '.guidedog');

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }
    // Write the mega file to the src directory
    const outputPath = path.join(directoryPath, 'fileLineBreakdown.json');
    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(fileLineBreakdown, null, 2),
      'utf8',
    );

    return outputPath;
  } catch (error) {
    throw error;
  }
}
