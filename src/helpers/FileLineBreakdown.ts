// src/helpers/createfileLineBreakdown.ts
import { promises as fs } from 'fs'; // Use promises API

export async function createfileLineBreakdown(
  filePaths: string[],
): Promise<string> {
  console.log('Creating fileLineBreakdown file...');
  const fileLineBreakdown: { [key: string]: string[] } = {}; // Initialize as an object

  try {
    for (const filePath of filePaths) {
      const content: string = await fs.readFile(filePath, 'utf8'); // Read file as string
      const code = content.split('\n');
      fileLineBreakdown[filePath] = code.map(
        (line, index) => `${index + 1}: ${line}`,
      );
    }

    // Write the mega file to the src directory
    const outputPath = 'src/fileLineBreakdown.json';
    await fs.writeFile(
      outputPath,
      JSON.stringify(fileLineBreakdown, null, 2),
      'utf8',
    );

    return outputPath;
  } catch (error) {
    throw error;
  }
}
