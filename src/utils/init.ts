import { CreateAssistant } from '@/helpers/ModelHandler';
import { initConfig, saveAPIKey } from '@/helpers/config';
import { createOpenAIClient } from '@/helpers/OpenaiClient';

// Start Generation Here
async function init(apiKey: string, framework: string) {
  try {
    saveAPIKey(apiKey);

    createOpenAIClient();

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
