const fs = require("fs");
const path = require("path");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;

  fs.mkdirSync(dest, { recursive: true });

  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(
  path.join(process.cwd(), ".next", "static"),
  path.join(process.cwd(), ".next", "standalone", ".next", "static"),
);

copyDir(
  path.join(process.cwd(), "public"),
  path.join(process.cwd(), ".next", "standalone", "public"),
);

console.log("Archivos preparados para Electron");