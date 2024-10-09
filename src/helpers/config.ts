import { OpenAI } from 'openai';
import * as fs from 'fs';
import path from 'path';
import _ from 'lodash';
import wcag from '@/data/wcag.json';

interface IConfig {
  framework?: string;
  assistantId?: string;
  contextId?: string;
  rules?: any;
}

export const DIR_PATH = path.join(process.cwd(), '.guidedog');
export const CONFIG_PATH = path.join(DIR_PATH, 'guidedog.config.cjs');
export const RUNS_PATH = path.join(DIR_PATH, 'runs');
export let LATEST_RUN_PATH = '';

export async function initConfig(_config: IConfig) {
  try {
    if (!fs.existsSync(DIR_PATH)) {
      fs.mkdirSync(DIR_PATH);
    }

    if (fs.existsSync(CONFIG_PATH)) {
      let configObj = await import(CONFIG_PATH);
      configObj = _.merge(configObj.default, _config); // Deep merge the configurations

      fs.writeFileSync(
        CONFIG_PATH,
        `module.exports = ${JSON.stringify(configObj, null, 2)};`,
      );
    } else {
      // Write the new config object to the file
      fs.writeFileSync(
        CONFIG_PATH,
        `module.exports = ${JSON.stringify(_config, null, 2)};`,
        { encoding: 'utf-8' },
      );
    }

    fs.writeFileSync(path.join(DIR_PATH, 'wcag.json'), JSON.stringify(wcag), {
      encoding: 'utf-8',
    });
  } catch (error) {
    throw error;
  }
}

export const getConfig = async (): Promise<IConfig> => {
  try {
    const _config: IConfig = (await import(CONFIG_PATH)).default;

    if (!_config) {
      throw new Error('Configuration file can not be found');
    }

    return _config;
  } catch (error) {
    throw error;
  }
};

export async function updateConfig(
  assistant: OpenAI.Beta.Assistants.Assistant,
) {
  // Read existing config or create a new one
  let config: { assistantId: string } = { assistantId: '' }; // TODO: make this a proper config object

  try {
    const existingConfig = fs.readFileSync(CONFIG_PATH, {
      encoding: 'utf8',
    });
    config = JSON.parse(existingConfig);
    // Append assistantId to the config
    config['assistantId'] = assistant.id;

    // Write the updated config back to the file
    fs.writeFileSync(
      DIR_PATH,
      `module.exports = ${JSON.stringify(config, null, 2)};`,
      'utf8',
    );
    console.log('Configuration saved to .guidedog/guidedog.config.cjs');
  } catch (error) {
    console.log('No existing config found, creating a new one.');
  }
}

export function createNewRun() {
  // .toJSON is an easy way to give us YYYY-MM-DD-${time} format to avoid using '/'s as that causes issues for path names
  const timestamp = new Date().toJSON();

  const newRunPath = path.join(
    process.cwd(),
    `.guidedog/runs/run-${timestamp}`,
  );

  try {
    if (!fs.existsSync(newRunPath)) {
      fs.mkdirSync(newRunPath, { recursive: true });
    } else {
      console.log(
        'Run path already exists for this exact time. Returning existing run path.',
      );
    }

    LATEST_RUN_PATH = newRunPath;

    return { timestamp, newRunPath };
  } catch (error) {
    throw error;
  }
}

export async function saveAPIKey(apiKey: string) {
  const envPath = path.join(process.cwd(), '.env');
  const apiKeyEntry = `OPENAI_API_KEY=${apiKey}`;

  if (fs.existsSync(envPath)) {
    const fileContents = fs.readFileSync(envPath, { encoding: 'utf8' });

    if (fileContents.includes('OPENAI_API_KEY=')) {
      const updatedContents = fileContents.replace(
        /OPENAI_API_KEY=.*/,
        apiKeyEntry,
      );
      fs.writeFileSync(envPath, updatedContents, { encoding: 'utf8' });
      console.log('API key updated in .env file.');
    } else {
      fs.appendFileSync(envPath, `\n${apiKeyEntry}`, { encoding: 'utf8' });
      console.log('API key appended to .env file.');
    }
  } else {
    // Create a new .env file and add the API key
    fs.writeFileSync(envPath, apiKeyEntry, { encoding: 'utf8' });
    console.log('.env file created and API key added.');
  }
}

