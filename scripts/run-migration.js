#!/usr/bin/env node
/**
 * Manual migration runner for Supabase
 * Run with: node scripts/run-migration.js
 */

const fs = require('fs');
const path = require('path');

// Read the SQL files
const kbTablesSQL = fs.readFileSync(
  path.join(__dirname, '../supabase/migrations/20250113000000_knowledge_base_tables.sql'),
  'utf8'
);

const extendCampaignsSQL = fs.readFileSync(
  path.join(__dirname, '../supabase/migrations/20250113000001_extend_campaigns.sql'),
  'utf8'
);

console.log('✨ Migration SQL files loaded successfully!\n');
console.log('📋 Please run these SQL scripts in your Supabase dashboard:\n');
console.log('1. Go to: https://supabase.com/dashboard/project/sdgkpehhzysjofcpvdbo/sql/new\n');
console.log('2. Copy and paste the contents of:');
console.log('   - supabase/migrations/20250113000000_knowledge_base_tables.sql');
console.log('   - supabase/migrations/20250113000001_extend_campaigns.sql\n');
console.log('3. Click "Run" for each migration\n');
console.log('Alternatively, the SQL is printed below:\n');
console.log('='.repeat(80));
console.log('MIGRATION 1: Knowledge Base Tables');
console.log('='.repeat(80));
console.log(kbTablesSQL);
console.log('\n' + '='.repeat(80));
console.log('MIGRATION 2: Extend Campaigns Table');
console.log('='.repeat(80));
console.log(extendCampaignsSQL);
