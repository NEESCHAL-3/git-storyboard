/**
 * Single-file standalone HTML Template Generator for GitStoryboard.
 */
function renderHTMLTemplate(dataJsonString) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitStoryboard | Interactive PR Walkthrough & Impact Analyzer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #090d16;
      --bg-card: rgba(22, 29, 44, 0.75);
      --bg-card-hover: rgba(30, 41, 59, 0.85);
      --border-color: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(99, 102, 241, 0.3);
      --primary: #6366f1;
      --primary-glow: rgba(99, 102, 241, 0.4);
      --accent-cyan: #06b6d4;
      --accent-emerald: #10b981;
      --accent-amber: #f59e0b;
      --accent-rose: #f43f5e;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --diff-add-bg: rgba(16, 185, 129, 0.12);
      --diff-add-text: #34d399;
      --diff-del-bg: rgba(244, 63, 94, 0.12);
      --diff-del-text: #fb7185;
      --font-ui: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-code: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.1) 0px, transparent 50%);
      color: var(--text-main);
      font-family: var(--font-ui);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
      padding-bottom: 60px;
    }

    /* Scrollbar Styling */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: var(--bg-dark); }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }

    /* Top Navigation Header */
    header {
      backdrop-filter: blur(16px);
      background: rgba(15, 23, 42, 0.8);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, var(--primary), var(--accent-cyan));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px var(--primary-glow);
      font-weight: 800;
      font-size: 20px;
      color: white;
    }

    .logo-text h1 {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(to right, #ffffff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .logo-text p {
      font-size: 11px;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }

    .nav-tabs {
      display: flex;
      background: rgba(30, 41, 59, 0.6);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      gap: 4px;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 8px 16px;
      border-radius: 8px;
      font-family: var(--font-ui);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tab-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
    }

    .tab-btn.active {
      background: var(--primary);
      color: white;
      box-shadow: 0 2px 10px var(--primary-glow);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 8px 16px;
      border-radius: 8px;
      font-family: var(--font-ui);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), #4f46e5);
      border: none;
      color: white;
      box-shadow: 0 4px 14px var(--primary-glow);
    }

    .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    /* Main Container */
    main {
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      padding: 32px 24px;
      flex: 1;
    }

    /* Hero Metadata Banner */
    .hero-banner {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(12px);
      border-radius: 20px;
      padding: 24px 32px;
      margin-bottom: 28px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .repo-info h2 {
      font-size: 24px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      font-family: var(--font-code);
    }

    .badge-branch { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
    .badge-commit { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; }
    .badge-risk { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }

    .meta-metrics {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .metric-box {
      text-align: center;
    }

    .metric-value {
      font-size: 22px;
      font-weight: 700;
      font-family: var(--font-code);
    }

    .metric-label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .text-add { color: var(--accent-emerald); }
    .text-del { color: var(--accent-rose); }
    .text-primary { color: var(--primary); }

    /* Impact Score Meter */
    .impact-meter {
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(15, 23, 42, 0.6);
      padding: 10px 18px;
      border-radius: 14px;
      border: 1px solid var(--border-color);
    }

    .impact-score-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: conic-gradient(var(--primary) var(--score-pct), #1e293b 0deg);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .impact-score-circle::before {
      content: '';
      position: absolute;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--bg-dark);
    }

    .impact-score-val {
      position: relative;
      font-size: 14px;
      font-weight: 800;
      font-family: var(--font-code);
    }

    /* Tab Content Section */
    .tab-content {
      display: none;
      animation: fadeIn 0.3s ease;
    }

    .tab-content.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Storyboard Grid Layout */
    .storyboard-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 24px;
    }

    .chapter-sidebar {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .chapter-card {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid transparent;
      padding: 14px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .chapter-card:hover {
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .chapter-card.active {
      background: rgba(99, 102, 241, 0.15);
      border-color: var(--primary);
    }

    .chapter-title {
      font-weight: 600;
      font-size: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .file-count-badge {
      font-size: 11px;
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 8px;
      border-radius: 10px;
      color: var(--text-muted);
    }

    .storyboard-viewer {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 24px;
    }

    .chapter-header {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 16px;
      margin-bottom: 20px;
    }

    .chapter-header h3 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
    }

    .chapter-header p {
      color: var(--text-muted);
      font-size: 13px;
      margin-top: 4px;
    }

    /* Diff View Styling */
    .file-diff-box {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      margin-bottom: 20px;
      overflow: hidden;
    }

    .file-diff-header {
      background: rgba(30, 41, 59, 0.7);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: var(--font-code);
      font-size: 13px;
    }

    .file-path {
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .diff-code-table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-code);
      font-size: 12px;
    }

    .diff-line {
      white-space: pre-wrap;
      word-break: break-all;
      padding: 2px 12px;
      line-height: 1.6;
    }

    .diff-line-add { background: var(--diff-add-bg); color: var(--diff-add-text); }
    .diff-line-del { background: var(--diff-del-bg); color: var(--diff-del-text); }
    .diff-hunk-header { background: rgba(99, 102, 241, 0.1); color: #a5b4fc; padding: 4px 12px; font-weight: 600; }

    /* Graph Canvas */
    #graph-container {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      height: 600px;
      position: relative;
      overflow: hidden;
    }

    canvas { display: block; width: 100%; height: 100%; }

    /* PR Generator Panel */
    .pr-gen-container {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 24px;
    }

    textarea.markdown-output {
      width: 100%;
      height: 400px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      color: var(--text-main);
      font-family: var(--font-code);
      font-size: 13px;
      padding: 16px;
      resize: vertical;
      margin-top: 16px;
    }

    textarea.markdown-output:focus {
      outline: none;
      border-color: var(--primary);
    }

    /* Annotation Modal / Drawer */
    .annotation-box {
      background: rgba(99, 102, 241, 0.08);
      border-left: 3px solid var(--primary);
      padding: 10px 14px;
      margin: 8px 12px;
      border-radius: 0 8px 8px 0;
      font-size: 12px;
      color: #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--accent-emerald);
      color: white;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 1000;
    }

    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }
  </style>
</head>
<body>

  <!-- Top Navigation Header -->
  <header>
    <div class="logo-container">
      <div class="logo-icon">S</div>
      <div class="logo-text">
        <h1>GitStoryboard</h1>
        <p>PR WALKTHROUGH & IMPACT INTELLIGENCE</p>
      </div>
    </div>

    <nav class="nav-tabs">
      <button class="tab-btn active" onclick="switchTab('storyboard')">
        Storyboard
      </button>
      <button class="tab-btn" onclick="switchTab('graph')">
        Impact Graph
      </button>
      <button class="tab-btn" onclick="switchTab('diff')">
        Code Diff
      </button>
      <button class="tab-btn" onclick="switchTab('pr-gen')">
        PR Summary
      </button>
    </nav>

    <div class="header-actions">
      <button class="btn" onclick="addCustomAnnotation()">Add Note</button>
      <button class="btn btn-primary" onclick="exportStandaloneHTML()">Export HTML</button>
    </div>
  </header>

  <!-- Main Workspace -->
  <main>
    <!-- Hero Banner -->
    <div class="hero-banner">
      <div class="repo-info">
        <h2>
          <span id="meta-repo">repo</span>
          <span class="badge badge-branch" id="meta-branch">main</span>
          <span class="badge badge-commit" id="meta-commit">#head</span>
        </h2>
        <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
          Author: <span id="meta-author">Dev</span> &bull; <span id="meta-date">Today</span>
        </p>
      </div>

      <div class="meta-metrics">
        <div class="metric-box">
          <div class="metric-value text-add" id="meta-additions">+0</div>
          <div class="metric-label">Additions</div>
        </div>
        <div class="metric-box">
          <div class="metric-value text-del" id="meta-deletions">-0</div>
          <div class="metric-label">Deletions</div>
        </div>
        <div class="metric-box">
          <div class="metric-value text-primary" id="meta-files">0</div>
          <div class="metric-label">Files</div>
        </div>

        <div class="impact-meter">
          <div class="impact-score-circle" id="score-circle" style="--score-pct: 0deg;">
            <span class="impact-score-val" id="score-val">0</span>
          </div>
          <div>
            <div style="font-size: 12px; font-weight: 700;">IMPACT SCORE</div>
            <div id="meta-risk" style="font-size: 11px; color: var(--accent-amber);">Calculating...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 1: STORYBOARD -->
    <div id="tab-storyboard" class="tab-content active">
      <div class="storyboard-layout">
        <!-- Chapter Navigation Sidebar -->
        <div class="chapter-sidebar" id="chapter-list">
          <!-- Dynamic Chapter Cards -->
        </div>

        <!-- Chapter Detail & Hunks -->
        <div class="storyboard-viewer" id="chapter-viewer">
          <div class="chapter-header">
            <h3 id="current-chapter-title">Select a Chapter</h3>
            <p id="current-chapter-desc">Explore the walk-through of changes by logical architectural section.</p>
          </div>
          <div id="chapter-files-container">
            <!-- Dynamic Diff Cards -->
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: IMPACT GRAPH -->
    <div id="tab-graph" class="tab-content">
      <div id="graph-container">
        <canvas id="impactCanvas"></canvas>
      </div>
    </div>

    <!-- TAB 3: CODE DIFF -->
    <div id="tab-diff" class="tab-content">
      <div style="margin-bottom: 16px; display: flex; gap: 12px;">
        <input type="text" id="diff-search" placeholder="Filter files by name or extension..." oninput="filterDiffFiles()" style="background: var(--bg-card); border: 1px solid var(--border-color); color: white; padding: 10px 16px; border-radius: 10px; width: 300px; font-family: var(--font-ui);">
      </div>
      <div id="all-diffs-container">
        <!-- Render all file diffs -->
      </div>
    </div>

    <!-- TAB 4: PR GENERATOR -->
    <div id="tab-pr-gen" class="tab-content">
      <div class="pr-gen-container">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3>Automated PR Markdown Generator</h3>
            <p style="color: var(--text-muted); font-size: 13px;">Copy and paste this structured summary directly into your GitHub Pull Request description.</p>
          </div>
          <button class="btn btn-primary" onclick="copyPRMarkdown()">Copy Markdown</button>
        </div>
        <textarea id="pr-markdown-text" class="markdown-output" readonly></textarea>
      </div>
    </div>
  </main>

  <div id="toast" class="toast">Action completed!</div>

  <script>
    // Embed parsed JSON data
    const DATA = ${dataJsonString};
    let activeChapterId = DATA.chapters[0] ? DATA.chapters[0].id : null;
    let annotations = JSON.parse(localStorage.getItem('git_storyboard_notes') || '{}');

    // Initialize UI
    document.addEventListener('DOMContentLoaded', () => {
      renderMetadata();
      renderChaptersSidebar();
      if (activeChapterId) renderChapterContent(activeChapterId);
      renderAllDiffs();
      generatePRMarkdownText();
      initImpactGraph();
    });

    function renderMetadata() {
      document.getElementById('meta-repo').innerText = DATA.meta.repoName;
      document.getElementById('meta-branch').innerText = DATA.meta.branch;
      document.getElementById('meta-commit').innerText = '#' + DATA.meta.commitHash;
      document.getElementById('meta-author').innerText = DATA.meta.author;
      document.getElementById('meta-date').innerText = new Date(DATA.meta.date).toLocaleDateString();
      document.getElementById('meta-additions').innerText = '+' + DATA.meta.additions;
      document.getElementById('meta-deletions').innerText = '-' + DATA.meta.deletions;
      document.getElementById('meta-files').innerText = DATA.meta.totalFiles;
      
      const score = DATA.meta.impactScore;
      document.getElementById('score-val').innerText = score;
      document.getElementById('score-circle').style.setProperty('--score-pct', (score * 3.6) + 'deg');
      document.getElementById('meta-risk').innerText = DATA.meta.riskLevel;
    }

    function renderChaptersSidebar() {
      const container = document.getElementById('chapter-list');
      container.innerHTML = '';

      DATA.chapters.forEach((chap, idx) => {
        const div = document.createElement('div');
        div.className = \`chapter-card \${chap.id === activeChapterId ? 'active' : ''}\`;
        div.onclick = () => selectChapter(chap.id);
        div.innerHTML = \`
          <div class="chapter-title">
            <span>\${idx + 1}. \${chap.title}</span>
            <span class="file-count-badge">\${chap.files.length} files</span>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">\${chap.description}</div>
        \`;
        container.appendChild(div);
      });
    }

    function selectChapter(chapId) {
      activeChapterId = chapId;
      renderChaptersSidebar();
      renderChapterContent(chapId);
    }

    function renderChapterContent(chapId) {
      const chap = DATA.chapters.find(c => c.id === chapId);
      if (!chap) return;

      document.getElementById('current-chapter-title').innerText = chap.title;
      document.getElementById('current-chapter-desc').innerText = chap.description;

      const container = document.getElementById('chapter-files-container');
      container.innerHTML = '';

      const matchedFiles = DATA.files.filter(f => chap.files.includes(f.path));
      matchedFiles.forEach(file => {
        container.appendChild(createFileDiffElement(file));
      });
    }

    function createFileDiffElement(file) {
      const box = document.createElement('div');
      box.className = 'file-diff-box';
      
      const fileNotes = annotations[file.path] || [];
      const notesHtml = fileNotes.map((n, i) => \`
        <div class="annotation-box">
          <span><strong>Note:</strong> \${n}</span>
          <button onclick="deleteNote('\${file.path}', \${i})" style="background:none; border:none; color:var(--accent-rose); cursor:pointer;">✕</button>
        </div>
      \`).join('');

      let hunksHtml = '';
      file.hunks.forEach(hunk => {
        hunksHtml += \`<div class="diff-hunk-header">\${escapeHtml(hunk.header)}</div>\`;
        const lines = hunk.content.split('\\n');
        lines.forEach(line => {
          if (!line.trim() && lines.length === 1) return;
          let cls = '';
          if (line.startsWith('+') && !line.startsWith('+++')) cls = 'diff-line-add';
          else if (line.startsWith('-') && !line.startsWith('---')) cls = 'diff-line-del';
          hunksHtml += \`<div class="diff-line \${cls}">\${escapeHtml(line)}</div>\`;
        });
      });

      box.innerHTML = \`
        <div class="file-diff-header">
          <div class="file-path">
            <span style="color: \${file.status === 'added' ? 'var(--accent-emerald)' : 'var(--primary)'}">\${file.status.toUpperCase()}</span>
            <span>\${file.path}</span>
          </div>
          <div>
            <span class="text-add">+\${file.additions}</span>
            <span class="text-del">-\${file.deletions}</span>
          </div>
        </div>
        \${notesHtml}
        <div class="diff-code-table">\${hunksHtml}</div>
      \`;
      return box;
    }

    function renderAllDiffs() {
      const container = document.getElementById('all-diffs-container');
      container.innerHTML = '';
      DATA.files.forEach(file => {
        container.appendChild(createFileDiffElement(file));
      });
    }

    function filterDiffFiles() {
      const query = document.getElementById('diff-search').value.toLowerCase();
      const container = document.getElementById('all-diffs-container');
      container.innerHTML = '';
      
      const filtered = DATA.files.filter(f => f.path.toLowerCase().includes(query));
      filtered.forEach(file => {
        container.appendChild(createFileDiffElement(file));
      });
    }

    function switchTab(tabName) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      event.currentTarget.classList.add('active');
      document.getElementById('tab-' + tabName).classList.add('active');

      if (tabName === 'graph') {
        setTimeout(drawImpactGraph, 50);
      }
    }

    function generatePRMarkdownText() {
      const md = \`## \${DATA.summary.title}

### Summary & Context
\${DATA.summary.overview}

### Key Architectural Changes
\${DATA.summary.keyChanges.map(c => '- ' + c).join('\\n')}

### Breaking Changes
\${DATA.summary.breakingChanges.length ? DATA.summary.breakingChanges.map(b => '- ' + b).join('\\n') : '_None_'}

### Verification & Testing
\${DATA.summary.testingInstructions}

---
*Generated with [GitStoryboard](https://github.com/NEESCHAL-3/git-storyboard) — PR Storyboard & Visual Impact Analyzer*
\`;
      document.getElementById('pr-markdown-text').value = md;
    }

    function copyPRMarkdown() {
      const textarea = document.getElementById('pr-markdown-text');
      textarea.select();
      navigator.clipboard.writeText(textarea.value);
      showToast('Markdown PR Summary copied to clipboard!');
    }

    function addCustomAnnotation() {
      const file = prompt('Enter filename to add note to:', DATA.files[0] ? DATA.files[0].path : '');
      if (!file) return;
      const note = prompt('Enter review note / narration comment:');
      if (!note) return;

      if (!annotations[file]) annotations[file] = [];
      annotations[file].push(note);
      localStorage.setItem('git_storyboard_notes', JSON.stringify(annotations));

      renderChapterContent(activeChapterId);
      renderAllDiffs();
      showToast('Annotation saved!');
    }

    function deleteNote(filePath, index) {
      if (annotations[filePath]) {
        annotations[filePath].splice(index, 1);
        localStorage.setItem('git_storyboard_notes', JSON.stringify(annotations));
        renderChapterContent(activeChapterId);
        renderAllDiffs();
        showToast('Note deleted.');
      }
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.innerText = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function exportStandaloneHTML() {
      const htmlContent = document.documentElement.outerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = \`storyboard-\${DATA.meta.repoName}-\${DATA.meta.commitHash}.html\`;
      a.click();
      showToast('Exported interactive HTML storyboard!');
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Impact Node Canvas Graph Simulation
    let nodes = [];
    let animationFrame = null;

    function initImpactGraph() {
      const canvas = document.getElementById('impactCanvas');
      const container = document.getElementById('graph-container');
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      nodes = DATA.files.map((f, idx) => ({
        x: Math.random() * (canvas.width - 200) + 100,
        y: Math.random() * (canvas.height - 200) + 100,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.min(28, Math.max(14, (f.additions + f.deletions) / 5)),
        name: f.path.split('/').pop(),
        fullPath: f.path,
        additions: f.additions
      }));
    }

    function drawImpactGraph() {
      const canvas = document.getElementById('impactCanvas');
      const ctx = canvas.getContext('2d');

      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }

        // Move and render nodes
        nodes.forEach(n => {
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 50 || n.x > canvas.width - 50) n.vx *= -1;
          if (n.y < 50 || n.y > canvas.height - 50) n.vy *= -1;

          // Glowing Node Circle
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#6366f1';
          ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Text Label
          ctx.fillStyle = '#ffffff';
          ctx.font = '11px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(n.name, n.x, n.y + n.radius + 14);
        });

        animationFrame = requestAnimationFrame(animate);
      }

      if (animationFrame) cancelAnimationFrame(animationFrame);
      animate();
    }
  </script>
</body>
</html>`;
}

module.exports = { renderHTMLTemplate };
