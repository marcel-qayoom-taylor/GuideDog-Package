import * as fs from 'fs';
import { DIR_PATH, createNewRun, RUNS_PATH } from '@/helpers/config';
import { getPromptFiles, runCodeScan } from '@/helpers/CodeBaseScan';
import { createfileLineBreakdown } from '@/helpers/FileLineBreakdown';
import { getRepoSuggestions } from '@/helpers/ModelHandler';
import * as dotenv from 'dotenv';
import { calculate } from '@/helpers/calculateScore';

dotenv.config();

export async function check(flag?: string) {
  try {
    console.log('Scanning...');

    const { timestamp, newRunPath } = createNewRun();

    const filePaths = await runCodeScan();

    createfileLineBreakdown(filePaths, newRunPath, timestamp);

    console.log('Scanning completed');

    console.log('Getting suggestions...');

    const promptFiles = await getPromptFiles(timestamp);

    const suggestions = await getRepoSuggestions(promptFiles);

    const score = calculate(suggestions);

    // Write suggestions to guidedog folder
    fs.writeFileSync(
      `${DIR_PATH}/suggestions.json`,
      JSON.stringify(suggestions, null, 2),
      {
        encoding: 'utf8',
        flag: 'w',
      },
    );

    fs.writeFileSync(`${DIR_PATH}/score.json`, JSON.stringify(score, null, 2), {
      encoding: 'utf8',
      flag: 'w',
    });

    // Write suggestions to latest run for historical purposes
    fs.writeFileSync(
      `${RUNS_PATH}/run-${timestamp}/suggestions.json`,
      JSON.stringify(suggestions, null, 2),
      {
        encoding: 'utf8',
        flag: 'w',
      },
    );

    fs.writeFileSync(
      `${RUNS_PATH}/run-${timestamp}/score.json`,
      JSON.stringify(score, null, 2),
      {
        encoding: 'utf8',
        flag: 'w',
      },
    );

    return suggestions;
  } catch (error) {
    throw error;
  }
}
