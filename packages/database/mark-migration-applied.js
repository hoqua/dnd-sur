// Script to mark the current migration as applied
import postgres from 'postgres';
import { config } from 'dotenv';
import { webEnv } from '@dnd-sur/env/web';

config({ path: '../../.env.local' });

const client = postgres(webEnv.POSTGRES_URL);

async function markMigrationApplied() {
  try {
    // Check if migration is already marked as applied
    const existing = await client`
      SELECT * FROM drizzle.__drizzle_migrations 
      WHERE hash = '0000_nosy_sauron'
    `;
    
    if (existing.length > 0) {
      console.log('Migration already marked as applied');
      return;
    }
    
    // Mark the migration as applied
    await client`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES ('0000_nosy_sauron', ${Date.now()})
    `;
    
    console.log('Migration marked as applied successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

markMigrationApplied();