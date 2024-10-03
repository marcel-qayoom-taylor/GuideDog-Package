#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import path from 'path';
import { init, check, fixFile, fixRepo } from './index';
import { DIR_PATH } from './helpers/config';

const program = new Command();
dotenv.config();

program
  .name('guidedog')
  .description(
    'An AI powered code library to assist web-developers create more accessible websites and applications.',
  )
  .version('1.0.0');

program
  .command('init')
  .description('Initialize the accessibility config for the repo')
  .action(async () => {
    console.log('Starting init...');
    try {
      let apiKey: string = process.env.OPENAI_API_KEY || '';

      if (apiKey) {
        console.log('OpenAI API key found in environment variables');

        const useExistingKeyResponse = await inquirer.prompt({
          type: 'confirm',
          name: 'useExistingKey',
          message: 'Do you want to use the existing API key?',
          default: true,
        });

        if (!useExistingKeyResponse.useExistingKey) {
          apiKey = ''; // clear api key so it triggers the next input prompt
        }
      }

      if (!apiKey) {
        console.log('OpenAI API key not found in environment variables');
        const apiKeyResponse = await inquirer.prompt({
          type: 'input',
          name: 'apiKey',
          message: 'Enter your OpenAI API key:',
          validate: (input) => input.length > 0 || 'API key cannot be empty',
        });

        apiKey = apiKeyResponse.apiKey;
      }

      const answers = await inquirer.prompt({
        type: 'list',
        name: 'framework',
        message: 'What framework are you using?',
        choices: ['React', 'Angular', 'Vue', 'Other'],
      });

      await init(apiKey, answers.framework);
      console.log('✅ Init completed!');
    } catch (error) {
      program.error(`❌ Error during initialization:\n${error}`);
    }
  });

program
  .command('check')
  .description('Check accessibility of your project')
  .option('--report', 'Generate a detailed accessibility report')
  .action(async (options) => {
    try {
      console.log('Starting check...');

      await check(options.report);

      console.log('✅ Check completed!');
    } catch (error) {
      program.error(`❌Error during checking:\n${error}`);
      process.exit(0);
    }
  });

// TODO: Add option for fixFile
program
  .command('fix')
  .description('Fix accessibility issues')
  .action(async () => {
    console.log('Starting fix...');

    try {
      const scopeRes = await inquirer.prompt({
        type: 'list',
        name: 'scope',
        message: 'Do you want to fix the whole repository or a specific file?',
        choices: ['Whole repo', 'Specific file']
      });

      if (scopeRes.scope == 'Specific file') {
        const fileRes = await inquirer.prompt({
          type: 'input',
          name: 'filePath',
          message: 'Enter your OpenAI API key:',
          validate: async (input) => {
            const file = path.join(DIR_PATH, input);

            if (fs.existsSync(file)) {
              return input.length > 0 || 'File path cannot be empty';
            }

            return 'File does not exist';
          },
        });

        const file = path.join(DIR_PATH, fileRes.filePath);
        fixFile(file);
      }
      else {
        fixRepo();
      }

      console.log('✅ Fix completed!')
    } catch (error) {
      program.error(`❌ Error during fixing:\n${error}`);
    }
  });

program.parse(process.argv);
