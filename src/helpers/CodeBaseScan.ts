import { glob } from 'glob';
import { readIgnore } from '@/helpers/readIgnore';
import { RUNS_PATH, DIR_PATH } from './config';
import * as fs from 'fs';
import type { Suggestion } from '@/helpers/ModelHandler';

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

export const getLatestSuggestion = async (): Promise<Suggestion[] | null> => {
  try {
    const patterns = [`${RUNS_PATH}/run-*/suggestions.json`]

    const suggetionsPaths = await glob(patterns);
    console.log(suggetionsPaths);
    const latestSuggestionsPath = suggetionsPaths
      .sort((a, b) => {
        const timestampA = extractTimestampFromPath(a);
        const timestampB = extractTimestampFromPath(b);
        return timestampA.getTime() - timestampB.getTime(); // Sort in ascending order
      })
      .pop();

    if (!latestSuggestionsPath)
      return null;

    const fileContent = fs.readFileSync(latestSuggestionsPath, 'utf-8');

    const latestSuggestions:Suggestion[] = JSON.parse(fileContent);
    console.log(latestSuggestionsPath);
    return latestSuggestions;
  } catch (error) {
    throw error;
  }
}

// Helper function to extract and parse ISO 8601 timestamp from the file path
const extractTimestampFromPath = (filePath: string): Date => {
  const match = filePath.split('/').slice(-2, -1)[0]; // Get 'run-{timestamp}' part
  if (!match)
    throw new Error(`Invalid path: ${filePath}`);
  const timestampStr = match.split('run-')[1]; // Extract timestamp part
  if (!timestampStr)
    throw new Error(`Invalid path: ${filePath}`);
  return new Date(timestampStr.replace(/-/g, ':').replace('T', ' ').replace('Z', ''));
};