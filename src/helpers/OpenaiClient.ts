import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function createOpenAIClient(): OpenAI {
  try {
    if (!openaiClient) {
      const apiKey = process.env.OPENAI_API_KEY || undefined;

      if (!apiKey) {
        throw new Error('API Key cannot be found');
      }

      openaiClient = new OpenAI({ apiKey });
    } else {
      console.log('OpenAI client already initialized.');
    }
    return openaiClient;
  } catch (error) {
    throw error;
  }
}

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = createOpenAIClient();
  }

  return openaiClient;
}