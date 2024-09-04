#!/usr/bin/env node

import { improveSemantics } from './index';

const args = process.argv.slice(2);

if (args.length !== 3) {
  console.log(
    'Usage: npx guidedog improveSemantics <htmlFilePath> <openAIApiKey>',
  );
  process.exit(1);
}

const [command, htmlFilePath, openAIApiKey] = args;

if (command !== 'improveSemantics') {
  console.log(`Unknown command: ${command}`);
  console.log(
    'Usage: npx guidedog improveSemantics <htmlFilePath> <openAIApiKey>',
  );
  process.exit(1);
}

// Check if either argument is undefined or an empty string
if (!htmlFilePath || !openAIApiKey) {
  console.error('Both htmlFilePath and openAIApiKey must be provided.');
  process.exit(1);
}

improveSemantics(htmlFilePath, openAIApiKey).catch((error) => {
  console.error('Error:', error);
});
