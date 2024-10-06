import * as fs from 'fs';
import { getConfig, DIR_PATH, createNewRun } from '@/helpers/config';
import path from 'path';
import { analyse } from '@/helpers/Axecore';
import { getUploadingFiles, runCodeScan } from '@/helpers/CodeBaseScan';
import { createfileLineBreakdown } from '@/helpers/FileLineBreakdown';
import { suggestRepoChanges, uploadFiles } from '@/helpers/ModelHandler';
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
    const results = await analyse(_config?.framework, newRunPath, timestamp);

    const filePaths = await runCodeScan();

    createfileLineBreakdown(filePaths, newRunPath, timestamp);

    if (flag === 'score') {
      return results.score;
    }

    const uploadingFiles = await getUploadingFiles(timestamp);

    await uploadFiles(uploadingFiles);

    const suggestions = await suggestRepoChanges(
      _config.assistantId,
      _config.contextId,
    );

    if (flag === 'report') {
      fs.writeFileSync(
        `${DIR_PATH}/suggestions.json`,
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
