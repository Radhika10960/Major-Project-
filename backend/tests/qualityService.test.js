import { describe, it, expect } from '@jest/globals';
import {
  CHECKS,
  calculateQualityScore,
  getLicenseInfo,
} from '../src/services/qualityService.js';

describe('qualityService (scoring engine - 10 point scale)', () => {
  it('has checks whose weights sum up to exactly 10', () => {
    const totalWeight = CHECKS.reduce((acc, c) => acc + c.weight, 0);
    expect(totalWeight).toBe(10);
  });

  it('calculates a 10 score for a repository that satisfies all scored checks', () => {
    const fakeAnalysis = {
      metadata: {
        description: 'AI-assisted GitHub repository quality analysis platform',
      },
      readmeSummary: {
        exists: true,
        filename: 'README.md',
        purpose: 'Deep search agent platform',
        installationInstructions: 'npm install\ncd backend && npm install',
      },
      rootItemNames: ['.gitignore', 'tests', 'package.json', 'README.md'],
      configFilesFound: ['.gitignore', 'package.json'],
    };

    const result = calculateQualityScore(fakeAnalysis);

    expect(result.score).toBe(10);
    expect(result.maxScore).toBe(10);
    expect(result.grade).toBe('A');
    expect(result.passedCount).toBe(CHECKS.length);
    expect(result.totalCount).toBe(CHECKS.length);

    result.checks.forEach((check) => {
      expect(check.passed).toBe(true);
      expect(check.pointsEarned).toBe(check.weight);
      expect(check.evidence).toBeTruthy();
      expect(check.fix).toBeTruthy();
    });
  });

  it('calculates a 0 score and provides fixes when analysis is empty', () => {
    const result = calculateQualityScore({});

    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(10);
    expect(result.grade).toBe('F');
    expect(result.passedCount).toBe(0);
    expect(result.totalCount).toBe(CHECKS.length);

    result.checks.forEach((check) => {
      expect(check.passed).toBe(false);
      expect(check.pointsEarned).toBe(0);
      expect(check.evidence).toBeTruthy();
      expect(check.fix).toBeTruthy();
    });
  });

  it('does NOT deduct points for missing repo description if README provides overview', () => {
    const analysisWithReadmeOnly = {
      metadata: {
        description: '', // Blank metadata description on GitHub
      },
      readmeSummary: {
        exists: true,
        purpose: 'Comprehensive project overview inside the README',
        installationInstructions: 'pip install -r requirements.txt',
      },
      rootItemNames: ['.gitignore'],
      configFilesFound: ['.gitignore'],
    };

    const result = calculateQualityScore(analysisWithReadmeOnly);
    const descCheck = result.checks.find((c) => c.id === 'readme_description');

    expect(descCheck.passed).toBe(true);
    expect(descCheck.pointsEarned).toBe(3);
    // 3 (readme_description) + 3 (readme_install) + 1 (gitignore) = 7/10
    expect(result.score).toBe(7);
  });

  it('treats open source license as informational without penalizing the score', () => {
    const analysisWithoutLicense = {
      metadata: {
        license: null,
      },
      readmeSummary: {
        exists: true,
        purpose: 'Gen-AI project',
        installationInstructions: 'pip install -r requirements.txt',
      },
      rootItemNames: ['.gitignore', 'tests'],
    };

    const result = calculateQualityScore(analysisWithoutLicense);

    // 3 (readme_description) + 3 (readme_install) + 3 (tests) + 1 (gitignore) = 10/10
    expect(result.score).toBe(10);
    expect(result.licenseInfo.exists).toBe(false);
    expect(result.licenseInfo.description).toContain('optional');
  });

  it('recognizes test suites via packageJson test scripts', () => {
    const analysisWithTestScript = {
      packageJson: {
        scripts: {
          test: 'node --experimental-vm-modules jest',
        },
      },
    };

    const result = calculateQualityScore(analysisWithTestScript);
    const testCheck = result.checks.find((c) => c.id === 'tests_folder');

    expect(testCheck.passed).toBe(true);
    expect(testCheck.pointsEarned).toBe(3);
  });
});
