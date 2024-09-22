#!/usr/bin/env node

import { assessAccessibility, improveSemantics, init } from './index';

const args = process.argv.slice(2);

if (args.length === 1) {
  switch (args[0]) {
    case 'init':
      (async () => {
        try {
          await init();
        } catch (error) {
          console.error('Error:', error);
        } finally {
          process.exit(0);
        }
      })();
      break;

    case 'check':
      async () => {
        try {
          await assessAccessibility(false);
        } catch (error) {
          console.error('Error:', error);
        } finally {
          process.exit(0);
        }
      };
      break;

    case 'fix':
      break;

    default:
      console.error('Invalid command');
      break;
  }
} else if (args.length == 2) {
  switch (args[0]) {
    case 'check':
      if (args[1] == '--report') {
        async () => {
          try {
            await assessAccessibility(true);
          } catch (error) {
            console.error('Error:', error);
          } finally {
            process.exit(0);
          }
        };
      } else {
        console.error('Invalid command');
      }
      break;

    default:
      console.error('Invalid command');
      break;
  }
} else {
  console.error('Invalid command');
}

// if (args.length !== 3) {
//   console.log(
//     'Usage: npx guidedog improveSemantics <htmlFilePath> <openAIApiKey>',
//   );
//   process.exit(1);
// }

// const [command, htmlFilePath, openAIApiKey] = args;

// if (command !== 'improveSemantics' && command !== 'init') {
//   console.log(`Unknown command: ${command}`);
//   console.log(
//     'Usage: npx guidedog improveSemantics <htmlFilePath> <openAIApiKey> OR npx guidedog init',
//   );
//   process.exit(1);
// }

// Check if either argument is undefined or an empty string
// if (!htmlFilePath || !openAIApiKey) {
//   console.error('Both htmlFilePath and openAIApiKey must be provided.');
//   process.exit(1);
// }

// improveSemantics(htmlFilePath, openAIApiKey).catch((error) => {
//   console.error('Error:', error);
// });
