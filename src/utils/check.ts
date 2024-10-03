import * as fs from 'fs';
import { getConfig, DIR_PATH } from '@/helpers/config';
import path from 'path';
import { analyse } from '@/helpers/Axecore';

export async function check(flag: string) {
  try {
    const _config = await getConfig();
    // const apiKey = process.env.OPENAI_API_KEY || 'NOT_FOUND';

    // if (apiKey == 'NOT_FOUND') {
    //   throw 'API Key cannot be found';
    // }

    const results = await analyse(_config?.framework);

    if (flag === 'score') {
      return results.score;
    }

    if (flag === 'report') {
      fs.writeFileSync(
        path.join(DIR_PATH, 'results.json'),
        JSON.stringify(results.axeResults, null, 2),
        'utf8',
      );

      fs.writeFileSync(
        path.join(DIR_PATH, 'score.json'),
        JSON.stringify(results.score, null, 2),
        'utf-8',
      );
    }

    return results;
  } catch (error) {
    throw error;
  } 
}
