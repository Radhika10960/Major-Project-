import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Contributor sub-schema.
 */
const contributorSchema = new Schema(
  {
    login: { type: String, default: null },
    name: { type: String, default: null },
    email: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    profileUrl: { type: String, default: null },
    contributions: { type: Number, default: 0 },
    commits: { type: Number, default: 0 },
    firstCommitDate: { type: Date, default: null },
    lastCommitDate: { type: Date, default: null },
    filesChanged: { type: Number, default: null },
    linesAdded: { type: Number, default: null },
    linesDeleted: { type: Number, default: null },
  },
  { _id: false }
);

/**
 * Language statistics sub-schema.
 */
const languageStatSchema = new Schema(
  {
    language: { type: String, required: true },
    fileCount: { type: Number, default: 0 },
    totalLines: { type: Number, default: 0 },
    totalBytes: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    extensions: [{ type: String }],
  },
  { _id: false }
);

/**
 * README summary sub-schema.
 */
const readmeSummarySchema = new Schema(
  {
    exists: { type: Boolean, default: false },
    filename: { type: String, default: null },
    purpose: { type: String, default: null },
    keyFeatures: [{ type: String }],
    installationInstructions: { type: String, default: null },
    technologies: [{ type: String }],
    usageInstructions: { type: String, default: null },
    links: [
      {
        text: { type: String },
        url: { type: String },
      },
    ],
    rawLength: { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * Repository metadata sub-schema (from GitHub API).
 */
const repoMetadataSchema = new Schema(
  {
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    description: { type: String, default: null },
    owner: {
      login: { type: String },
      avatarUrl: { type: String, default: null },
      profileUrl: { type: String, default: null },
    },
    htmlUrl: { type: String },
    cloneUrl: { type: String },
    defaultBranch: { type: String, default: 'main' },
    language: { type: String, default: null },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    openIssues: { type: Number, default: 0 },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    pushedAt: { type: Date },
    license: {
      name: { type: String, default: null },
      spdxId: { type: String, default: null },
    },
    visibility: { type: String, default: 'public' },
    archived: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    size: { type: Number, default: 0 },
    topics: [{ type: String }],
  },
  { _id: false }
);

/**
 * Quality check item sub-schema.
 */
const qualityCheckSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    pointsEarned: { type: Number, default: 0 },
    evidence: { type: String, default: null },
    fix: { type: String, default: null },
  },
  { _id: false }
);

/**
 * Quality report sub-schema.
 */
const qualityReportSchema = new Schema(
  {
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 10 },
    grade: { type: String, default: 'N/A' },
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    licenseInfo: {
      exists: { type: Boolean, default: false },
      name: { type: String, default: null },
      description: { type: String, default: null },
    },
    checks: [qualityCheckSchema],
  },
  { _id: false }
);

/**
 * Main RepositoryAnalysis schema.
 */
const repositoryAnalysisSchema = new Schema(
  {
    // Identifiers
    repositoryUrl: {
      type: String,
      required: true,
      index: true,
    },
    owner: {
      type: String,
      required: true,
      index: true,
    },
    repo: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      index: true,
    },

    // Analysis status
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },

    // Error tracking
    error: {
      message: { type: String, default: null },
      phase: { type: String, default: null },
      timestamp: { type: Date, default: null },
    },

    // Results
    metadata: {
      type: repoMetadataSchema,
      default: null,
    },
    languages: [languageStatSchema],
    projectType: {
      type: String,
      default: 'unknown',
    },
    projectTypeConfidence: {
      type: String,
      enum: ['high', 'medium', 'low', 'unknown'],
      default: 'unknown',
    },
    configFilesFound: [{ type: String }],

    readmeSummary: {
      type: readmeSummarySchema,
      default: null,
    },

    quality: {
      type: qualityReportSchema,
      default: null,
    },

    contributors: [contributorSchema],
    contributorCount: { type: Number, default: 0 },

    // File statistics
    totalFiles: { type: Number, default: 0 },
    totalLines: { type: Number, default: 0 },

    // Commit activity (time-series for charts)
    commitActivity: [
      {
        week: { type: Date },
        commits: { type: Number, default: 0 },
        _id: false,
      },
    ],

    // Timing
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    durationMs: { type: Number, default: null },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for finding active analyses of the same repo
repositoryAnalysisSchema.index({ fullName: 1, status: 1 });

// Index for listing recent analyses
repositoryAnalysisSchema.index({ createdAt: -1 });

const RepositoryAnalysis = mongoose.model(
  'RepositoryAnalysis',
  repositoryAnalysisSchema
);

export default RepositoryAnalysis;
