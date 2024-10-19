import { initConfig, saveAPIKey } from '@/helpers/config';
import { createOpenAIClient } from '@/helpers/OpenaiClient';

// Start Generation Here
async function init(apiKey: string) {
  try {
    saveAPIKey(apiKey);

    createOpenAIClient();

    const _config = {};

    await initConfig(_config);
  } catch (error) {
    throw error;
  }
}

export { init };
