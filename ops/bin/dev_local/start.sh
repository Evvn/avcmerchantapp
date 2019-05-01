#!/bin/bash -eu

echo "--- Copying .env.dev.memory to .env"
cp environments/.env.dev.local .env

echo "--- Start development server locally"
npm run start