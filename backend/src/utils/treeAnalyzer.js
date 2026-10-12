const IGNORED = /(^|\/)(node_modules|vendor|dist|build|\.git)\//;
const TEST_DIR = /(^|\/)(__tests__|tests?|spec|specs)\//i;
const TEST_FILE = /(\.(test|spec)\.[cm]?[jt]sx?$)|((^|\/)test_[^/]+\.py$)|(_test\.(py|go)$)|(Test\.java$)/;

function analyzeTree({ entries, truncated }) {
  const files = entries.filter(e => e.type === 'blob');
  const paths = files.map(f => f.path);
  const source = paths.filter(p => !IGNORED.test(p));

  const testFiles = source.filter(p => TEST_FILE.test(p) || TEST_DIR.test(p));
  const workflows = paths.filter(p => /^\.github\/workflows\/.+\.ya?ml$/.test(p));
  const gitlabCi = paths.includes('.gitlab-ci.yml');

  // Count files per extension
  const extensionCounts = {};
  for (const p of source) {
    const m = p.match(/\.([a-z0-9]+)$/i);
    const ext = m ? m[1].toLowerCase() : '(none)';
    extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
  }

  return {
    truncated,
    totalFiles: paths.length,
    totalFolders: entries.filter(e => e.type === 'tree').length,
    sourceFileCount: source.length,
    testFileCount: testFiles.length,
    hasTests: testFiles.length > 0,
    hasCI: workflows.length > 0 || gitlabCi,
    ciWorkflows: workflows,
    hasGitignore: paths.includes('.gitignore'),
    hasLicense: paths.some(p => /^licen[sc]e(\.[a-z]+)?$/i.test(p)),
    hasDockerfile: paths.some(p => /(^|\/)Dockerfile$/.test(p)),
    envFileCommitted: paths.some(p => /(^|\/)\.env(\.[a-z]+)?$/i.test(p)
                                   && !/\.(example|sample|template)$/i.test(p)),
    nodeModulesCommitted: paths.some(p => /(^|\/)node_modules\//.test(p)),
    extensionCounts,
    largestFiles: [...files].sort((a, b) => b.size - a.size).slice(0, 5)
      .map(f => ({ path: f.path, size: f.size })),
  };
}

module.exports = { analyzeTree };