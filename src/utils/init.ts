import { getUserAPIKey } from '@/helpers/getUserAPIKey';
import { runCodeScan } from '@/helpers/CodeBaseScan';
import { CreateAssistant } from '@/helpers/ModelHandler';
import { updateConfig } from '@/helpers/config';

// Start Generation Here
async function init() {
  console.log('Starting init function');

  const apiKey = await getUserAPIKey();

  try {
    const contextFiles = await runCodeScan();

    const assistant = await CreateAssistant(apiKey, contextFiles);

    console.log('Assistant "GuideDog" created successfully:');

    await updateConfig(assistant);

    return assistant;
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw error;
  } finally {
    console.log('Init function completed');
  }
}

export { init };