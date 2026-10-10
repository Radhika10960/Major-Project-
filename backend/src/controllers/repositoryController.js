import RepositoryAnalysis from '../models/RepositoryAnalysis.js';
import { parseGitHubUrl, normalizeGitHubUrl } from '../utils/urlParser.js';
import { fetchRepositoryMetadata } from '../services/githubService.js';

/**
 * POST /api/repositories/analyze
 *
 * Accepts a GitHub repository URL, validates it, fetches metadata,
 * creates a new analysis record, and returns the analysis ID.
 *
 * In later phases this will kick off an async background job.
 * For now (Phase 2) it fetches metadata synchronously and saves it.
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

    // Phase 2: Fetch metadata synchronously
    // (Phase 5 will convert this to an async job)
    try {
      const metadata = await fetchRepositoryMetadata(parsed.owner, parsed.repo);
      analysis.metadata = metadata;

      // For now, mark as completed after metadata fetch
      // Later phases will add language detection, cloning, etc.
      // before marking complete
      analysis.status = 'completed';
      analysis.completedAt = new Date();
      analysis.durationMs = analysis.completedAt - analysis.startedAt;
      await analysis.save();
    } catch (metaErr) {
      // Record the failure but don't crash the request
      analysis.status = 'failed';
      analysis.error = {
        message: metaErr.message,
        phase: 'metadata',
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
          message: 'Analysis started but encountered an error during metadata retrieval',
          error: metaErr.message,
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
