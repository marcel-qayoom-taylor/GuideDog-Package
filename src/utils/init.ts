import { runCodeScan } from '@/helpers/CodeBaseScan';
import { CreateAssistant } from '@/helpers/ModelHandler';
import { initConfig, saveAPIKey, createNewRun } from '@/helpers/config';
import { createfileLineBreakdown } from '@/helpers/FileLineBreakdown';
import { createOpenAIClient } from '@/helpers/openaiClient';

// Start Generation Here
async function init(apiKey: string, framework: string) {
  try {
    saveAPIKey(apiKey);

    createOpenAIClient();
    // const contextFiles = await runCodeScan();

    // const runPath = await createNewRun();

    // await createfileLineBreakdown(
    //   contextFiles,
    //   runPath,
    // );

    const response = await CreateAssistant();

    const _config = {
      framework: framework,
      assistantId: response.assistant.id,
      contextId: response.contextVectorID,
    };

    await initConfig(_config);
  } catch (error) {
    throw error;
  }
}

export { init };
