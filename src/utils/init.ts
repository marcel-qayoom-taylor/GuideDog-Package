import { runCodeScan } from '@/helpers/CodeBaseScan';
import { CreateAssistant } from '@/helpers/ModelHandler';
import { initConfig, saveAPIKey } from '@/helpers/config';

// Start Generation Here
async function init(apiKey: string, framework: string) {
  try {
    saveAPIKey(apiKey);
    const contextFiles = await runCodeScan();

    const response = await CreateAssistant(apiKey, contextFiles);

    const _config = { framework: framework, assistantId: response.assistant.id, contextId: response.contextVectorID};

    await initConfig(_config);

  } catch (error) {
    throw error;
  }
}

export { init };
