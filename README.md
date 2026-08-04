# GitStoryboard

> **The Interactive PR Walkthrough & Commit Storyboard Generator for Developers.**
> Transform complex pull requests and messy Git diffs into structured, visual, step-by-step code stories with architectural impact analysis.

---

## Why GitStoryboard?

Reviewing massive pull requests with dozens of modified files is overwhelming. Raw `git diff` outputs lack architectural context, making it hard for reviewers to grasp **why** changes were made, **which** subsystems are impacted, and **what order** to review them in.

**GitStoryboard** bridges this gap. It inspects your Git working directory or branch diff and automatically:
1. **Clusters changes into logical chapters** (e.g. Architecture, Security, Database, UI, Tests).
2. **Calculates a Code Impact Score (0–100)** to highlight refactor complexity & risk.
3. **Visualizes codebase file dependencies** in an interactive, animated network graph.
4. **Generates single-file HTML reports** that you can attach to PRs, share on Slack, or present in team demos.
5. **Provides a 1-click GitHub PR Markdown summary generator**.

---

## Quickstart

Run directly from GitHub without installing:

```bash
npx github:NEESCHAL-3/git-storyboard
```

Or try the interactive demo mode:

```bash
npx github:NEESCHAL-3/git-storyboard --demo
```

Or install globally:

```bash
npm install -g github:NEESCHAL-3/git-storyboard
git-storyboard
```

---

## Key Features

### 1. PR Storyboard Mode
Break down diffs into readable, ordered "chapters" instead of scrolling through endless changed files. Each chapter provides context, affected files, additions/deletions stats, and inline code diffs.

### 2. Visual Impact Graph
An interactive node network (built with HTML5 Canvas) that visually maps modified files and their dependency connections. Larger nodes highlight files with heavy code churn.

### 3. Code Impact & Risk Metric
Automatically scores your changeset on a 0–100 scale based on:
- Total line churn (additions + deletions)
- Critical subsystem touches (auth, database, config files vs tests)
- Cross-module dependency spread

### 4. 1-Click PR Description Generator
Generate clean, standardized GitHub PR summaries formatted with context overviews, key changes, breaking changes alerts, and testing instructions.

### 5. Interactive Code Annotations
Add inline review notes or author explanations directly onto lines in the browser interface. Annotations automatically save locally and get embedded when exporting.

### 6. Zero-Dependency HTML Exporter
Export self-contained `.html` reports with embedded styles and JS logic. No external server or internet connection required to view!

---

## CLI Usage & Options

```text
Usage: git-storyboard [options]

Options:
  --demo               Run with sample codebase diff dataset
  --export, -e <path>  Export interactive HTML report (default: storyboard.html)
  --summary, -s        Print markdown PR description directly to terminal
  --port, -p <number>  Port for local web dashboard (default: 3456)
  --no-open            Do not automatically launch browser on start
  --help, -h           Show CLI help message
```

### Examples

**Export a standalone HTML report for a PR:**
```bash
npx github:NEESCHAL-3/git-storyboard --export pr-walkthrough.html
```

**Generate terminal PR summary markdown:**
```bash
npx github:NEESCHAL-3/git-storyboard --summary
```

---

## Running Tests

```bash
npm test
```

---

## License

[MIT](LICENSE) © [NEESCHAL-3](https://github.com/NEESCHAL-3)
