import { customProvider } from 'ai';
import { openai } from '@ai-sdk/openai';

export const myProvider = customProvider({
  languageModels: {
    'chat-model': openai('gpt-4o-mini'),
    'title-model': openai('gpt-4o-mini'),
  },
});
