#!/bin/bash

# Deployment script for Nexus application
# Usage: ./scripts/deploy.sh [environment] [platform]
# Example: ./scripts/deploy.sh production vercel

set -e

ENVIRONMENT=${1:-production}
PLATFORM=${2:-vercel}

echo "🚀 Deploying Nexus to $PLATFORM ($ENVIRONMENT environment)"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Pre-deployment checks
check_dependencies() {
    log "Checking dependencies..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    NODE_VERSION=$(node -v | sed 's/v//')
    REQUIRED_VERSION="20.0.0"
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        error "Node.js version $NODE_VERSION is too old. Please upgrade to $REQUIRED_VERSION or higher"
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        error "pnpm is not installed. Run: npm install -g pnpm"
    fi
    
    success "Dependencies check passed"
}

# Environment setup
setup_environment() {
    log "Setting up environment for $ENVIRONMENT..."
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            warn ".env file created from .env.example. Please update it with your values."
        else
            error ".env.example file not found"
        fi
    fi
    
    # Set environment-specific variables
    case $ENVIRONMENT in
        "development")
            export VITE_API_ENVIRONMENT="development"
            export VITE_API_BASE_URL="http://localhost:4000/api"
            ;;
        "staging")
            export VITE_API_ENVIRONMENT="staging"
            export VITE_API_BASE_URL="https://api-staging.nexus.com/v1"
            ;;
        "production")
            export VITE_API_ENVIRONMENT="production"
            export VITE_API_BASE_URL="https://api.nexus.com/v1"
            ;;
        *)
            error "Unknown environment: $ENVIRONMENT"
            ;;
    esac
    
    success "Environment setup completed"
}

# Build the application
build_app() {
    log "Building application..."
    
    # Install dependencies
    pnpm install --frozen-lockfile
    
    # Run type checking
    log "Running type checks..."
    pnpm typecheck
    
    # Run linting
    log "Running linter..."
    pnpm lint
    
    # Run tests
    if command -v pnpm test &> /dev/null; then
        log "Running tests..."
        pnpm test run
    fi
    
    # Build the application
    log "Building for $ENVIRONMENT..."
    pnpm build
    
    success "Build completed"
}

# Deploy to Vercel
deploy_vercel() {
    log "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        error "Vercel CLI is not installed. Run: npm install -g vercel"
    fi
    
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod
    else
        vercel
    fi
    
    success "Deployed to Vercel"
}

# Deploy to Netlify
deploy_netlify() {
    log "Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        error "Netlify CLI is not installed. Run: npm install -g netlify-cli"
    fi
    
    if [ "$ENVIRONMENT" = "production" ]; then
        netlify deploy --prod --dir=dist
    else
        netlify deploy --dir=dist
    fi
    
    success "Deployed to Netlify"
}

# Deploy using Docker
deploy_docker() {
    log "Deploying using Docker..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Build Docker image
    DOCKER_TAG="nexus:${ENVIRONMENT}-$(date +%Y%m%d%H%M%S)"
    
    log "Building Docker image: $DOCKER_TAG"
    docker build \
        --target production \
        --build-arg VITE_API_ENVIRONMENT="$ENVIRONMENT" \
        --build-arg VITE_API_BASE_URL="$VITE_API_BASE_URL" \
        --build-arg VITE_CLAUDE_API_KEY="$VITE_CLAUDE_API_KEY" \
        -t "$DOCKER_TAG" \
        .
    
    # Run container
    log "Starting Docker container..."
    docker run -d \
        --name "nexus-$ENVIRONMENT" \
        -p 80:80 \
        "$DOCKER_TAG"
    
    success "Docker container started"
}

# Deploy using Docker Compose
deploy_docker_compose() {
    log "Deploying using Docker Compose..."
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Set compose profile based on environment
    case $ENVIRONMENT in
        "development")
            COMPOSE_PROFILES="dev"
            ;;
        "production")
            COMPOSE_PROFILES="prod"
            ;;
        "staging")
            COMPOSE_PROFILES="staging"
            ;;
        *)
            COMPOSE_PROFILES="dev"
            ;;
    esac
    
    log "Starting services with profile: $COMPOSE_PROFILES"
    COMPOSE_PROFILES="$COMPOSE_PROFILES" docker-compose up -d
    
    success "Docker Compose deployment completed"
}

# Main deployment function
main() {
    check_dependencies
    setup_environment
    
    case $PLATFORM in
        "vercel")
            build_app
            deploy_vercel
            ;;
        "netlify")
            build_app
            deploy_netlify
            ;;
        "docker")
            deploy_docker
            ;;
        "docker-compose")
            deploy_docker_compose
            ;;
        *)
            error "Unknown platform: $PLATFORM. Supported platforms: vercel, netlify, docker, docker-compose"
            ;;
    esac
    
    success "🎉 Deployment to $PLATFORM completed successfully!"
}

# Run main function
main "$@"
