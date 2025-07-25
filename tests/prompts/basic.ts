import type { ModelMessage } from 'ai';

export const TEST_PROMPTS: Record<string, ModelMessage> = {
  USER_SKY: {
    role: 'user',
    content: [{ type: 'text', text: 'Why is the sky blue?' }],
  },
  USER_GRASS: {
    role: 'user',
    content: [{ type: 'text', text: 'Why is grass green?' }],
  },
  USER_THANKS: {
    role: 'user',
    content: [{ type: 'text', text: 'Thanks!' }],
  },
  USER_NEXTJS: {
    role: 'user',
    content: [
      { type: 'text', text: 'What are the advantages of using Next.js?' },
    ],
  },
  USER_IMAGE_ATTACHMENT: {
    role: 'user',
    content: [
      {
        type: 'file',
        mediaType: '...',
        data: '...',
      },
      {
        type: 'text',
        text: 'Who painted this?',
      },
    ],
  },


  GET_WEATHER_CALL: {
    role: 'user',
    content: [
      {
        type: 'text',
        text: "What's the weather in sf?",
      },
    ],
  },
  GET_WEATHER_RESULT: {
    role: 'tool',
    content: [
      {
        type: 'tool-result',
        toolCallId: 'call_456',
        toolName: 'getWeather',
        output: {
          type: 'json',
          value: {
            latitude: 37.763283,
            longitude: -122.41286,
            generationtime_ms: 0.06449222564697266,
            utc_offset_seconds: -25200,
            timezone: 'America/Los_Angeles',
            timezone_abbreviation: 'GMT-7',
            elevation: 18,
            current_units: {
              time: 'iso8601',
              interval: 'seconds',
              temperature_2m: '°C',
            },
            current: {
              time: '2025-03-10T14:00',
              interval: 900,
              temperature_2m: 17,
            },
            daily_units: {
              time: 'iso8601',
              sunrise: 'iso8601',
              sunset: 'iso8601',
            },
            daily: {
              time: [
                '2025-03-10',
                '2025-03-11',
                '2025-03-12',
                '2025-03-13',
                '2025-03-14',
                '2025-03-15',
                '2025-03-16',
              ],
              sunrise: [
                '2025-03-10T07:27',
                '2025-03-11T07:25',
                '2025-03-12T07:24',
                '2025-03-13T07:22',
                '2025-03-14T07:21',
                '2025-03-15T07:19',
                '2025-03-16T07:18',
              ],
              sunset: [
                '2025-03-10T19:12',
                '2025-03-11T19:13',
                '2025-03-12T19:14',
                '2025-03-13T19:15',
                '2025-03-14T19:16',
                '2025-03-15T19:17',
                '2025-03-16T19:17',
              ],
            },
          },
        },
      },
    ],
  },
};
