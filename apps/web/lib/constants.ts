import { generateDummyPassword } from '@dnd-sur/database';

export const isProductionEnvironment = process.env.NODE_ENV === 'production';
export const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';



export const DUMMY_PASSWORD = generateDummyPassword();
