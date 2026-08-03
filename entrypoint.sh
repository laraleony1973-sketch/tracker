#!/bin/sh
set -e

echo "Running database push..."
pnpm exec prisma db push --skip-generate

echo "Seeding database..."
pnpm exec prisma db seed

echo "Starting application..."
pnpm start
