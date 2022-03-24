/**
 * Project: @eventiva/eventiva
 * File: components.ts
 * Path: \projects\generators\nodejs\components.ts
 * Created Date: Monday, March 21st 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Tue Mar 22 2022
 * Modified By: Jonathan Stevens
 * Current Version: 0.0.0
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

import { ComponentContext, ComponentFile } from '@teambit/generator';
import fs from 'fs'
import path from 'path'

const header = `/**
 * Project: @eventiva/projectname
 * File: filename
 * Path: path/to/filename
 * Created Date: full length date (e.g. Monday, March 21st 2022)
 * Author: your name
 * -----
 * Last Modified: date last modified (e.g. Mon Mar 21 2022)
 * Modified By: your name
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


`

// find files in the template and create the json object
export function readPath(root: string, context: ComponentContext, local: string = '', Component: ComponentFile[] = []) {

  Component.push(
    {
    relativePath: 'package.json',
    isMain: false,
    content: `{
  "name": "@eventiva/${context.name}",
  "version": "1.0.0",
  "types": "dist/index.d.ts",
  "typings": "dist/index.d.ts",
  "main": "lib/cjs/index.js",
  "module": "lib/mjs/index.js",
  "esnext": {
    "main": "lib/njs/index.js"
  },
  "config": {},
  "exports": {
    ".": {
      "import": "./lib/mjs/index.js",
      "require": "./lib/cjs/index.js"
    }
  },
  "publishConfig": {
    "typings": "dist/${context.name}-public.d.ts",
    "types": "dist/${context.name}-public.d.ts",
    "access": "public"
  },
  "scripts": {
    "build": "tsoa spec-and-routes && heft build && node fixup.js",
    "start": "functions-framework --target=handler --source=lib/cjs/Google/index.js",
    "clean": "heft clean"
  },
  "dependencies": {
    "@google-cloud/functions-framework": "^2.1.0",
    "typescript": "^4.4.4",
    "uuid": "^8.3.2",
    "tslib": "~2.3.1",
    "tsoa": "^3.14.1",
    "body-parser": "^1.19.1",
    "express": "^4.17.1",
    "@tsoa/runtime": "~3.13.0",
    "reflect-metadata": "^0.1.13",
    "swagger-ui-express": "~4.3.0",
    "axios": "~0.26.0"
  },
  "devDependencies": {
    "@types/express": "~4.17.13",
    "@types/node": "^16.11.6",
    "ts-node": "~10.4.0",
    "@types/body-parser": "~1.19.2",
    "@types/swagger-ui-express": "~4.1.3",
    "@eventiva/functions-rig": "workspace:*",
    "@rushstack/heft": "~0.42.2"
  }
}`
  },
    {
    relativePath: 'index.js',
    isMain: true,
    content: `export * from './src/index'`
  })

  const files = fs.readdirSync(path.join(root, local))
  files.forEach(file => {
    const filePath = path.join(root, local, file)
    if (!file.includes('.')) {
      Component = readPath(root, context, path.join(local, file), Component)
      return
    }
    else {
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const fileData = {
        relativePath: file.endsWith('.txt') ? path.join(local, file.replace('.txt', '')) : path.join(local, file),
        content: header + fileContent,
      }
      // add the file to the template
      Component.push(fileData)
      return
    }
  })
  return Component
}