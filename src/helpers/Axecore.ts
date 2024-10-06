import { AxePuppeteer } from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import path from 'path';
import * as fs from 'fs';

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
      throw new Error(
        `Serving attempt ${attempt + 1} failed: ${error}. Retrying...`,
      );
    }
  }

  throw new Error(`Server failed to start after ${retries} attempts.`);
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
  new Promise<{ serveProcess: any }>((resolve, reject) => {
    const serveProcess = exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(`Serve error: ${error}`);
      }
      if (stderr) {
        return reject(`Serve stderr: ${stderr}`);
      }
      console.log(`Serve stdout: ${stdout}`);
    });

    const url = 'http://localhost:3000/';
    retry(url, () => resolve({ serveProcess })).catch(reject);
  });

const stopProcess = (runningProcess: any) => {
  try {
    process.kill(runningProcess.pid + 1, 'SIGTERM');
  } catch (error) {
    throw new Error(`Error stopping the server: ${error}`);
  }
};

export const analyse = async (
  framework: string | undefined,
  runPath: string,
  timestamp: string,
) => {
  let serveProcess;

  try {
    if (!framework) throw new Error('guidedog.config.cjs cannot be found');

    switch (framework) {
      case 'React':
        await build('npm run build');
        ({ serveProcess } = await serveBuild('npx serve -s build -p 3000'));
        break;
      case 'Vue':
        await build('npx vite build');
        ({ serveProcess } = await serveBuild('npx serve -s dist -p 3000'));
        break;
      case 'Angular':
        // await build('npx ng build');
        ({ serveProcess } = await serveBuild('npx ng serve --port 3000'));
        break;
      default:
        throw new Error('Unsupported framework');
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http://localhost:3000`);

    const results = await new AxePuppeteer(page).analyze();

    let p2 = 0; // Critical and Serious issues
    let p1 = 0; // Moderate issues
    let p0 = 0; // Minor issues

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

    const axeResults = {
      testEngine: results.testEngine,
      testEnvironment: results.testEnvironment,
      timeStamp: results.timestamp,
      url: results.url,
      violation: results.violations,
    };

    await browser.close();

    fs.writeFileSync(
      path.join(runPath, `axecore-${timestamp}.json`),
      JSON.stringify(axeResults, null, 2),
      'utf8',
    );

    return { score, axeResults };
  } catch (error) {
    throw error;
  } finally {
    if (serveProcess) {
      stopProcess(serveProcess);
    }
  }
};
