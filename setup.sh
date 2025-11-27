#!/bin/bash
# setup.sh: Initialize RazorSports Next.js backend proxy

# Exit on errors
set -e

# Project name
PROJECT_NAME="razorsports-backend"

echo "Creating Next.js project: $PROJECT_NAME..."
npx create-next-app@latest $PROJECT_NAME --typescript --eslint --tailwind --app --src-dir --import-alias @/*

cd $PROJECT_NAME

echo "Creating API folder structure..."
mkdir -p pages/api/matches/live
mkdir -p pages/api/matches/all
mkdir -p pages/api/matches/[sportId]
mkdir -p pages/api/stream/[source]
mkdir -p pages/api/images/badge

echo "Creating placeholder API files..."

# Helper function to create index.js for API route
create_api_file() {
  FILE=$1
  cat <<EOL > $FILE
export default function handler(req, res) {
  res.status(200).json({ message: "Placeholder for $(basename $FILE)" });
}
EOL
}

# Matches
create_api_file pages/api/matches/live/popular.ts
create_api_file pages/api/matches/all/popular.ts
create_api_file pages/api/matches/[sportId]/popular.ts

# Stream
create_api_file pages/api/stream/[source]/[id].ts

# Images
create_api_file pages/api/images/badge/[badge].ts

# Sports
create_api_file pages/api/sports.ts

echo "All placeholder API files created!"

echo "Installing Axios (for fetching Streamed API)..."
npm install axios

echo "Setup complete! You can now run:"
echo "  cd $PROJECT_NAME"
echo "  npm run dev"

echo "You can deploy to Vercel directly from this folder."

