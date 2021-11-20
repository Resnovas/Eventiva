#!/bin/bash
#
#   Add package.json files to cjs/mjs subtrees
#

cat >lib/cjs/package.json <<!EOF
{
    "type": "commonjs"
}
!EOF

cat >lib/mjs/package.json <<!EOF
{
    "type": "module"
}
!EOF

cat >lib/njs/package.json <<!EOF
{
    "type": "module"
}
!EOF

find lib/njs -name '*.d.ts' -exec cp {} lib/mjs \;
find lib/njs -name '*.d.ts' -exec cp {} lib/cjs \;