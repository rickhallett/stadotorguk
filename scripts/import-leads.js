#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const CSV_PATH = path.join(__dirname, '..', 'leads.csv');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'content', 'leads');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created directory: ${OUTPUT_DIR}`);
}

// Read and parse CSV
console.log('Reading CSV file...');
const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

console.log(`Found ${records.length} records to import`);

// Function to clean and format date
function formatDate(dateStr) {
  // Parse various date formats from the CSV
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date: ${dateStr}`);
    return new Date().toISOString();
  }
  return date.toISOString();
}

// Function to create safe filename
function createFilename(record) {
  const dateStr = record.Timestamp || record['Timestamp'];
  const date = dateStr ? new Date(dateStr) : new Date();
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    // Use current date as fallback
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    // Use submission ID or fallback to sanitized name
    const submissionId = record['Submission ID'] || 
      `${record['First Name']}-${record['Last Name']}-${second}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    return `${year}-${month}-${day}-${hour}${minute}${second}-${submissionId}.md`;
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  // Use submission ID or fallback to sanitized name
  const submissionId = record['Submission ID'] || 
    `${record['First Name']}-${record['Last Name']}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  return `${year}-${month}-${day}-${hour}${minute}-${submissionId}.md`;
}

// Function to escape YAML strings
function escapeYaml(str) {
  if (!str) return '""';
  
  // Trim the string
  str = str.trim();
  
  // Handle multi-line strings with YAML literal block scalar
  if (str.includes('\n')) {
    // Use literal block scalar (|) for multi-line strings
    const lines = str.split('\n').map(line => '  ' + line);
    return '|\n' + lines.join('\n');
  }
  
  // For strings with special YAML characters, use single quotes
  // This includes: quotes, colons, hashes, dashes at start, brackets, etc.
  if (str.includes('"') || 
      str.includes("'") || 
      str.includes(':') || 
      str.includes('#') ||
      str.startsWith('-') ||
      str.startsWith('[') ||
      str.startsWith('{') ||
      str.startsWith('*') ||
      str.startsWith('&') ||
      str.startsWith('!') ||
      str.startsWith('%') ||
      str.startsWith('@') ||
      str.startsWith('`')) {
    // Use single quotes and escape any single quotes inside
    return `'${str.replace(/'/g, "''")}'`;
  }
  
  // For simple strings without special characters
  return `"${str}"`;
}

// Process each record
let successCount = 0;
let errorCount = 0;

records.forEach((record, index) => {
  try {
    // Extract fields
    const timestamp = formatDate(record.Timestamp || record['Timestamp']);
    const userId = record['User ID'] || '';
    const name = record['Name'] || '';
    const firstName = record['First Name'] || '';
    const lastName = record['Last Name'] || '';
    const email = record['Email'] || '';
    // Handle empty visitor type - default to Local
    const visitorType = (record['Visitor Type'] && record['Visitor Type'].trim()) ? record['Visitor Type'].trim() : 'Local';
    const comments = record['Comments'] || '';
    const referralCode = record['Referral Code'] || '';
    const source = record['Source'] || 'survey_modal';
    const submissionId = record['Submission ID'] || `generated-${index}`;
    
    // Create frontmatter
    const frontmatter = `---
timestamp: ${timestamp}
user_id: ${escapeYaml(userId)}
name: ${escapeYaml(name)}
first_name: ${escapeYaml(firstName)}
last_name: ${escapeYaml(lastName)}
email: ${escapeYaml(email)}
visitor_type: ${escapeYaml(visitorType)}
comments: ${escapeYaml(comments)}
referral_code: ${escapeYaml(referralCode)}
source: ${escapeYaml(source)}
submission_id: ${escapeYaml(submissionId)}
published: true
---`;

    // Create filename
    const filename = createFilename(record);
    const filepath = path.join(OUTPUT_DIR, filename);
    
    // Write file
    fs.writeFileSync(filepath, frontmatter);
    successCount++;
    
    if (successCount % 50 === 0) {
      console.log(`Processed ${successCount} records...`);
    }
  } catch (error) {
    console.error(`Error processing record ${index + 1}:`, error.message);
    console.error('Record:', record);
    errorCount++;
  }
});

console.log('\n=== Import Complete ===');
console.log(`✅ Successfully imported: ${successCount} records`);
if (errorCount > 0) {
  console.log(`❌ Failed to import: ${errorCount} records`);
}
console.log(`📁 Files created in: ${OUTPUT_DIR}`);