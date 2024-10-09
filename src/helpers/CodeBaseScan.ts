import { glob } from 'glob';
import { readIgnore } from '@/helpers/readIgnore';
import { RUNS_PATH, DIR_PATH } from './config';

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

    console.log('Scanning completed');
    return filePaths;
  } catch (error) {
    throw error;
  }
}

export async function getUploadingFiles(timestamp: string): Promise<string[]> {
  try {
    const patterns = [
      `${DIR_PATH}/wcag.json`,
      `${RUNS_PATH}/run-${timestamp}/*`,
    ];

    const filePaths = await glob(patterns);

    if (filePaths.length <= 1) {
      throw new Error('Missing uploading files!');
    }

    return filePaths;
  } catch (error) {
    throw error;
  }
}
