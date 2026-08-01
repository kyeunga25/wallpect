import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const distRoot = fileURLToPath(new URL("../dist", import.meta.url));

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

const files = await collectFiles(distRoot);
const sizes = new Map(
  await Promise.all(
    files.map(async (path) => {
      const file = await stat(path);
      return [relative(distRoot, path).replaceAll("\\", "/"), file.size];
    }),
  ),
);

const budgets = [
  { label: "application JavaScript", pattern: /^assets\/index-[\w-]+\.js$/, max: 350 * 1024 },
  { label: "application CSS", pattern: /^assets\/index-[\w-]+\.css$/, max: 40 * 1024 },
  { label: "HTML shell", pattern: /^index\.html$/, max: 8 * 1024 },
  { label: "service worker", pattern: /^sw\.js$/, max: 8 * 1024 },
  {
    label: "bundled sample image",
    pattern: /^assets\/sample-aurora-wallpaper\.png$/,
    max: 3 * 1024 * 1024,
  },
];

const failures = [];
for (const budget of budgets) {
  const matches = [...sizes].filter(([path]) => budget.pattern.test(path));
  if (matches.length !== 1) {
    failures.push(`${budget.label}: expected one matching file, found ${matches.length}`);
    continue;
  }
  const [[path, size]] = matches;
  if (size > budget.max) {
    failures.push(`${path}: ${size} bytes exceeds the ${budget.max}-byte ${budget.label} budget`);
  }
}

const sourceMaps = [...sizes.keys()].filter((path) => path.endsWith(".map"));
if (sourceMaps.length) failures.push(`production source maps found: ${sourceMaps.join(", ")}`);

const total = [...sizes.values()].reduce((sum, size) => sum + size, 0);
const totalBudget = 3.5 * 1024 * 1024;
if (total > totalBudget) {
  failures.push(`dist total: ${total} bytes exceeds the ${totalBudget}-byte budget`);
}

if (failures.length) {
  console.error(`Build budget failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(`Build budget passed for ${sizes.size} files (${total} bytes total).`);
}
