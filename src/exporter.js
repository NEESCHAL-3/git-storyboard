const fs = require('fs');
const path = require('path');
const { renderHTMLTemplate } = require('./web/template');

/**
 * Export standalone interactive HTML report file.
 */
function exportHTML(data, outputPath = 'storyboard.html') {
  const jsonString = JSON.stringify(data);
  const html = renderHTMLTemplate(jsonString);
  const absolutePath = path.resolve(process.cwd(), outputPath);
  fs.writeFileSync(absolutePath, html, 'utf8');
  return absolutePath;
}

/**
 * Print PR Markdown summary to stdout.
 */
function generateMarkdownSummary(data) {
  return `## ${data.summary.title}

### Summary & Overview
${data.summary.overview}

### Key Architectural Changes
${data.summary.keyChanges.map(c => `- ${c}`).join('\n')}

### Breaking Changes & Removals
${data.summary.breakingChanges.length ? data.summary.breakingChanges.map(b => `- ${b}`).join('\n') : '_None_'}

### Codebase Impact Assessment
- **Impact Score**: ${data.meta.impactScore}/100
- **Risk Rating**: ${data.meta.riskLevel}
- **Total Churn**: +${data.meta.additions} / -${data.meta.deletions} lines across ${data.meta.totalFiles} file(s)

---
*Generated with [GitStoryboard](https://github.com/NEESCHAL-3/git-storyboard)*
`;
}

module.exports = {
  exportHTML,
  generateMarkdownSummary
};
