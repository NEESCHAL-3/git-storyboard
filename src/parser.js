const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const demoData = require('./demo-data');

/**
 * Calculates Code Impact Score (0-100) based on churn, critical paths, and diff complexity.
 */
function calculateImpactScore(files) {
  let totalAdditions = 0;
  let totalDeletions = 0;
  let score = 0;

  files.forEach(file => {
    totalAdditions += file.additions;
    totalDeletions += file.deletions;

    // Weight critical files higher
    if (file.path.match(/(package\.json|go\.mod|Cargo\.toml|docker-compose|\.env|schema|auth|db|config)/i)) {
      score += 15;
    } else if (file.path.match(/(test|spec|doc|README)/i)) {
      score += 3;
    } else {
      score += 8;
    }
  });

  const totalLinesChanged = totalAdditions + totalDeletions;
  if (totalLinesChanged > 500) score += 35;
  else if (totalLinesChanged > 200) score += 25;
  else if (totalLinesChanged > 50) score += 15;
  else score += 5;

  return Math.min(99, Math.max(12, score));
}

/**
 * Categorizes files into semantic Story Chapters.
 */
function generateChapters(files) {
  const categories = {
    "Architecture & Core": [],
    "Security & Auth": [],
    "Database & API": [],
    "Frontend & UI": [],
    "Configuration & Infra": [],
    "Tests & Documentation": [],
    "Other Changes": []
  };

  files.forEach(file => {
    const p = file.path.toLowerCase();
    if (p.includes('auth') || p.includes('security') || p.includes('jwt') || p.includes('permission')) {
      categories["Security & Auth"].push(file.path);
    } else if (p.includes('db') || p.includes('sql') || p.includes('api') || p.includes('graphql') || p.includes('router')) {
      categories["Database & API"].push(file.path);
    } else if (p.includes('view') || p.includes('ui') || p.includes('component') || p.endsWith('.css') || p.endsWith('.tsx') || p.endsWith('.vue')) {
      categories["Frontend & UI"].push(file.path);
    } else if (p.includes('config') || p.includes('package') || p.includes('docker') || p.endsWith('.json') || p.endsWith('.yaml') || p.endsWith('.yml')) {
      categories["Configuration & Infra"].push(file.path);
    } else if (p.includes('test') || p.includes('spec') || p.endsWith('.md') || p.includes('doc')) {
      categories["Tests & Documentation"].push(file.path);
    } else if (p.includes('core') || p.includes('service') || p.includes('engine') || p.includes('util') || p.endsWith('.ts') || p.endsWith('.js') || p.endsWith('.go') || p.endsWith('.rs') || p.endsWith('.py')) {
      categories["Architecture & Core"].push(file.path);
    } else {
      categories["Other Changes"].push(file.path);
    }
  });

  const chapters = [];
  let index = 1;
  for (const [title, chapterFiles] of Object.entries(categories)) {
    if (chapterFiles.length > 0) {
      chapters.push({
        id: `chapter-${index++}`,
        title,
        category: title,
        description: `Changes affecting ${chapterFiles.length} file(s) in ${title.toLowerCase()}`,
        files: chapterFiles
      });
    }
  }

  return chapters;
}

/**
 * Detect file programming language from path.
 */
function detectLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'jsx',
    '.tsx': 'tsx',
    '.py': 'python',
    '.go': 'go',
    '.rs': 'rust',
    '.java': 'java',
    '.html': 'html',
    '.css': 'css',
    '.json': 'json',
    '.md': 'markdown',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.sh': 'bash'
  };
  return map[ext] || 'plaintext';
}

/**
 * Parses raw git diff text into structured files array.
 */
function parseRawDiff(diffText) {
  if (!diffText || !diffText.trim()) return [];

  const rawFileDiffs = diffText.split(/^diff --git /m).filter(Boolean);
  const files = [];

  rawFileDiffs.forEach(rawDiff => {
    const lines = rawDiff.split('\n');
    const headerLine = lines[0];
    const match = headerLine.match(/a\/(.+?)\s+b\/(.+)/);
    const filePath = match ? match[2] : headerLine.split(' ').pop();

    let additions = 0;
    let deletions = 0;
    let status = 'modified';

    if (rawDiff.includes('new file mode')) status = 'added';
    else if (rawDiff.includes('deleted file mode')) status = 'deleted';

    const hunks = [];
    let currentHunk = null;

    lines.forEach(line => {
      if (line.startsWith('@@')) {
        if (currentHunk) hunks.push(currentHunk);
        currentHunk = { header: line, content: '' };
      } else if (currentHunk) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          additions++;
          currentHunk.content += line + '\n';
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          deletions++;
          currentHunk.content += line + '\n';
        } else {
          currentHunk.content += line + '\n';
        }
      }
    });

    if (currentHunk) hunks.push(currentHunk);

    files.push({
      path: filePath,
      status,
      additions,
      deletions,
      language: detectLanguage(filePath),
      hunks
    });
  });

  return files;
}

/**
 * Extracts dependency links between changed files.
 */
function extractDependencies(files) {
  const filePaths = new Set(files.map(f => f.path));
  const fileBasenames = new Map();
  files.forEach(f => {
    const base = path.basename(f.path, path.extname(f.path));
    fileBasenames.set(base, f.path);
  });

  const dependencies = [];

  files.forEach(file => {
    file.hunks.forEach(hunk => {
      const content = hunk.content;
      fileBasenames.forEach((targetPath, baseName) => {
        if (targetPath !== file.path && content.includes(baseName)) {
          dependencies.push({
            source: file.path,
            target: targetPath,
            type: file.path.includes('test') ? 'tests' : 'imports'
          });
        }
      });
    });
  });

  return dependencies;
}

/**
 * Main Git Inspection Function.
 */
function parseGitRepository(cwd = process.cwd(), targetBranch = 'main') {
  try {
    // Verify if in a git repo
    execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: 'ignore' });
  } catch (err) {
    console.log('[Notice] Not inside a Git repository. Falling back to Demo Storyboard mode.');
    return demoData;
  }

  let repoName = path.basename(cwd);
  let branch = 'main';
  let commitHash = 'head';
  let author = 'Developer';
  let date = new Date().toISOString();

  try {
    branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd }).toString().trim();
    commitHash = execSync('git rev-parse --short HEAD', { cwd }).toString().trim();
    author = execSync('git log -1 --format="%an <%ae>"', { cwd }).toString().trim();
    date = execSync('git log -1 --format="%cd" --date=iso', { cwd }).toString().trim();
    const gitRemote = execSync('git config --get remote.origin.url', { cwd }).toString().trim();
    if (gitRemote) {
      const parsedRepo = gitRemote.split('/').pop().replace(/\.git$/, '');
      if (parsedRepo) repoName = parsedRepo;
    }
  } catch (e) {
    // Ignore git command errors for optional metadata
  }

  let rawDiff = '';
  try {
    // Try diff against staged & un-staged changes, or targetBranch / previous commit
    rawDiff = execSync(`git diff ${targetBranch}...HEAD`, { cwd }).toString();
    if (!rawDiff.trim()) {
      rawDiff = execSync(`git diff HEAD~1`, { cwd }).toString();
    }
    if (!rawDiff.trim()) {
      rawDiff = execSync(`git diff`, { cwd }).toString();
    }
    if (!rawDiff.trim()) {
      rawDiff = execSync(`git diff --staged`, { cwd }).toString();
    }
  } catch (e) {
    try {
      rawDiff = execSync(`git diff HEAD~1`, { cwd }).toString();
    } catch (e2) {
      // Fallback
    }
  }

  const files = parseRawDiff(rawDiff);

  if (files.length === 0) {
    console.log('[Info] No uncommitted changes or branch diff found. Serving Demo Storyboard.');
    return demoData;
  }

  let totalAdditions = 0;
  let totalDeletions = 0;
  files.forEach(f => {
    totalAdditions += f.additions;
    totalDeletions += f.deletions;
  });

  const impactScore = calculateImpactScore(files);
  const chapters = generateChapters(files);
  const dependencies = extractDependencies(files);

  let riskLevel = "Low Risk (Standard Patch)";
  if (impactScore > 75) riskLevel = "High Risk (Core Subsystem Refactor)";
  else if (impactScore > 45) riskLevel = "Moderate Risk (Feature Addition)";

  return {
    meta: {
      repoName,
      branch,
      targetBranch,
      commitHash,
      author,
      date,
      totalFiles: files.length,
      additions: totalAdditions,
      deletions: totalDeletions,
      impactScore,
      riskLevel
    },
    summary: {
      title: `PR: Updates in ${branch}`,
      overview: `Changes spanning ${files.length} file(s) across ${chapters.length} structural chapter(s).`,
      keyChanges: chapters.map(c => `Updated ${c.title} (${c.files.length} file(s))`),
      breakingChanges: files.filter(f => f.status === 'deleted').map(f => `Removed file: ${f.path}`),
      testingInstructions: "Run existing test suite and verify modified functionality."
    },
    chapters,
    files,
    dependencies
  };
}

module.exports = {
  parseGitRepository,
  calculateImpactScore,
  generateChapters,
  parseRawDiff
};
