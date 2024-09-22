import { OpenAI } from 'openai';
import * as fs from 'fs/promises';

export async function updateConfig(assistant: OpenAI.Beta.Assistants.Assistant) {
  // Read existing config or create a new one
  let config: { assistantId: string } = { assistantId: '' }; // TODO: make this a proper config object

  try {
    const existingConfig = await fs.readFile('guidedog.config.js', 'utf8');
    config = JSON.parse(existingConfig);
  } catch (error) {
    console.log('No existing config found, creating a new one.');
  }

  // Append assistantId to the config
  config['assistantId'] = assistant.id;

  // Write the updated config back to the file
  await fs.writeFile(
    'guidedog.config.js',
    `module.exports = ${JSON.stringify(config, null, 2)};`,
    'utf8',
  );
  console.log('Configuration saved to guidedog.config.js');
}