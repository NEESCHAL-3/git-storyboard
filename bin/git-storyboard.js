#!/usr/bin/env node

const path = require('path');
const { parseGitRepository } = require('../src/parser');
const { startServer } = require('../src/server');
const { exportHTML, generateMarkdownSummary } = require('../src/exporter');
const demoData = require('../src/demo-data');

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
  GitStoryboard CLI
  The interactive PR walkthrough and commit storyboard generator.

  Usage:
    git-storyboard [options]

  Options:
    --demo               Run with demo repository dataset
    --export, -e <path>  Export interactive HTML report (default: storyboard.html)
    --summary, -s        Print markdown PR description to terminal
    --port, -p <number>  Port for local web dashboard (default: 3456)
    --no-open            Do not automatically open browser on server start
    --help, -h           Show this help message
  `);
}

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const isDemo = args.includes('--demo');
const isSummary = args.includes('--summary') || args.includes('-s');
const exportIdx = args.findIndex(a => a === '--export' || a === '-e');
const portIdx = args.findIndex(a => a === '--port' || a === '-p');
const noOpen = args.includes('--no-open');

let port = 3456;
if (portIdx !== -1 && args[portIdx + 1]) {
  port = parseInt(args[portIdx + 1], 10) || 3456;
}

let data;
if (isDemo) {
  console.log('Running in Demo Mode with sample codebase diff dataset...');
  data = demoData;
} else {
  data = parseGitRepository(process.cwd());
}

if (isSummary) {
  console.log('\n' + generateMarkdownSummary(data));
  process.exit(0);
}

if (exportIdx !== -1) {
  const exportPath = args[exportIdx + 1] && !args[exportIdx + 1].startsWith('-') ? args[exportIdx + 1] : 'storyboard.html';
  const savedPath = exportHTML(data, exportPath);
  console.log(`\n[OK] Interactive Storyboard exported successfully to:\n   ${savedPath}\n`);
  process.exit(0);
}

startServer(data, { port, open: !noOpen });
