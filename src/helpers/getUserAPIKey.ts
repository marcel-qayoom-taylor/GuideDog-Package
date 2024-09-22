import readline from 'readline';

export async function getUserAPIKey(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let apiKey = '';
  const originalStderr = process.stderr.write.bind(process.stderr);

  try {
    // Temporarily suppress stderr
    process.stderr.write = () => true; // Suppress stderr output

    apiKey = await new Promise<string>((resolve) => {
      rl.question('Enter your OpenAI API key: ', (answer) => {
        resolve(answer.trim());
        rl.close();
      });
    });
  } catch (error) {
    console.error('Error getting API key:', error);
    rl.close();
  } finally {
    // Restore stderr
    process.stderr.write = originalStderr;
    return apiKey;
  }
}
