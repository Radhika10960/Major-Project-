/**
 * Project type and architecture detector.
 * Identifies configuration files and infers the project type and confidence.
 */

const KNOWN_CONFIG_FILES = new Set([
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  'tsconfig.json',
  'jsconfig.json',
  'vite.config.js',
  'vite.config.ts',
  'webpack.config.js',
  'next.config.js',
  'next.config.mjs',
  'next.config.ts',
  'nuxt.config.js',
  'nuxt.config.ts',
  'tailwind.config.js',
  'tailwind.config.ts',
  'requirements.txt',
  'pyproject.toml',
  'Pipfile',
  'Pipfile.lock',
  'setup.py',
  'manage.py',
  'pom.xml',
  'build.gradle',
  'build.gradle.kts',
  'Cargo.toml',
  'Cargo.lock',
  'go.mod',
  'go.sum',
  'Gemfile',
  'Gemfile.lock',
  'composer.json',
  'composer.lock',
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  'Makefile',
  'CMakeLists.txt',
]);

/**
 * Filter and identify config files from a list of repository root items.
 * @param {Array<{ name: string, type?: string }|string>} rootItems
 * @returns {string[]} List of matched configuration file names
 */
export function identifyConfigFiles(rootItems = []) {
  const found = [];

  for (const item of rootItems) {
    const name = typeof item === 'string' ? item : item?.name;
    if (name && KNOWN_CONFIG_FILES.has(name)) {
      found.push(name);
    }
  }

  return Array.from(new Set(found)).sort();
}

/**
 * Detect project type and confidence from root files, package.json (if any), and languages.
 * @param {object} params
 * @param {string[]} params.configFiles - List of detected config files
 * @param {object|null} params.packageJson - Parsed package.json if present
 * @param {string|null} params.primaryLanguage - Dominant language from GitHub
 * @param {string[]} [params.rootItemNames=[]] - List of all root file/folder names
 * @param {string|null} [params.readmePurpose=null] - Extracted readme purpose/tech
 * @returns {{ projectType: string, projectTypeConfidence: 'high'|'medium'|'low'|'unknown' }}
 */
export function detectProjectType({
  configFiles = [],
  packageJson = null,
  primaryLanguage = null,
  rootItemNames = [],
  readmePurpose = '',
}) {
  const configSet = new Set(configFiles);
  const rootSet = new Set(rootItemNames.map((n) => n.toLowerCase()));

  // Multi-tier detection: both frontend and backend present at root
  const hasFrontendDir = rootSet.has('frontend') || rootSet.has('client') || rootSet.has('ui') || rootSet.has('web');
  const hasBackendDir = rootSet.has('backend') || rootSet.has('server') || rootSet.has('api');
  if (hasFrontendDir && hasBackendDir) {
    return {
      projectType: 'Full-Stack Multi-tier Application (Frontend + Backend)',
      projectTypeConfidence: 'high',
    };
  }

  // 1. Node.js ecosystem (package.json present)
  if (configSet.has('package.json') || packageJson) {
    const deps = {
      ...(packageJson?.dependencies || {}),
      ...(packageJson?.devDependencies || {}),
    };

    if (deps.next) {
      return { projectType: 'Next.js Full-Stack Application', projectTypeConfidence: 'high' };
    }
    if (deps.nuxt) {
      return { projectType: 'Nuxt.js Web Application', projectTypeConfidence: 'high' };
    }
    if (deps['@nestjs/core']) {
      return { projectType: 'NestJS Backend Framework', projectTypeConfidence: 'high' };
    }
    if (deps.react || deps['react-dom'] || deps['@vitejs/plugin-react']) {
      if (deps.express || deps.fastify || deps.koa) {
        return { projectType: 'Full-Stack (React + Node.js) Application', projectTypeConfidence: 'high' };
      }
      return { projectType: 'React Single-Page Application', projectTypeConfidence: 'high' };
    }
    if (deps.vue) {
      return { projectType: 'Vue.js Single-Page Application', projectTypeConfidence: 'high' };
    }
    if (deps.svelte || deps['@sveltejs/kit']) {
      return { projectType: 'Svelte Web Application', projectTypeConfidence: 'high' };
    }
    if (deps['@angular/core']) {
      return { projectType: 'Angular Application', projectTypeConfidence: 'high' };
    }
    if (deps.express || deps.fastify || deps.koa || deps.hapi) {
      return { projectType: 'Node.js REST API Server', projectTypeConfidence: 'high' };
    }
    if (packageJson?.bin) {
      return { projectType: 'Node.js CLI Application', projectTypeConfidence: 'high' };
    }
    if (configSet.has('vite.config.js') || configSet.has('vite.config.ts')) {
      return { projectType: 'Vite Frontend Application', projectTypeConfidence: 'high' };
    }

    return { projectType: 'Node.js Application', projectTypeConfidence: 'high' };
  }

  // 2. Python ecosystem
  if (
    configSet.has('requirements.txt') ||
    configSet.has('pyproject.toml') ||
    configSet.has('Pipfile') ||
    configSet.has('manage.py') ||
    primaryLanguage === 'Python'
  ) {
    const purposeLower = (readmePurpose || '').toLowerCase();
    if (configSet.has('manage.py') || purposeLower.includes('django')) {
      return { projectType: 'Python / Django Web Application', projectTypeConfidence: 'high' };
    }
    if (purposeLower.includes('fastapi')) {
      return { projectType: 'FastAPI Microservice', projectTypeConfidence: 'high' };
    }
    if (purposeLower.includes('flask')) {
      return { projectType: 'Python / Flask Web Application', projectTypeConfidence: 'high' };
    }
    if (configSet.has('requirements.txt') || configSet.has('pyproject.toml')) {
      return { projectType: 'Python Application / Package', projectTypeConfidence: 'high' };
    }
    return { projectType: 'Python Project', projectTypeConfidence: 'medium' };
  }

  // 3. Rust ecosystem
  if (configSet.has('Cargo.toml')) {
    return { projectType: 'Rust Application / Crate', projectTypeConfidence: 'high' };
  }

  // 4. Go ecosystem
  if (configSet.has('go.mod')) {
    return { projectType: 'Go Service / Application', projectTypeConfidence: 'high' };
  }

  // 5. Java / JVM ecosystem
  if (configSet.has('pom.xml')) {
    return { projectType: 'Java / Maven Application', projectTypeConfidence: 'high' };
  }
  if (configSet.has('build.gradle') || configSet.has('build.gradle.kts')) {
    return { projectType: 'Java / Gradle Application', projectTypeConfidence: 'high' };
  }

  // 6. Ruby
  if (configSet.has('Gemfile')) {
    return { projectType: 'Ruby / Rails Application', projectTypeConfidence: 'high' };
  }

  // 7. PHP
  if (configSet.has('composer.json')) {
    return { projectType: 'PHP / Composer Project', projectTypeConfidence: 'high' };
  }

  // 8. Docker standalone
  if (configSet.has('Dockerfile') || configSet.has('docker-compose.yml')) {
    return { projectType: 'Containerized Infrastructure / Service', projectTypeConfidence: 'medium' };
  }

  // 9. Fallback to primary language
  if (primaryLanguage) {
    return {
      projectType: `${primaryLanguage} Project`,
      projectTypeConfidence: configFiles.length > 0 ? 'medium' : 'low',
    };
  }

  return {
    projectType: 'unknown',
    projectTypeConfidence: 'unknown',
  };
}
