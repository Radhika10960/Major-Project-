/**
 * Mapping of programming/markup languages to standard file extensions.
 */
export const LANGUAGE_EXTENSIONS_MAP = {
  JavaScript: ['.js', '.jsx', '.mjs', '.cjs'],
  TypeScript: ['.ts', '.tsx', '.mts', '.cts'],
  Python: ['.py', '.pyw', '.ipynb'],
  HTML: ['.html', '.htm'],
  CSS: ['.css', '.scss', '.sass', '.less'],
  Java: ['.java', '.jar'],
  'C++': ['.cpp', '.hpp', '.cc', '.cxx', '.h'],
  C: ['.c', '.h'],
  'C#': ['.cs'],
  Go: ['.go'],
  Rust: ['.rs'],
  Ruby: ['.rb', '.erb', '.rake'],
  PHP: ['.php', '.phtml'],
  Kotlin: ['.kt', '.kts'],
  Swift: ['.swift'],
  Dart: ['.dart'],
  Shell: ['.sh', '.bash', '.zsh'],
  PowerShell: ['.ps1', '.psm1'],
  SQL: ['.sql'],
  Vue: ['.vue'],
  Svelte: ['.svelte'],
  Dockerfile: ['Dockerfile'],
  Markdown: ['.md', '.markdown'],
  YAML: ['.yml', '.yaml'],
  JSON: ['.json'],
  XML: ['.xml'],
  GraphQL: ['.graphql', '.gql'],
  Lua: ['.lua'],
  Scala: ['.scala'],
  R: ['.r', '.R'],
};

/**
 * Returns known extensions for a language or a default fallback.
 * @param {string} language
 * @returns {string[]}
 */
export function getLanguageExtensions(language) {
  if (!language) return [];
  if (LANGUAGE_EXTENSIONS_MAP[language]) {
    return LANGUAGE_EXTENSIONS_MAP[language];
  }
  // Fallback: guess lowercased extension
  const normalized = language.toLowerCase().replace(/[^a-z0-9]/g, '');
  return [`.${normalized}`];
}
