import RepositoryAnalysis from '../models/RepositoryAnalysis.js';
import { parseGitHubUrl, normalizeGitHubUrl } from '../utils/urlParser.js';
import {
  fetchRepositoryMetadata,
  fetchRepositoryLanguages,
  fetchContributors,
  fetchRepositoryReadme,
  fetchRepositoryContents,
  fetchFileContent,
  fetchCommitActivity,
} from '../services/githubService.js';
import { parseReadme } from '../utils/readmeParser.js';
import {
  identifyConfigFiles,
  detectProjectType,
} from '../utils/projectTypeDetector.js';

/**
 * POST /api/repositories/analyze
 *
 * Accepts a GitHub repository URL, validates it, fetches metadata,
 * language statistics, contributors, commit activity, README summary,
 * config files, and project type, creates a new analysis record, and returns the analysis ID.
 */
export async function analyzeRepository(req, res, next) {
  try {
    const { url } = req.validatedData;

    // Parse the validated URL
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return res.status(400).json({
        success: false,
        error: { message: 'Could not parse the GitHub URL' },
      });
    }

    const normalizedUrl = normalizeGitHubUrl(url);

    // Check for an active (pending/processing) analysis of the same repo
    const existingActive = await RepositoryAnalysis.findOne({
      fullName: parsed.fullName,
      status: { $in: ['pending', 'processing'] },
    });

    if (existingActive) {
      return res.status(409).json({
        success: false,
        error: {
          message: `An analysis for ${parsed.fullName} is already in progress`,
        },
        data: {
          analysisId: existingActive._id,
          status: existingActive.status,
        },
      });
    }

    // Create a new analysis record in "pending" status
    const analysis = await RepositoryAnalysis.create({
      repositoryUrl: normalizedUrl,
      owner: parsed.owner,
      repo: parsed.repo,
      fullName: parsed.fullName,
      status: 'pending',
    });

    // Transition to "processing"
    analysis.status = 'processing';
    analysis.startedAt = new Date();
    await analysis.save();

    // Phase 3: Inspect repository metadata, language breakdown, contributors, README, and architecture
    // (Phase 5 will convert long-running jobs to an async queue)
    try {
      const [
        metaResult,
        languagesResult,
        contributorsResult,
        readmeResult,
        contentsResult,
        commitActivityResult,
      ] = await Promise.allSettled([
        fetchRepositoryMetadata(parsed.owner, parsed.repo),
        fetchRepositoryLanguages(parsed.owner, parsed.repo),
        fetchContributors(parsed.owner, parsed.repo),
        fetchRepositoryReadme(parsed.owner, parsed.repo),
        fetchRepositoryContents(parsed.owner, parsed.repo),
        fetchCommitActivity(parsed.owner, parsed.repo),
      ]);

      if (metaResult.status === 'rejected') {
        throw metaResult.reason;
      }

      const metadata = metaResult.value;
      const languages = languagesResult.status === 'fulfilled' ? languagesResult.value : [];
      const contributors = contributorsResult.status === 'fulfilled' ? contributorsResult.value : [];
      const commitActivity = commitActivityResult.status === 'fulfilled' ? commitActivityResult.value : [];
      const readmeRaw = readmeResult.status === 'fulfilled' ? readmeResult.value : null;
      const rootItems = contentsResult.status === 'fulfilled' ? contentsResult.value : [];

      // Parse README if present
      const readmeSummary = parseReadme(
        readmeRaw?.rawContent,
        readmeRaw?.filename || 'README.md'
      );

      // Detect configuration files
      const configFiles = identifyConfigFiles(rootItems);
      let packageJson = null;

      if (configFiles.includes('package.json')) {
        const pkgContent = await fetchFileContent(parsed.owner, parsed.repo, 'package.json');
        if (pkgContent) {
          try {
            packageJson = JSON.parse(pkgContent);
          } catch {
            // Non-critical if package.json has parsing issues
          }
        }
      }

      // Infer project type and architecture
      const { projectType, projectTypeConfidence } = detectProjectType({
        configFiles,
        packageJson,
        primaryLanguage: metadata.language,
        rootItemNames: rootItems.map((item) => item.name),
        readmePurpose: readmeSummary.purpose || readmeSummary.technologies?.join(' '),
      });

      // Calculate file and line estimates
      const totalBytes = languages.reduce((sum, l) => sum + (l.totalBytes || 0), 0);
      const totalFilesEstimate = rootItems.length > 0 ? rootItems.length : (languages.length > 0 ? languages.length : 1);
      const totalLinesEstimate = totalBytes > 0 ? Math.round(totalBytes / 35) : 0;

      // Update analysis record
      analysis.metadata = metadata;
      analysis.languages = languages;
      analysis.contributors = contributors;
      analysis.contributorCount = contributors.length;
      analysis.commitActivity = commitActivity;
      analysis.readmeSummary = readmeSummary;
      analysis.configFilesFound = configFiles;
      analysis.projectType = projectType;
      analysis.projectTypeConfidence = projectTypeConfidence;
      analysis.totalFiles = totalFilesEstimate;
      analysis.totalLines = totalLinesEstimate;

      analysis.status = 'completed';
      analysis.completedAt = new Date();
      analysis.durationMs = analysis.completedAt - analysis.startedAt;
      await analysis.save();
    } catch (analysisErr) {
      // Record the failure
      analysis.status = 'failed';
      analysis.error = {
        message: analysisErr.message,
        phase: 'inspection',
        timestamp: new Date(),
      };
      analysis.completedAt = new Date();
      analysis.durationMs = analysis.completedAt - analysis.startedAt;
      await analysis.save();

      // Return 202 even on failure — the client polls for status
      return res.status(202).json({
        success: true,
        data: {
          analysisId: analysis._id,
          status: analysis.status,
          message: 'Analysis started but encountered an error during repository inspection',
          error: analysisErr.message,
        },
      });
    }

    // Return 202 Accepted with the analysis ID
    res.status(202).json({
      success: true,
      data: {
        analysisId: analysis._id,
        status: analysis.status,
        repository: parsed.fullName,
        message: 'Analysis completed successfully',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analyses/:id
 *
 * Returns the analysis status and full repository overview.
 */
export async function getAnalysis(req, res, next) {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid analysis ID format' },
      });
    }

    const analysis = await RepositoryAnalysis.findById(id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { message: 'Analysis not found' },
      });
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analyses
 *
 * Returns paginated analysis history, most recent first.
 */
export async function getAnalyses(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      RepositoryAnalysis.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-contributors -languages -readmeSummary -commitActivity'),
      RepositoryAnalysis.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + limit < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analyses/:id/languages
 *
 * Returns language statistics for a completed analysis.
 */
export async function getAnalysisLanguages(req, res, next) {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid analysis ID format' },
      });
    }

    const analysis = await RepositoryAnalysis.findById(id).select(
      'status fullName languages projectType projectTypeConfidence configFilesFound totalFiles totalLines'
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { message: 'Analysis not found' },
      });
    }

    res.json({
      success: true,
      data: {
        status: analysis.status,
        fullName: analysis.fullName,
        languages: analysis.languages,
        projectType: analysis.projectType,
        projectTypeConfidence: analysis.projectTypeConfidence,
        configFilesFound: analysis.configFilesFound,
        totalFiles: analysis.totalFiles,
        totalLines: analysis.totalLines,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analyses/:id/contributors
 *
 * Returns contributor statistics for a completed analysis.
 */
export async function getAnalysisContributors(req, res, next) {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid analysis ID format' },
      });
    }

    const analysis = await RepositoryAnalysis.findById(id).select(
      'status fullName contributors contributorCount commitActivity'
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { message: 'Analysis not found' },
      });
    }

    res.json({
      success: true,
      data: {
        status: analysis.status,
        fullName: analysis.fullName,
        contributors: analysis.contributors,
        contributorCount: analysis.contributorCount,
        commitActivity: analysis.commitActivity,
        disclaimer:
          'Git author identities and GitHub accounts may not match perfectly. ' +
          'Commit counts are descriptive metrics, not reliable measures of individual effort.',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analyses/:id/readme
 *
 * Returns the extracted README summary for a completed analysis.
 */
export async function getAnalysisReadme(req, res, next) {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid analysis ID format' },
      });
    }

    const analysis = await RepositoryAnalysis.findById(id).select(
      'status fullName readmeSummary'
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { message: 'Analysis not found' },
      });
    }

    res.json({
      success: true,
      data: {
        status: analysis.status,
        fullName: analysis.fullName,
        readmeSummary: analysis.readmeSummary,
      },
    });
  } catch (err) {
    next(err);
  }
}

