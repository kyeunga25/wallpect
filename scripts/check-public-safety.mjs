import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const trackedAndNewFiles = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);

const forbiddenPaths = [
  { label: "environment file", pattern: /(^|\/)\.env(?:\.|$)/i },
  { label: "local Worker variables", pattern: /(^|\/)\.dev\.vars$/i },
  { label: "private key or certificate", pattern: /\.(?:pem|key|p12|pfx|jks|keystore)$/i },
  { label: "database or export", pattern: /\.(?:sqlite3?|db|dump|sql|bak)$/i },
  { label: "private Worker state", pattern: /(^|\/)\.wrangler\//i },
  {
    label: "generated output",
    pattern: /(^|\/)(?:dist|coverage|playwright-report|test-results)\//i,
  },
];

const forbiddenContent = [
  {
    label: "private key",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  },
  { label: "AWS access key", pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { label: "GitHub token", pattern: /\b(?:github_pat_|gh[pousr]_)[A-Za-z0-9_]{20,}\b/ },
  { label: "OpenAI-style secret", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/ },
  { label: "Slack token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { label: "Google API key", pattern: /\bAIza[0-9A-Za-z_-]{30,}\b/ },
  { label: "credential in URL", pattern: /https?:\/\/[^/\s:@]+:[^@\s/]+@/i },
  {
    label: "absolute macOS user path",
    pattern: /(?:^|[\s"'`(])\/Users\/[^/<>{}\s]+\//m,
  },
  {
    label: "absolute Linux user path",
    pattern: /(?:^|[\s"'`(])\/home\/[^/<>{}\s]+\//m,
  },
  { label: "absolute Windows user path", pattern: /[A-Za-z]:\\Users\\[^\\\s]+\\/ },
  {
    label: "embedded email address",
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  },
  {
    label: "Cloudflare resource identifier",
    pattern: /\b(?:account_id|zone_id|database_id|namespace_id)\s*[:=]\s*["'][a-f0-9]{16,}["']/i,
  },
  {
    label: "assigned secret-like value",
    pattern:
      /\b(?:api[_-]?key|api[_-]?token|access[_-]?token|auth[_-]?token|client[_-]?secret|private[_-]?key|database[_-]?url|password)\s*[:=]\s*["'][^"'\s]{12,}["']/i,
  },
];

const findings = [];

for (const file of trackedAndNewFiles) {
  for (const rule of forbiddenPaths) {
    if (rule.pattern.test(file)) findings.push(`${rule.label}: ${file}`);
  }

  const bytes = readFileSync(file);
  if (bytes.includes(0)) continue;
  const content = bytes.toString("utf8");
  for (const rule of forbiddenContent) {
    if (rule.pattern.test(content)) findings.push(`${rule.label}: ${file}`);
  }
}

if (findings.length) {
  console.error(
    "Public-safety check failed. Review these files without printing sensitive values:",
  );
  for (const finding of [...new Set(findings)].sort()) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.log(`Public-safety check passed for ${trackedAndNewFiles.length} reviewed files.`);
}
