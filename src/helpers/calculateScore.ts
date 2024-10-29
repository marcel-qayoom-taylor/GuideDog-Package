import { Impact, type Suggestion } from '@/helpers/ModelHandler';

export interface Score {
  raw: number;
  weighted: number;
}

export const calculate = (suggestions: Suggestion[]): Score => {
  let p2 = 0; // Serious issues
  let p1 = 0; // Moderate issues
  let p0 = 0; // Minor issues

  suggestions.forEach((file) => {
    file.issues.forEach((issue) => {
      switch (issue.impact) {
        case Impact.serious:
          p2++;
          break;
        case Impact.moderate:
          p1++;
          break;
        case Impact.minor:
          p0++;
          break;
      }
    });
  });

  // Calculate the raw score
  const raw = parseFloat(
    ((0.4 * p2 + 0.8 * p1 + p0) / (p1 + p2 + p0)).toFixed(2),
  );

  // Optionally weight the score
  const weighted = 500 + raw * 500.0;

  return { raw, weighted };
};
