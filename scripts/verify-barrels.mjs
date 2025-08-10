import fs from "fs";
import path from "path";
import glob from "fast-glob";

const SRC_DIR = path.resolve("./src");

function verifyExports(filePath) {
  const dir = path.dirname(filePath);
  const content = fs.readFileSync(filePath, "utf8");

  const exportMatches =
    content.match(/export\s+.*?from\s+['"](.*?)['"]/g) || [];

  exportMatches.forEach((exp) => {
    const [, relPath] = exp.match(/['"](.*?)['"]/) || [];
    if (!relPath) return;

    const targetPath = path.resolve(dir, relPath);
    const candidates = [
      targetPath,
      `${targetPath}.ts`,
      `${targetPath}.tsx`,
      path.join(targetPath, "index.ts"),
      path.join(targetPath, "index.tsx"),
    ];

    if (!candidates.some((f) => fs.existsSync(f))) {
      console.error(`❌ Broken export in ${filePath}: ${relPath} not found`);
      process.exitCode = 1;
    }
  });
}

const barrelFiles = glob.sync(`${SRC_DIR}/**/index.ts`);

barrelFiles.forEach(verifyExports);

if (process.exitCode !== 1) {
  console.log("✅ All barrel exports are valid.");
}
