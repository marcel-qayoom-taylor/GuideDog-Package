import { OpenAI } from 'openai';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import readline from 'readline';
import { AxePuppeteer } from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';

interface ImproveSemanticsOptions {
  htmlFilePath: string;
  openAIApiKey: string;
  openAIModel?: string;
  openVSCode?: boolean;
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

const assessAccessibility = async (flag: boolean) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`http://localhost:3000`);

  const results = await new AxePuppeteer(page).analyze();

  let p2 = 0; // Critical and Serious issues
  let p1 = 0; // Moderate issues
  let p0 = 0; // Minor issues

  results.violations.forEach((violation) => {
    violation.nodes.forEach((node) => console.log(node));
  });

  // Count issues by impact
  results.violations.forEach((violation) => {
    switch (violation.impact) {
      case 'critical':
      case 'serious':
        p2 += violation.nodes.length;
        break;
      case 'moderate':
        p1 += violation.nodes.length;
        break;
      case 'minor':
        p0 += violation.nodes.length;
        break;
    }
  });

  // Calculate the raw score
  const rawScore = (0.4 * p2 + 0.8 * p1 + p0) / (p1 + p2 + p0);

  // Optionally weight the score
  const weightedScore = 500 + rawScore * 500.0;
  console.log(`minor: ${p0} | minor: ${p1} | minor: ${p2}`);
  console.log(`Raw score: ${rawScore} | Weighted score: ${weightedScore}`);

  const score = {
    rawScore,
    weightedScore,
    serious: p2,
    moderate: p1,
    minor: p0,
  };

  if (flag) {
    await fs.writeFile(
      'accessibility-results.json',
      JSON.stringify(results, null, 2),
      'utf8',
    );

    await fs.writeFile(
      'accessibility-score.json',
      JSON.stringify(score, null, 2),
      'utf-8',
    );
  }

  await browser.close();

  const accessibilityResult = { score, results };

  return accessibilityResult;
};

// Export functions for use as a module
// export { improveSemantics, improveHtmlSemantics, init, assessAccessibility };
