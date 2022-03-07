const fs = require('fs');
const path = require('path');

// add package.json file to folder lib/cjs and lib/mjs
async function packagejson() {
  fs.writeFileSync(
    path.join(__dirname, 'lib', 'cjs', 'package.json'),
    JSON.stringify({ type: 'commonjs' }, null, 2)
  );
  fs.writeFileSync(
    path.join(__dirname, 'lib', 'mjs', 'package.json'),
    JSON.stringify({ type: 'module' }, null, 2)
  );
  fs.writeFileSync(
    path.join(__dirname, 'lib', 'njs', 'package.json'),
    JSON.stringify({ type: 'module' }, null, 2)
  );
}

function copyFileSync(root, file) {
  if (file.endsWith('.d.ts')) {
    fs.copyFileSync(
      path.join(__dirname, 'lib', 'njs', root, file),
      path.join(__dirname, 'lib', 'cjs', root, file)
    );
    fs.copyFileSync(
      path.join(__dirname, 'lib', 'njs', root, file),
      path.join(__dirname, 'lib', 'mjs', root, file)
    );
  } else {
    // if file is a folder, recurse
    if (
      fs.lstatSync(path.join(__dirname, 'lib', 'njs', root, file)).isDirectory()
    ) {
      const dir = fs.readdirSync(
        path.join(__dirname, 'lib', 'njs', root, file)
      );
      for (let f of dir) {
        copyFileSync(root + file + '/', f);
      }
    }
  }
}

// find all files recursively in lib/njs ending in .d.ts and copy them to lib/cjs and lib/mjs
function dts() {
  const files = fs.readdirSync(path.join(__dirname, 'lib', 'njs'));
  for (let file of files) {
    copyFileSync('', file);
  }
}
packagejson().then(dts);
