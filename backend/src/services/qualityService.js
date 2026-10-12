/**
 * Deterministic quality scoring engine for repository health auditing.
 * Evaluates core repository checks on a 0 to 10 scale (README & description, installation guide,
 * automated tests, and .gitignore).
 * Open source license is reported as informational metadata (not penalized).
 * CI/CD is excluded to avoid penalizing student/academic/non-CI projects.
 */

function extractItemNames(analysis) {
  const names = new Set();

  if (Array.isArray(analysis?.configFilesFound)) {
    analysis.configFilesFound.forEach((n) => {
      if (typeof n === 'string') names.add(n.toLowerCase());
    });
  }

  if (Array.isArray(analysis?.rootItemNames)) {
    analysis.rootItemNames.forEach((n) => {
      if (typeof n === 'string') names.add(n.toLowerCase());
    });
  }

  if (Array.isArray(analysis?.rootItems)) {
    analysis.rootItems.forEach((item) => {
      const name = typeof item === 'string' ? item : item?.name;
      if (name) names.add(name.toLowerCase());
    });
  }

  return names;
}

/**
 * Informational license detection (does not impact the 0 to 10 score).
 */
export function getLicenseInfo(analysis, itemNames) {
  const licenseName =
    analysis?.metadata?.license?.name || analysis?.metadata?.license?.spdxId;
  const hasLicenseFile =
    itemNames.has('license') ||
    itemNames.has('license.md') ||
    itemNames.has('license.txt') ||
    itemNames.has('copying');

  if (licenseName || hasLicenseFile) {
    return {
      exists: true,
      name: licenseName || 'License File',
      description: `License detected (${licenseName || 'License file present'})`,
    };
  }

  return {
    exists: false,
    name: null,
    description: 'No license file (optional — add only if publishing as public open-source)',
  };
}

/**
 * Scored checks totaled on a 0 to 10 scale (3 + 3 + 3 + 1 = 10 pts).
 */
export const CHECKS = [
  {
    id: 'readme_description',
    name: 'README & Project Description',
    weight: 3,
    evaluate: (analysis, itemNames) => {
      const hasReadme = Boolean(
        analysis?.readmeSummary?.exists ||
          itemNames.has('readme.md') ||
          itemNames.has('readme')
      );
      const hasDescriptionInReadme = Boolean(
        analysis?.readmeSummary?.purpose &&
          analysis.readmeSummary.purpose.trim().length > 0
      );
      const hasDescriptionInMetadata = Boolean(
        analysis?.metadata?.description &&
          analysis.metadata.description.trim().length > 0
      );
      const hasFeaturesInReadme = Boolean(
        analysis?.readmeSummary?.keyFeatures &&
          analysis.readmeSummary.keyFeatures.length > 0
      );

      // Pass if README exists with description/overview, or if either metadata/readme has description
      return hasReadme && (hasDescriptionInReadme || hasDescriptionInMetadata || hasFeaturesInReadme || hasReadme);
    },
    getEvidence: (analysis, passed) => {
      if (passed) {
        if (analysis?.readmeSummary?.purpose) {
          return 'README file verified with project description and overview';
        }
        if (analysis?.metadata?.description) {
          return `README file present with repository description: "${analysis.metadata.description}"`;
        }
        return 'README documentation found in repository';
      }
      return 'No README documentation or project description found';
    },
    fix: 'Add a README.md file in the root directory with a clear project overview and description.',
  },
  {
    id: 'readme_install',
    name: 'Installation & Setup Instructions',
    weight: 3,
    evaluate: (analysis) => {
      const installText = analysis?.readmeSummary?.installationInstructions;
      return Boolean(
        installText && typeof installText === 'string' && installText.trim().length > 0
      );
    },
    getEvidence: (analysis, passed) => {
      return passed
        ? 'Installation instructions detected in README'
        : 'Missing installation or setup instructions in README';
    },
    fix: 'Add an "Installation" or "Getting Started" section to README.md with prerequisites and setup commands.',
  },
  {
    id: 'tests_folder',
    name: 'Automated Test Suite',
    weight: 3,
    evaluate: (analysis, itemNames) => {
      const hasTestDir = ['test', 'tests', '__tests__', 'spec', 'specs'].some((dir) =>
        itemNames.has(dir)
      );
      const testConfigs = [
        'jest.config.js',
        'jest.config.ts',
        'jest.config.mjs',
        'jest.config.cjs',
        'vitest.config.js',
        'vitest.config.ts',
        'pytest.ini',
        'tox.ini',
        'playwright.config.js',
        'playwright.config.ts',
        'cypress.config.js',
        'cypress.json',
      ];
      const hasTestConfig = testConfigs.some((cfg) => itemNames.has(cfg));
      const testScript = analysis?.packageJson?.scripts?.test;
      const hasValidTestScript = Boolean(
        testScript && !testScript.includes('no test specified')
      );

      return hasTestDir || hasTestConfig || hasValidTestScript;
    },
    getEvidence: (analysis, passed) => {
      return passed
        ? 'Automated test directory or test configuration detected'
        : 'No automated test directory, test configuration, or test scripts found';
    },
    fix: 'Add automated tests in a /tests or /test directory and configure a test runner (e.g. Jest, Pytest).',
  },
  {
    id: 'gitignore_present',
    name: 'Git Ignore Configuration',
    weight: 1,
    evaluate: (analysis, itemNames) => {
      return itemNames.has('.gitignore');
    },
    getEvidence: (analysis, passed) => {
      return passed
        ? '.gitignore file detected in repository root'
        : '.gitignore file is missing from repository root';
    },
    fix: 'Add a .gitignore file to exclude dependencies (node_modules), build artifacts, and secret files.',
  },
];

/**
 * Totals repository checks into a deterministic 0 to 10 quality score.
 * @param {object} analysis - Repository analysis object
 * @returns {{
 *   score: number,
 *   maxScore: number,
 *   grade: string,
 *   passedCount: number,
 *   totalCount: number,
 *   licenseInfo: { exists: boolean, name: string|null, description: string },
 *   checks: Array<{
 *     id: string,
 *     name: string,
 *     weight: number,
 *     passed: boolean,
 *     pointsEarned: number,
 *     evidence: string,
 *     fix: string
 *   }>
 * }}
 */
export function calculateQualityScore(analysis = {}) {
  const itemNames = extractItemNames(analysis);

  const checks = CHECKS.map((check) => {
    const passed = Boolean(check.evaluate(analysis, itemNames));
    return {
      id: check.id,
      name: check.name,
      weight: check.weight,
      passed,
      pointsEarned: passed ? check.weight : 0,
      evidence: check.getEvidence(analysis, passed, itemNames),
      fix: check.fix,
    };
  });

  const licenseInfo = getLicenseInfo(analysis, itemNames);

  const rawScore = checks.reduce((sum, item) => sum + item.pointsEarned, 0);
  const score = Math.min(10, Math.max(0, rawScore));
  const passedCount = checks.filter((c) => c.passed).length;

  let grade = 'F';
  if (score >= 9) grade = 'A';
  else if (score >= 7.5) grade = 'B';
  else if (score >= 6) grade = 'C';
  else if (score >= 4) grade = 'D';

  return {
    score,
    maxScore: 10,
    grade,
    passedCount,
    totalCount: checks.length,
    licenseInfo,
    checks,
  };
}
