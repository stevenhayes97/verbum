#!/usr/bin/env node
// Parses the JSON review produced by the Cursor CLI translation-review step
// (see .github/workflows/translation-review.yml) and turns per-entry
// confidence scores into GitHub Actions annotations + a pass/warn/fail
// exit code. Plain Node, no dependencies, mirroring cli/index.mjs.
import { readFile } from 'node:fs/promises';

const FAIL_THRESHOLD = 90;
const WARN_THRESHOLD = 95;

function annotate(level, message) {
  // GitHub Actions workflow command syntax: ::error::message / ::warning::message
  console.log(`::${level}::${message}`);
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Validates the raw parsed JSON is an array of review entries with a usable
 * `confidence` field. Entries that don't look right are themselves treated
 * as failures — a malformed review isn't the same as "no issues found".
 */
function normalizeEntries(parsed) {
  if (!Array.isArray(parsed)) {
    throw new Error('Review JSON must be an array of entries.');
  }

  return parsed.map((entry, index) => {
    const label = entry && typeof entry === 'object' && entry.id ? entry.id : `entry #${index + 1}`;
    if (!entry || typeof entry !== 'object' || !isFiniteNumber(entry.confidence)) {
      return {
        id: label,
        file: entry?.file ?? 'unknown',
        latin: entry?.latin ?? 'unknown',
        english: entry?.english ?? 'unknown',
        confidence: null,
        reasoning: 'Malformed review entry: missing or non-numeric "confidence" field.',
        malformed: true,
      };
    }
    return {
      id: label,
      file: entry.file ?? 'unknown',
      latin: entry.latin ?? 'unknown',
      english: entry.english ?? 'unknown',
      confidence: entry.confidence,
      reasoning: entry.reasoning ?? '',
      malformed: false,
    };
  });
}

function categorize(entries) {
  const failures = [];
  const warnings = [];
  const passes = [];

  for (const entry of entries) {
    if (entry.malformed || entry.confidence < FAIL_THRESHOLD) {
      failures.push(entry);
    } else if (entry.confidence < WARN_THRESHOLD) {
      warnings.push(entry);
    } else {
      passes.push(entry);
    }
  }

  return { failures, warnings, passes };
}

function describe(entry) {
  const confidenceText = entry.malformed ? 'n/a' : `${entry.confidence}%`;
  return `[${entry.file}] ${entry.id} ("${entry.latin}" → "${entry.english}") — confidence ${confidenceText}: ${entry.reasoning}`;
}

async function writeStepSummary({ failures, warnings, passes }) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;

  const lines = [
    '## Translation review',
    '',
    `- ❌ Failing (< ${FAIL_THRESHOLD}%): ${failures.length}`,
    `- ⚠️ Warning (${FAIL_THRESHOLD}–${WARN_THRESHOLD}%): ${warnings.length}`,
    `- ✅ Passing (≥ ${WARN_THRESHOLD}%): ${passes.length}`,
    '',
  ];

  const flagged = [...failures, ...warnings];
  if (flagged.length > 0) {
    lines.push('| Status | File | Id | Latin | English | Confidence | Reasoning |');
    lines.push('|---|---|---|---|---|---|---|');
    for (const entry of failures) {
      lines.push(
        `| ❌ Fail | ${entry.file} | ${entry.id} | ${entry.latin} | ${entry.english} | ${entry.malformed ? 'n/a' : `${entry.confidence}%`} | ${entry.reasoning} |`,
      );
    }
    for (const entry of warnings) {
      lines.push(`| ⚠️ Warn | ${entry.file} | ${entry.id} | ${entry.latin} | ${entry.english} | ${entry.confidence}% | ${entry.reasoning} |`);
    }
  } else {
    lines.push('No low-confidence translations found in this PR.');
  }

  const { appendFile } = await import('node:fs/promises');
  await appendFile(summaryPath, `${lines.join('\n')}\n`);
}

async function main() {
  const inputPath = process.argv[2] ?? '/tmp/translation-review.json';

  let raw;
  try {
    raw = await readFile(inputPath, 'utf8');
  } catch (error) {
    annotate('error', `Translation review output not found at ${inputPath}: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    annotate('error', `Translation review output at ${inputPath} is not valid JSON: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  let entries;
  try {
    entries = normalizeEntries(parsed);
  } catch (error) {
    annotate('error', `Translation review output at ${inputPath} is invalid: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const { failures, warnings, passes } = categorize(entries);

  for (const entry of failures) {
    annotate('error', `Low-confidence translation: ${describe(entry)}`);
  }
  for (const entry of warnings) {
    annotate('warning', `Low-confidence translation: ${describe(entry)}`);
  }

  console.log(
    `Translation review: ${passes.length} passing, ${warnings.length} warning(s), ${failures.length} failing (of ${entries.length} reviewed entries).`,
  );

  await writeStepSummary({ failures, warnings, passes });

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  annotate('error', `Translation review check crashed: ${error.stack ?? error.message}`);
  process.exitCode = 1;
});
