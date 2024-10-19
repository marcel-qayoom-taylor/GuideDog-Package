#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import * as dotenv from 'dotenv';
import {
  init,
  check,
  applyAllSuggestions,
  applyFileSuggestions,
} from './index';
import { getSuggestions } from '@/utils/fix';
import { getLatestSuggestion } from './helpers/CodeBaseScan';

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
  .option('--apiKey <key>', 'OpenAI API key')
  .action(async (options) => {
    console.log('Starting init...');
    try {
      let apiKey: string = options.apiKey || process.env.OPENAI_API_KEY || '';

      if (apiKey) {
        console.log(
          'OpenAI API key provided via flag or found in environment variables',
        );
      }

      if (!apiKey) {
        console.log(
          'OpenAI API key not found in environment variables or provided as a flag',
        );
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
  .option('-s, --score', 'Assess accessibility score')
  .action(async (options) => {
    try {
      console.log('Starting check...');

      if (options.score) {
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
  .option('--wholeRepo', 'Fix the whole repository')
  .option('--file <fileName>', 'Fix a specific file')
  .action(async (options) => {
    console.log('Starting fix...');

    try {
      let latestsuggestions =
        (await getLatestSuggestion()) || (await getSuggestions());

      // Check if the --wholeRepo flag is provided
      if (options.wholeRepo) {
        console.log('wholeRepo flag found, fixing the whole repository...');
        await applyAllSuggestions(latestsuggestions);
        console.log('✅ Fix completed!');
        return;
      }

      // Check if the --file flag is provided
      if (options.file) {
        console.log(`File flag found, fixing the file: ${options.file}`);
        await applyFileSuggestions(options.file, latestsuggestions);
        console.log('✅ Fix completed!');
        return;
      }

      const scopeRes = await inquirer.prompt({
        type: 'list',
        name: 'scope',
        message: 'Do you want to fix the whole repository or a specific file?',
        choices: ['Whole repo', 'Specific file'],
      });

      if (scopeRes.scope === 'Specific file') {
        // Prepare choices for the user
        const fileChoices = latestsuggestions.map((file) => ({
          name: file.fileName,
          value: file,
        }));

        const fileRes = await inquirer.prompt({
          type: 'list',
          name: 'file',
          message: 'Select a file to fix:',
          choices: fileChoices,
        });
        await applyFileSuggestions(fileRes.file.fileName, latestsuggestions);
      } else {
        await applyAllSuggestions(latestsuggestions);
      }

      console.log('✅ Fix completed!');
    } catch (error) {
      program.error(`❌ Error during fixing:\n${error}`);
    }
  });

program.parse(process.argv);
