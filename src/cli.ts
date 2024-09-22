import { init, check, fixFile, fixRepo } from './index';

const args = process.argv.slice(2);

if (args.length === 1) {
  switch (args[0]) {
    case 'init':
      await (async () => {
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
      await (async () => {
        try {
          const __report = false;
          check(__report);
        } catch (error) {
          console.error('Error:', error);
        } finally {
          process.exit(0);
        }
      })();
      break;

    case 'fix':
      await (async () => {
        try {
          const __report = false;
          check(__report);
        } catch (error) {
          console.error('Error:', error);
        } finally {
          process.exit(0);
        }
      })();
      break;

    default:
      console.error('Invalid command');
      break;
  }
} else if (args.length == 2) {
  switch (args[0]) {
    case 'check':
      if (args[1] == '--report') {
        await (async () => {
          try {
            const __report = true;
            check(__report);
          } catch (error) {
            console.error('Error:', error);
          } finally {
            process.exit(0);
          }
        })();
      } else {
        console.error('Invalid --flag');
      }
      break;

    default:
      console.error('Invalid command');
      break;
  }
} else if (args.length == 3) {
  switch (args[0]) {
    case 'fix':
      if (args[1] == '--file') {
        await (async () => {
          try {
            const __report = true;
            check(__report);
          } catch (error) {
            console.error('Error:', error);
          } finally {
            process.exit(0);
          }
        })();
      } else {
        console.error('Invalid --flag');
      }
      break;

    default:
      console.error('Invalid command');
      break;
  }
} else {
  console.error('Invalid command');
}
