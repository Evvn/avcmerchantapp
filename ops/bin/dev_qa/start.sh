#!/bin/bash -eu

echo "--- Copying .env.dev.memory to .env"
cp environments/.env.qa .env

echo "--- Start development server locally"
npm run start