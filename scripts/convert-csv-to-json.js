import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CSV with semicolon delimiter
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(';');

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    const obj = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });

    data.push(obj);
  }

  return data;
}

// Read CSV
const csvPath = path.join(__dirname, '..', 'data', 'cities.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Convert to JSON
const jsonData = parseCSV(csvContent);

// Write JSON
const jsonPath = path.join(__dirname, '..', 'data', 'cities.json');
fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

console.log(`✅ Converted ${jsonData.length} cities from CSV to JSON`);
console.log(`📄 Output: ${jsonPath}`);
