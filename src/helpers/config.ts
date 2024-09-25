import { OpenAI } from 'openai';
import * as fs from 'fs';
import path from 'path';
import _ from 'lodash';

interface IConfig {
  framework?: string;
  assistantId?: string;
  contextId?: string;
  rules?: any;
}

export async function initConfig(_config: IConfig) {
  const configPath = path.join(process.cwd(), 'guidedog.config.cjs');

  try {
    if (fs.existsSync(configPath)) {
      let configObj = await import(configPath);
      configObj = _.merge(configObj.default, _config); // Deep merge the configurations

      fs.writeFileSync(
        configPath,
        `module.exports = ${JSON.stringify(configObj, null, 2)};`,
      );
    } else {
      // Write the new config object to the file
      fs.writeFileSync(
        configPath,
        `module.exports = ${JSON.stringify(_config, null, 2)};`,
        { encoding: 'utf-8' },
      );
    }
  } catch (error) {
    throw error;
  }
}

export async function updateConfig(
  assistant: OpenAI.Beta.Assistants.Assistant,
) {
  // Read existing config or create a new one
  let config: { assistantId: string } = { assistantId: '' }; // TODO: make this a proper config object

  try {
    const existingConfig = fs.readFileSync('guidedog.config.cjs', {
      encoding: 'utf8',
    });
    config = JSON.parse(existingConfig);
  } catch (error) {
    console.log('No existing config found, creating a new one.');
  }

  // Append assistantId to the config
  config['assistantId'] = assistant.id;

  // Write the updated config back to the file
  fs.writeFileSync(
    'guidedog.config.cjs',
    `module.exports = ${JSON.stringify(config, null, 2)};`,
    'utf8',
  );
  console.log('Configuration saved to guidedog.config.cjs');
}

export async function saveAPIKey(apiKey: string) {
  const envPath = path.join(process.cwd(), '.env');
  const apiKeyEntry = `OPENAI_API_KEY=${apiKey}`;

  if (fs.existsSync(envPath)) {
    const fileContents = fs.readFileSync(envPath, { encoding: 'utf8' });

    if (fileContents.includes('OPENAI_API_KEY=')) {
      const updatedContents = fileContents.replace(/OPENAI_API_KEY=.*/, apiKeyEntry);
      fs.writeFileSync(envPath, updatedContents, { encoding: 'utf8' });
      console.log('API key updated in .env file.');
    }
    else {
      fs.appendFileSync(envPath, `\n${apiKeyEntry}`, { encoding: 'utf8' });
      console.log('API key appended to .env file.');
    }
  } else {
    // Create a new .env file and add the API key
    fs.writeFileSync(envPath, apiKeyEntry, { encoding: 'utf8' });
    console.log('.env file created and API key added.');
  }
}
