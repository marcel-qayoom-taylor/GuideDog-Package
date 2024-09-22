import { OpenAI } from 'openai';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import readline from 'readline';
import { runCodeScan } from './CodeBaseScan';
import { CreateAssistant } from './ModelHandler';
interface ImproveSemanticsOptions {
  htmlFilePath: string;
  openAIApiKey: string;
  openAIModel?: string;
  openVSCode?: boolean;
}

// Start Generation Here
async function init() {
  console.log('Starting init function');

  const apiKey = await GetUserAPIKey();

  try {
    const contextFiles = await runCodeScan();

    const assistant = await CreateAssistant(apiKey, contextFiles);

    console.log('Assistant "GuideDog" created successfully:');

    await UpdateConfig(assistant, apiKey);

    return assistant;
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw error;
  } finally {
    console.log('Init function completed');
  }
}

async function Check (){ // Axe-Core

}

async function FixFile(){

}

async function FixRepo(){
  try{
    
  }
  catch(error){
    console.log("Error getting suggestions for the Repo: " + error);
  }
}

async function UpdateConfig(assistant: OpenAI.Beta.Assistants.Assistant, apiKey: string){
  // Read existing config or create a new one
  let config: { assistantId: string; apiKey: string } = { assistantId: '', apiKey: '' };

  try {
    const existingConfig = await fs.readFile('guidedog.config.js', 'utf8');
    config = JSON.parse(existingConfig);
  } catch (error) {
    console.log('No existing config found, creating a new one.');
  }

  // Append assistantId to the config
  config['assistantId'] = assistant.id;
  config['apiKey'] = apiKey;

  // Write the updated config back to the file
  await fs.writeFile(
    'guidedog.config.js',
    `module.exports = ${JSON.stringify(config, null, 2)};`,
    'utf8',
  );
  console.log('Configuration saved to guidedog.config.js');
}

async function GetUserAPIKey(): Promise<string>{
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
//Old Functions
async function improveHtmlSemantics({
  htmlFilePath,
  openAIApiKey,
  openAIModel = 'gpt-4o-mini',
  openVSCode = true,
}: ImproveSemanticsOptions): Promise<string> {
  const client = new OpenAI({ apiKey: openAIApiKey });

  try {
    const htmlContent = await fs.readFile(htmlFilePath, 'utf8');

    const prompt = `Please make the following HTML more semantic and accessible. Consider using header tags instead of just <p> or using <section>/<article> instead of <div> where appropriate. Do not response with any other words or content EXCEPT for the html code. This is extremely important. The file returned should be runnable as HTML code. E.g. shouldn't include dash tags. The first and final tag should be the first and final tag provided by the original html content e.g. <!doctype html>. Please do not write backticks at the start or end. e.g. backtick backtick backtick html which is commonly used by ai to display code nicely. please dont do this. Here is the HTML content:\n\n${htmlContent}`;

    const completion = await client.chat.completions.create({
      model: openAIModel,
      messages: [
        {
          role: 'system',
          content:
            'You are a front-end developer that is an expert in semantic HTML. You are helping a colleague improve the semantic structure of their HTML code to make it more accessible. You are not allowed to change any content or words in the HTML code except for the HTML tags and the attributes of those tags. You can also add new tags or attributes where necessary.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const improvedHtml = completion.choices?.[0]?.message?.content || '';

    if (!improvedHtml) {
      throw new Error('No improved HTML was returned.');
    }

    await fs.writeFile(htmlFilePath, improvedHtml, 'utf8');

    console.log(`The file ${htmlFilePath} has been updated successfully.`);

    if (openVSCode) {
      exec(`git difftool ${htmlFilePath}`, (error, stdout, stderr) => {
        if (error) {
          console.log(
            'Failed to open VSCode with git difftool. Make sure git is installed and configured correctly.',
          );
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(
          `Opened working tree changes for ${htmlFilePath} in VSCode.`,
        );
      });
    }

    return improvedHtml;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

async function improveSemantics(htmlFilePath: string, openAIApiKey: string) {
  try {
    const improvedHtml = await improveHtmlSemantics({
      htmlFilePath,
      openAIApiKey,
      openAIModel: 'gpt-4o-mini',
      openVSCode: true,
    });

    console.log('HTML semantics improved successfully.');
  } catch (error) {
    console.error('Error improving HTML:', error);
  }
}

// Export functions for use as a module
export { improveSemantics, improveHtmlSemantics, init };
