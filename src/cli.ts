#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import * as dotenv from 'dotenv';
import {
  init,
  check,
  getAllFiles,
  applyAllSuggestions,
  applyFileSuggestions,
} from './index';

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
  .option('-r, --report', 'Generate a detailed accessibility report')
  .option('-s, --score', 'Assess accessibility score')
  .action(async (options) => {
    try {
      console.log('Starting check...');

      if (options.report) {
        await check('report');
      } else if (options.score) {
        await check('score');
      } else {
        await check();
      }

      console.log('✅ Check completed!');
      console.log('Ctrl + C to exit.');
    } catch (error) {
      program.error(`❌Error during checking:\n${error}`);
      process.exit(0);
    }
  });

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
        choices: ['Whole repo', 'Specific file'],
      });

      if (scopeRes.scope === 'Specific file') {
        // Get the list of files with suggestions
        const filesWithSuggestions = getAllFiles();

        // Prepare choices for the user
        const fileChoices = filesWithSuggestions.map((file) => ({
          name: file.fileName,
          value: file,
        }));

        const fileRes = await inquirer.prompt({
          type: 'list',
          name: 'file',
          message: 'Select a file to fix:',
          choices: fileChoices,
        });

        await applyFileSuggestions(fileRes.file.fileName);
      } else {
        await applyAllSuggestions();
      }

      console.log('✅ Fix completed!');
    } catch (error) {
      program.error(`❌ Error during fixing:\n${error}`);
    }
  });

program.parse(process.argv);
