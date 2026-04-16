import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple SQL syntax validator
function validateSQLSyntax(sqlContent) {
  const issues = [];
  const warnings = [];
  
  try {
    // Check for basic SQL syntax issues
    const lines = sqlContent.split('\n');
    let inCreateTable = false;
    let tableName = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNumber = i + 1;
      
      // Skip comments and empty lines
      if (line.startsWith('--') || line === '') continue;
      
      // Check for CREATE TABLE statements
      if (line.toUpperCase().includes('CREATE TABLE')) {
        inCreateTable = true;
        const match = line.match(/CREATE TABLE.*?(\w+)/i);
        if (match) tableName = match[1];
      }
      
      // Check for multiple foreign key constraints on same column (problematic)
      if (line.toUpperCase().includes('FOREIGN KEY') && inCreateTable) {
        // Look for previous foreign key constraints in this table
        const tableSection = lines.slice(0, i).join('\n');
        const fkCount = (tableSection.match(/FOREIGN KEY/g) || []).length;
        if (fkCount > 0) {
          issues.push(`Line ${lineNumber}: Multiple foreign key constraints detected in table ${tableName}. This may cause issues if they reference different tables.`);
        }
      }
      
      // Check for proper constraint syntax
      if (line.includes('CONSTRAINT') && !line.includes('UNIQUE') && !line.includes('CHECK') && !line.includes('FOREIGN KEY')) {
        warnings.push(`Line ${lineNumber}: Unusual constraint syntax: ${line}`);
      }
      
      // Check for proper ending
      if (line === ')' && inCreateTable) {
        inCreateTable = false;
        tableName = '';
      }
    }
    
    // Check for common issues
    if (sqlContent.includes('REFERENCES public.provinces(id)') && 
        sqlContent.includes('REFERENCES public.kabupaten(id)')) {
      warnings.push('Schema contains references to both provinces and kabupaten tables. Ensure polymorphic foreign keys are handled properly.');
    }
    
  } catch (error) {
    issues.push(`SQL parsing error: ${error.message}`);
  }
  
  return { issues, warnings };
}

async function validateBPSSchema() {
  try {
    const bpsSchemaPath = path.join(__dirname, 'schema', 'bps_schema.sql');
    
    if (!fs.existsSync(bpsSchemaPath)) {
      console.error('❌ bps_schema.sql file not found');
      return;
    }
    
    console.log('🔍 Validating BPS schema SQL syntax...\n');
    
    const sqlContent = fs.readFileSync(bpsSchemaPath, 'utf8');
    const { issues, warnings } = validateSQLSyntax(sqlContent);
    
    console.log('📋 Validation Results:');
    console.log('====================');
    
    if (issues.length === 0 && warnings.length === 0) {
      console.log('✅ No syntax issues found!');
    }
    
    if (issues.length > 0) {
      console.log('\n❌ Issues Found:');
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
    
    // Check file size and basic stats
    const stats = fs.statSync(bpsSchemaPath);
    console.log(`\n📊 File Statistics:`);
    console.log(`  - File size: ${stats.size} bytes`);
    console.log(`  - Total lines: ${sqlContent.split('\n').length}`);
    console.log(`  - Contains CREATE TABLE: ${sqlContent.includes('CREATE TABLE') ? 'Yes' : 'No'}`);
    console.log(`  - Contains triggers: ${sqlContent.includes('CREATE TRIGGER') ? 'Yes' : 'No'}`);
    console.log(`  - Contains functions: ${sqlContent.includes('CREATE OR REPLACE FUNCTION') ? 'Yes' : 'No'}`);
    
    console.log('\n✅ Schema validation completed!');
    
  } catch (error) {
    console.error('❌ Error validating schema:', error);
  }
}

validateBPSSchema();