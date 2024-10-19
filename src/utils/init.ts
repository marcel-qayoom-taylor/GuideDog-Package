import { initConfig, saveAPIKey } from '@/helpers/config';

// Start Generation Here
async function init(apiKey: string) {
  try {
    await saveAPIKey(apiKey);

    const _config = {};

    await initConfig(_config);
  } catch (error) {
    throw error;
  }
}

export { init };
