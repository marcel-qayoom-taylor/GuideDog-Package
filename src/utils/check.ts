import { AxePuppeteer } from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';
import * as fs from 'fs';
import { exec } from 'child_process';
import { getConfig, DIR_PATH } from '@/helpers/config';
import path from 'path';

const retry = async (
  url: string,
  resolve: any,
  retries: number = 5,
  delay: number = 5000,
) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await new Promise((res) => setTimeout(res, delay));

      const response = await fetch(url);

      if (response.ok) {
        console.log('Build is up and running.');
        resolve();
        return;
      } else {
        console.log(
          `Serving attempt ${attempt + 1} failed: Server is not up yet. Retrying...`,
        );
      }
    } catch (error) {
      console.log(
        `Serving attempt ${attempt + 1} failed: ${error}. Retrying...`,
      );
    }
  }

  throw `Server failed to start after ${retries} attempts.`;
};

const build = async (cmd: string) =>
  new Promise<void>((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(`Build error: ${error}`);
      }
      if (stderr) {
        return reject(`Build stderr: ${stderr}`);
      }
      console.log(`Build stdout: ${stdout}`);
      resolve();
    });
  });

const serveBuild = async (cmd: string) =>
  new Promise<{ serverProcess: any }>((resolve, reject) => {
    const serverProcess = exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(`Serve error: ${error}`);
      }
      if (stderr) {
        return reject(`Serve stderr: ${stderr}`);
      }
      console.log(`Serve stdout: ${stdout}`);
    });

    const url = 'http://localhost:3000/';
    retry(url, () => resolve({ serverProcess })).catch(reject);
  });

const stopServer = (serverProcess: any) => {
  try {
    process.kill(serverProcess.pid + 1, 'SIGTERM');
    process.exit(0);
  } catch (error) {
    throw `Error stopping the server: ${error}`;
  }
};

export async function check(flag: boolean) {
  let serverProcess;

  try {
    const _config = await getConfig();
    switch (_config?.framework) {
      case 'React':
        await build('npm run build');
        ({ serverProcess } = await serveBuild('npx serve -s build -p 3000'));
        break;
      case 'Vue':
        await build('npx vite build');
        ({ serverProcess } = await serveBuild('npx serve -s dist -p 3000'));
        break;
      case 'Angular':
        // await build('npx ng build');
        ({ serverProcess } = await serveBuild('npx ng serve --port 3000'));
        break;
      default:
        throw 'Unsupported framework';
    }

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
    const rawScore = ((0.4 * p2 + 0.8 * p1 + p0) / (p1 + p2 + p0)).toFixed(2);

    // Optionally weight the score
    const weightedScore = 500 + parseFloat(rawScore) * 500.0;
    console.log(`minor: ${p0} | moderate: ${p1} | critical: ${p2}`);
    console.log(`Raw score: ${rawScore} | Weighted score: ${weightedScore}`);

    const score = {
      rawScore,
      weightedScore,
      serious: p2,
      moderate: p1,
      minor: p0,
    };

    if (flag) {
      fs.writeFileSync(
        path.join(DIR_PATH, 'accessibility-results.json'),
        JSON.stringify(results, null, 2),
        'utf8',
      );

      fs.writeFileSync(
        path.join(DIR_PATH, 'accessibility-score.json'),
        JSON.stringify(score, null, 2),
        'utf-8',
      );
    }

    await browser.close();

    const accessibilityResult = { score: score, violation: results.violations };

    return accessibilityResult;
  } catch (error) {
    throw error;
  } finally {
    if (serverProcess) stopServer(serverProcess);
  }
}
