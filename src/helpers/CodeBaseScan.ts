import { glob } from 'glob';
import { readIgnore } from '@/helpers/readIgnore';
import { RUNS_PATH, DIR_PATH } from './config';
import * as fs from 'fs';

export async function runCodeScan(): Promise<string[]> {
  console.log('Scanning...');
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

export async function getPromptFiles(timestamp: string): Promise<string> {
  try {
    const patterns = [`${RUNS_PATH}/run-${timestamp}/*`];

    const filePaths = await glob(patterns);

    if (!filePaths[0]) {
      throw new Error('Missing uploading files!');
    }

    const files_data = fs.readFileSync(filePaths[0], 'utf-8');

    return files_data;
  } catch (error) {
    throw error;
  }
}
