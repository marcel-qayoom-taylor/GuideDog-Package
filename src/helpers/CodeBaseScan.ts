import { glob } from 'glob';
import { readIgnore } from '@/helpers/readIgnore';

export async function runCodeScan(): Promise<string[]> {
  console.log('Scanning...');
  const _ignore = readIgnore();
  try {
    const patterns = [
      `**/*.{js,jsx,ts,tsx,html,htm,xhtml,css,scss,less,vue,svelte}`,
    ];
    const filePaths = await glob(patterns, {
      ignore: [
        ..._ignore,
        'node_modules/**',
        '*.json',
        '.next/**',
        'dist/**',
        'build/**',
        'public/**',
      ],
    });

    console.log('✅Scanning completed');
    return filePaths;
  } catch (error) {
    throw error;
  }
}
