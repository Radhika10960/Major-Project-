import { describe, it, expect } from '@jest/globals';
import {
  identifyConfigFiles,
  detectProjectType,
} from '../src/utils/projectTypeDetector.js';

describe('Project Type Detector', () => {
  it('identifies known config files correctly', () => {
    const rootItems = [
      { name: 'package.json', type: 'file' },
      { name: 'tsconfig.json', type: 'file' },
      { name: 'Dockerfile', type: 'file' },
      { name: 'random_script.sh', type: 'file' },
      { name: 'src', type: 'dir' },
    ];

    const detected = identifyConfigFiles(rootItems);
    expect(detected).toEqual(['Dockerfile', 'package.json', 'tsconfig.json']);
  });

  it('detects multi-tier application with frontend and backend folders', () => {
    const result = detectProjectType({
      configFiles: ['package.json'],
      rootItemNames: ['frontend', 'backend', 'package.json'],
    });

    expect(result.projectType).toBe('Full-Stack Multi-tier Application (Frontend + Backend)');
    expect(result.projectTypeConfidence).toBe('high');
  });

  it('detects Next.js application from package.json', () => {
    const result = detectProjectType({
      configFiles: ['package.json', 'next.config.js'],
      packageJson: { dependencies: { next: '^14.0.0', react: '^18.0.0' } },
      rootItemNames: ['app', 'package.json'],
    });

    expect(result.projectType).toBe('Next.js Full-Stack Application');
    expect(result.projectTypeConfidence).toBe('high');
  });

  it('detects React SPA from dependencies', () => {
    const result = detectProjectType({
      configFiles: ['package.json', 'vite.config.js'],
      packageJson: { dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' } },
      rootItemNames: ['src', 'package.json'],
    });

    expect(result.projectType).toBe('React Single-Page Application');
    expect(result.projectTypeConfidence).toBe('high');
  });

  it('detects Python/Django application', () => {
    const result = detectProjectType({
      configFiles: ['requirements.txt', 'manage.py'],
      primaryLanguage: 'Python',
      rootItemNames: ['manage.py', 'requirements.txt'],
    });

    expect(result.projectType).toBe('Python / Django Web Application');
    expect(result.projectTypeConfidence).toBe('high');
  });

  it('detects Rust application from Cargo.toml', () => {
    const result = detectProjectType({
      configFiles: ['Cargo.toml'],
      primaryLanguage: 'Rust',
      rootItemNames: ['Cargo.toml', 'src'],
    });

    expect(result.projectType).toBe('Rust Application / Crate');
    expect(result.projectTypeConfidence).toBe('high');
  });
});
