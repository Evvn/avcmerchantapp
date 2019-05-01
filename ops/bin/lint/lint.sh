#!/bin/bash -eu

echo "--- Setup npm auth"
sh ops/bin/npm_auth.sh
echo "--- Restoring npm packages"
npm install
echo "--- Remove npmrc"
rm .npmrc
echo "--- Linting the project"
npm run lint