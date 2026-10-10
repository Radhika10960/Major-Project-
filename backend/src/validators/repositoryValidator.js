import { z } from 'zod';
import { parseGitHubUrl } from '../utils/urlParser.js';

/**
 * Zod schema for the POST /api/repositories/analyze request body.
 * Validates that the URL is a well-formed GitHub repository URL.
 */
export const analyzeRepositorySchema = z.object({
  url: z
    .string({
      required_error: 'Repository URL is required',
      invalid_type_error: 'Repository URL must be a string',
    })
    .trim()
    .min(1, 'Repository URL cannot be empty')
    .url('Must be a valid URL')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return (
            parsed.hostname === 'github.com' ||
            parsed.hostname === 'www.github.com'
          );
        } catch {
          return false;
        }
      },
      { message: 'Only GitHub repository URLs are supported (https://github.com/owner/repo)' }
    )
    .refine(
      (url) => parseGitHubUrl(url) !== null,
      { message: 'Invalid GitHub repository URL format. Expected: https://github.com/owner/repo' }
    ),
});

/**
 * Express middleware that validates the request body against the
 * analyzeRepositorySchema. On failure, returns a 400 with details.
 */
export function validateAnalyzeRequest(req, res, next) {
  const result = analyzeRepositorySchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors,
      },
    });
  }

  // Attach the validated (and trimmed) data to the request
  req.validatedData = result.data;
  next();
}
