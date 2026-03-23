# NPM Scripts for Torqvio

This folder contains the root package.json with scripts for managing the full-stack application.

## Installation

```bash
# Install all dependencies (root, frontend, backend)
npm run install:all

# One-time setup (install + copy env files)
npm run setup
```

## Development

```bash
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend  
npm run dev:backend
```

## Build

```bash
# Build both applications
npm run build

# Build only frontend
npm run build:frontend

# Build only backend
npm run build:backend
```

## Project Structure

```
torqvio/
├── npm/              # Root package.json and scripts
├── docker/           # Docker configuration
├── frontend/         # Next.js application
└── backend/          # Node.js API
```

## Usage

Run all commands from the `npm/` folder:

```bash
cd npm
npm run dev
```
