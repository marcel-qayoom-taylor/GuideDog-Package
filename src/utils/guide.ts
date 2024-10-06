import { SuggestRepoChanges } from '@/helpers/ModelHandler';
import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';
import path from 'path';

export async function fixFile(dir: string) {
  console.log(`fix specific file at [${dir}]`);
}

async function fixRepo() {
  try {
    dotenv.config();
    const apiKey = process.env.OPENAI_API_KEY;
    const directoryPath = path.join(process.cwd(), '.guidedog');
    let configObj = await import(
      path.join(directoryPath, 'guidedog.config.cjs')
    );

    if (apiKey != null) {
      const assistantId = configObj.default.assistantId;
      const contextId = configObj.default.contextId;

      const suggestionList = await SuggestRepoChanges(
        apiKey,
        assistantId,
        contextId,
      );

      return suggestionList;
    } else {
      throw new Error('No API Key found');
    }
  } catch (error) {
    console.log('Error getting suggestions for the Repo: ' + error);
  }
}

export { fixRepo };
