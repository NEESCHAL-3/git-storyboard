const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseRawDiff, calculateImpactScore, generateChapters } = require('../src/parser');
const { exportHTML, generateMarkdownSummary } = require('../src/exporter');
const demoData = require('../src/demo-data');

console.log('Running GitStoryboard Test Suite...\n');

// 1. Test Diff Parsing
const sampleDiff = `diff --git a/src/index.js b/src/index.js
index 1234567..89abcde 100644
--- a/src/index.js
+++ b/src/index.js
@@ -1,3 +1,5 @@
+const logger = require('./logger');
 function main() {
-  console.log('Hello');
+  logger.info('Hello World');
 }
`;

const parsedFiles = parseRawDiff(sampleDiff);
assert.strictEqual(parsedFiles.length, 1, 'Should parse 1 file from diff');
assert.strictEqual(parsedFiles[0].path, 'src/index.js', 'Path should match');
assert.strictEqual(parsedFiles[0].additions, 2, 'Should count 2 additions');
assert.strictEqual(parsedFiles[0].deletions, 1, 'Should count 1 deletion');
console.log('  [OK] Diff Parsing Test Passed');

// 2. Test Impact Score Calculation
const score = calculateImpactScore(parsedFiles);
assert(typeof score === 'number' && score >= 0 && score <= 100, 'Score should be between 0 and 100');
console.log('  [OK] Impact Score Calculation Test Passed');

// 3. Test Chapter Generation
const chapters = generateChapters(demoData.files);
assert(chapters.length > 0, 'Chapters should be generated');
console.log('  [OK] Chapter Categorization Test Passed');

// 4. Test Export HTML Generator
const exportPath = path.join(__dirname, 'test-output.html');
const resultPath = exportHTML(demoData, exportPath);
assert(fs.existsSync(resultPath), 'Exported HTML file should exist');
const htmlContent = fs.readFileSync(resultPath, 'utf8');
assert(htmlContent.includes('GitStoryboard'), 'HTML content should contain branding');
fs.unlinkSync(resultPath); // Cleanup
console.log('  [OK] HTML Exporter Test Passed');

// 5. Test Markdown Summary Generator
const markdown = generateMarkdownSummary(demoData);
assert(markdown.includes('Summary & Overview'), 'Markdown summary should contain section headers');
console.log('  [OK] Markdown Generator Test Passed');

console.log('\nALL 5 TESTS PASSED SUCCESSFULLY!\n');
