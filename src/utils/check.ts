import * as fs from 'fs';
import {
  getConfig,
  DIR_PATH,
  LATEST_RUN_PATH,
  createNewRun,
} from '@/helpers/config';
import path from 'path';
import { analyse } from '@/helpers/Axecore';
import { getUploadingFiles, runCodeScan } from '@/helpers/CodeBaseScan';
import { createfileLineBreakdown } from '@/helpers/FileLineBreakdown';
import { getRepoSuggestions } from '@/helpers/ModelHandler';
import * as dotenv from 'dotenv';

dotenv.config();

export async function check(flag?: string) {
  try {
    const _config = await getConfig();

    if (!_config) {
      throw new Error('Something wrong with configuration file');
    }

    const { timestamp, newRunPath } = createNewRun();

    // analyse to get axe-core score and violations
    // const results = await analyse(_config?.framework, newRunPath, timestamp);

    const filePaths = await runCodeScan();

    const fileLineBreakdownPath = createfileLineBreakdown(
      filePaths,
      newRunPath,
      timestamp,
    );

    console.log("Getting suggestions...");
    const suggestions = await getRepoSuggestions(fileLineBreakdownPath);

    // if (flag === 'score') {
    //   return results.score;
    // }

    if (flag === 'report') {
      // Write suggestions to guidedog folder
      fs.writeFileSync(
        `${DIR_PATH}/suggestions.json`,
        JSON.stringify(suggestions, null, 2),
        {
          encoding: 'utf8',
          flag: 'w',
        },
      );

      // Write suggestions to latest run for historical purposes
      fs.writeFileSync(
        `${LATEST_RUN_PATH}/suggestions.json`,
        JSON.stringify(suggestions, null, 2),
        {
          encoding: 'utf8',
          flag: 'w',
        },
      );
    }

    return suggestions;
  } catch (error) {
    throw error;
  }
}
