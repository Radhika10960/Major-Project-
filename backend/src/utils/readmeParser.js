/**
 * Markdown README parser and intelligence extractor.
 * Extracts purpose, key features, install/usage instructions, technologies, and links.
 */

const KNOWN_TECHNOLOGIES = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Node.js', 'Express',
  'NestJS', 'Fastify', 'TypeScript', 'JavaScript', 'Python', 'Django',
  'Flask', 'FastAPI', 'Java', 'Spring Boot', 'Go', 'Rust', 'Ruby on Rails',
  'PHP', 'Laravel', 'C#', '.NET', 'Docker', 'Kubernetes', 'MongoDB',
  'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'GraphQL', 'Tailwind CSS',
  'Bootstrap', 'AWS', 'GCP', 'Azure', 'Firebase', 'Supabase', 'Prisma',
  'Mongoose', 'Vite', 'Webpack', 'Jest', 'Cypress'
];

/**
 * Remove markdown badges, images, and HTML comments.
 * @param {string} text
 * @returns {string}
 */
function cleanMarkdown(text) {
  if (!text) return '';
  return text
    // Remove HTML comments <!-- ... -->
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove image links [![alt](img)](link) or ![alt](img)
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove inline html tags
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Splits markdown content into sections delimited by headings (#, ##, ###, etc.)
 * @param {string} rawContent
 * @returns {Array<{ heading: string, level: number, body: string }>}
 */
function splitIntoSections(rawContent) {
  const lines = rawContent.split(/\r?\n/);
  const sections = [];
  let currentHeading = 'Introduction';
  let currentLevel = 1;
  let currentBody = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (currentBody.length > 0 || currentHeading !== 'Introduction') {
        sections.push({
          heading: currentHeading,
          level: currentLevel,
          body: currentBody.join('\n').trim(),
        });
      }
      currentLevel = headingMatch[1].length;
      currentHeading = headingMatch[2].replace(/[#*`_]/g, '').trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentBody.length > 0) {
    sections.push({
      heading: currentHeading,
      level: currentLevel,
      body: currentBody.join('\n').trim(),
    });
  }

  return sections;
}

/**
 * Extract bullet items from markdown text.
 * @param {string} text
 * @returns {string[]}
 */
function extractBulletPoints(text) {
  const lines = text.split(/\r?\n/);
  const bullets = [];

  for (const line of lines) {
    const match = line.match(/^\s*(?:[-*+]|\d+\.)\s+(.+)$/);
    if (match) {
      const cleaned = cleanMarkdown(match[1])
        .replace(/[*_`]/g, '')
        .trim();
      if (cleaned.length > 3 && cleaned.length < 300) {
        bullets.push(cleaned);
      }
    }
  }

  return bullets;
}

/**
 * Extract links from markdown [text](url).
 * @param {string} rawContent
 * @returns {Array<{ text: string, url: string }>}
 */
function extractLinks(rawContent) {
  // Remove markdown badges and images first
  const sanitized = rawContent
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '');

  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
  const links = [];
  const seenUrls = new Set();
  let match;

  while ((match = linkRegex.exec(sanitized)) !== null) {
    const text = match[1].trim();
    const url = match[2].trim();

    const isImageOrBadge =
      text.startsWith('!') ||
      text.toLowerCase().includes('badge') ||
      url.includes('shields.io') ||
      /\.(png|jpe?g|gif|svg|webp)$/i.test(url);

    if (!seenUrls.has(url) && text && !isImageOrBadge) {
      seenUrls.add(url);
      links.push({
        text: text.slice(0, 100),
        url: url.slice(0, 500),
      });
    }

    if (links.length >= 20) break;
  }

  return links;
}

/**
 * Detect mentions of technologies.
 * @param {string} text
 * @returns {string[]}
 */
function detectTechnologies(text) {
  const lower = text.toLowerCase();
  const matched = [];

  for (const tech of KNOWN_TECHNOLOGIES) {
    // Regex for word boundary match
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lower)) {
      matched.push(tech);
    }
  }

  return Array.from(new Set(matched));
}

/**
 * Parse raw markdown content into structured summary.
 * @param {string|null} rawContent
 * @param {string} [filename='README.md']
 * @returns {object}
 */
export function parseReadme(rawContent, filename = 'README.md') {
  if (!rawContent || typeof rawContent !== 'string') {
    return {
      exists: false,
      filename: null,
      purpose: null,
      keyFeatures: [],
      installationInstructions: null,
      technologies: [],
      usageInstructions: null,
      links: [],
      rawLength: 0,
    };
  }

  const rawLength = rawContent.length;
  const sections = splitIntoSections(rawContent);

  // 1. Purpose / Overview
  let purpose = null;
  // Look for dedicated overview/about/description sections first
  const descSection = sections.find((s) =>
    /(description|about|overview|introduction|what is)/i.test(s.heading)
  );

  if (descSection && descSection.body) {
    const cleaned = cleanMarkdown(descSection.body);
    const paragraphs = cleaned.split(/\n\s*\n/).filter((p) => p.trim().length > 10);
    if (paragraphs.length > 0) {
      purpose = paragraphs[0].replace(/\r?\n/g, ' ').slice(0, 600).trim();
    }
  }

  // Fallback: look at the introductory section before other headers
  if (!purpose) {
    const introSection = sections.find((s) => s.heading === 'Introduction' || s.level === 1);
    if (introSection && introSection.body) {
      const cleaned = cleanMarkdown(introSection.body);
      const paragraphs = cleaned.split(/\n\s*\n/).filter((p) => p.trim().length > 15);
      if (paragraphs.length > 0) {
        purpose = paragraphs[0].replace(/\r?\n/g, ' ').slice(0, 600).trim();
      }
    }
  }

  // 2. Key Features
  let keyFeatures = [];
  const featureSections = sections.filter((s) =>
    /(feature|features|highlights|key capabilities|what it does)/i.test(s.heading)
  );

  for (const s of featureSections) {
    const bullets = extractBulletPoints(s.body);
    keyFeatures.push(...bullets);
  }
  keyFeatures = Array.from(new Set(keyFeatures)).slice(0, 12);

  // 3. Installation
  let installationInstructions = null;
  const installSection = sections.find((s) =>
    /(install|installation|setup|getting started|prerequisites)/i.test(s.heading)
  );

  if (installSection && installSection.body) {
    // Prefer code blocks if present
    const codeMatch = installSection.body.match(/```(?:bash|sh|cmd|shell|zsh)?\s*([\s\S]*?)```/);
    if (codeMatch) {
      installationInstructions = codeMatch[1].trim().slice(0, 1000);
    } else {
      installationInstructions = cleanMarkdown(installSection.body).slice(0, 1000);
    }
  }

  // 4. Usage
  let usageInstructions = null;
  const usageSection = sections.find((s) =>
    /(usage|how to use|quick start|running|run)/i.test(s.heading) &&
    !/(install|setup)/i.test(s.heading)
  );

  if (usageSection && usageSection.body) {
    const codeMatch = usageSection.body.match(/```(?:bash|sh|javascript|js|json|python)?\s*([\s\S]*?)```/);
    if (codeMatch) {
      usageInstructions = codeMatch[1].trim().slice(0, 1000);
    } else {
      usageInstructions = cleanMarkdown(usageSection.body).slice(0, 1000);
    }
  }

  // 5. Technologies
  const technologies = detectTechnologies(rawContent);

  // 6. Links
  const links = extractLinks(rawContent);

  return {
    exists: true,
    filename,
    purpose,
    keyFeatures,
    installationInstructions,
    technologies,
    usageInstructions,
    links,
    rawLength,
  };
}
