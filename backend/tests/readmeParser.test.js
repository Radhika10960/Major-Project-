import { describe, it, expect } from '@jest/globals';
import { parseReadme } from '../src/utils/readmeParser.js';

describe('README Parser', () => {
  it('handles empty or missing content gracefully', () => {
    const result = parseReadme(null);
    expect(result.exists).toBe(false);
    expect(result.purpose).toBeNull();
    expect(result.keyFeatures).toEqual([]);
    expect(result.technologies).toEqual([]);
  });

  it('extracts purpose, features, instructions, technologies, and links from structured markdown', () => {
    const markdown = `# Awesome Tool
[![Build](https://img.shields.io/badge/build-passing-green)](https://example.com)

Awesome Tool is a high-performance analytics platform built for modern engineering teams.

## Features
- Real-time event tracking and telemetry
- Automated pull request code health checks
- Intelligent vulnerability scanner

## Installation
\`\`\`bash
npm install awesome-tool
\`\`\`

## Usage
\`\`\`bash
npx awesome-tool --start
\`\`\`

## Tech Stack
This project is built using React, Node.js, Express, and PostgreSQL with Docker.

## Documentation
Check the [Official Docs](https://docs.example.com) for details.
`;

    const result = parseReadme(markdown, 'README.md');

    expect(result.exists).toBe(true);
    expect(result.filename).toBe('README.md');
    expect(result.purpose).toContain('Awesome Tool is a high-performance analytics platform');
    expect(result.keyFeatures).toHaveLength(3);
    expect(result.keyFeatures[0]).toBe('Real-time event tracking and telemetry');
    expect(result.installationInstructions).toContain('npm install awesome-tool');
    expect(result.usageInstructions).toContain('npx awesome-tool --start');
    expect(result.technologies).toEqual(
      expect.arrayContaining(['React', 'Node.js', 'Express', 'PostgreSQL', 'Docker'])
    );
    expect(result.links).toEqual([
      { text: 'Official Docs', url: 'https://docs.example.com' },
    ]);
  });
});
