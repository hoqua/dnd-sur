"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrate = void 0;
const dotenv_1 = require("dotenv");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const migrator_1 = require("drizzle-orm/postgres-js/migrator");
const postgres_1 = __importDefault(require("postgres"));
(0, dotenv_1.config)({
    path: '.env.local',
});
const runMigrate = async () => {
    if (!process.env.POSTGRES_URL) {
        console.log('⚠️  POSTGRES_URL is not defined, skipping migration');
        return;
    }
    const connection = (0, postgres_1.default)(process.env.POSTGRES_URL, { max: 1 });
    const db = (0, postgres_js_1.drizzle)(connection);
    console.log('⏳ Running migrations...');
    const start = Date.now();
    await (0, migrator_1.migrate)(db, { migrationsFolder: './src/migrations' });
    const end = Date.now();
    console.log('✅ Migrations completed in', end - start, 'ms');
    await connection.end();
};
exports.runMigrate = runMigrate;
// CLI runner
if (require.main === module) {
    (0, exports.runMigrate)().catch((err) => {
        console.error('❌ Migration failed');
        console.error(err);
        process.exit(1);
    });
}
