#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import { init, check, fixFile, fixRepo } from './index';

const program = new Command();

program
  .name('guidedog')
  .description('An AI powered code library to assist web-developers create more accessible websites and applications.')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize the accessibility config for the repo')
  .action(async () => {
    console.log('Starting init...');
    try {
      // Use Inquirer to prompt the user with OpenAI key input and framework choices
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiKey',
          message: 'Enter your OpenAI API key:',
          validate: (input) => input.length > 0 || 'API key cannot be empty',
        },
        {
          type: 'list',
          name: 'framework',
          message: 'What framework are you using?',
          choices: ['React', 'Angular', 'Vue', 'Other'],
        },
      ]);
  
      await init(answers.apiKey, answers.framework);
      console.log('✅Init completed!');
    } catch (error) {
      program.error(`❌Error during initialization: ${error}`)
    }
  });

program
  .command('check')
  .description('Check accessibility of your project')
  .option('--report', 'Generate a detailed accessibility report')
  .action((options) => {
    check(options.report);
  });

// TODO: Add option for fixFile
program
  .command('fix')
  .description('Fix accessibility issues in a specific file')
  .action(() => {
    fixRepo();
  });

program.parse(process.argv);