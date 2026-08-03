#!/bin/sh
set -e

echo "Running database push..."
npx prisma db push --skip-generate

echo "Seeding database..."
npx prisma db seed

echo "Starting application..."
npm start
