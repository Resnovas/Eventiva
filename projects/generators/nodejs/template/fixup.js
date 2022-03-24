/**
 * Project: @eventiva/axlr8
 * File: fixup.js
 * Path: \fixup.js
 * Created Date: Monday, March 21st 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Mon Mar 21 2022
 * Modified By: Jonathan Stevens
 * Current Version: 1.0.0
 * -----
 * Copyright (c) 2022 Resnovas - All Rights Reserved
 * -----
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 * 
 * This program has been provided under confidence of the copyright holder and is 
 * licensed for copying, distribution and modification under the terms of
 * the GNU General Public License v3.0 or later (GPL-3.0+) published as the License,
 * or (at your option) any later version of this license.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License v3.0 or later for more details.
 * 
 * You should have received a copy of the GNU General Public License v3.0 or later
 * along with this program. If not, please write to: jonathan@resnovas.com ,
 * or see http://www.gnu.org/licenses/gpl-3.0-standalone.html
 * 
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */



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