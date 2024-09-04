import { improveSemantics } from './index';

const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log(
    'Usage: npx guidedog improveSemantics <htmlFilePath> <openAIApiKey>',
  );
  process.exit(1);
}

const [htmlFilePath, openAIApiKey] = args;

// Check if either argument is undefined or an empty string
if (!htmlFilePath || !openAIApiKey) {
  console.error('Both htmlFilePath and openAIApiKey must be provided.');
  process.exit(1);
}

improveSemantics(htmlFilePath, openAIApiKey).catch((error) => {
  console.error('Error:', error);
});
