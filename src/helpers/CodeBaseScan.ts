import { glob } from 'glob';
import { readIgnore } from '@/helpers/readIgnore';
import { RUNS_PATH, DIR_PATH } from './config';
import * as fs from 'fs';

export async function runCodeScan(): Promise<string[]> {
  const _ignore = readIgnore();
  try {
    const patterns = [
      `**/*.{js,jsx,ts,tsx,html,htm,xhtml,css,scss,less,vue,svelte}`,
    ];
    const filePaths = await glob(patterns, {
      ignore: [
        ..._ignore,
        'node_modules/**',
        '*.json',
        '.next/**',
        'dist/**',
        'build/**',
        'public/**',
      ],
    });

    return filePaths;
  } catch (error) {
    throw error;
  }
}

export async function getPromptFiles(
  timestamp: string,
): Promise<{ [key: string]: string }> {
  try {
    const patterns = [
      `${DIR_PATH}/wcag.json`,
      `${RUNS_PATH}/run-${timestamp}/*`,
    ];

    const filePaths = await glob(patterns);

    if (filePaths.length <= 1) {
      throw new Error('Missing uploading files!');
    }

    const promptFiles: { [key: string]: string } = {};

    filePaths.forEach((path) => {
      const content = fs.readFileSync(path, 'utf-8');

      if (path.includes('files')) {
        promptFiles['files_data'] = content;
      } else if (path.includes('axecore')) {
        promptFiles['axecore_data'] = content;
      } else {
        promptFiles['wcag_data'] = content;
      }
    });

    return promptFiles;
  } catch (error) {
    throw error;
  }
}
