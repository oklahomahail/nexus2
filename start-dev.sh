#!/bin/bash

# Nexus Development Environment Startup Script

echo "🚀 Starting Nexus Development Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed. Please install it first: npm install -g pnpm${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the Nexus root directory${NC}"
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
pnpm install

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd server
pnpm install
cd ..

# Check if backend .env exists
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env not found. Copying from example...${NC}"
    cp server/.env.example server/.env
    echo -e "${YELLOW}📝 Please edit server/.env with your database credentials${NC}"
fi

# Check if frontend .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Frontend .env not found. Copying from example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env with your API keys${NC}"
fi

# Check for database connection
echo -e "${BLUE}🗄️  Checking database requirements...${NC}"
echo -e "${YELLOW}📋 Make sure you have PostgreSQL running with the database 'nexus_dev'${NC}"
echo -e "${YELLOW}   You can use Docker: docker run --name nexus-postgres -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=nexus_dev -p 5432:5432 -d postgres:15${NC}"

read -p "Press Enter when your database is ready..."

# Start backend in background
echo -e "${BLUE}🔧 Starting backend server...${NC}"
cd server

# Check if backend port is available
if check_port 4000; then
    echo -e "${YELLOW}⚠️  Port 4000 is already in use. Backend might already be running.${NC}"
else
    # Generate Prisma client and run migrations
    echo -e "${BLUE}🔄 Setting up database...${NC}"
    pnpm db:generate
    pnpm db:migrate
    pnpm db:seed
    
    # Start backend server
    pnpm dev &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend server starting on http://localhost:4000${NC}"
fi

cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo -e "${BLUE}🌐 Starting frontend server...${NC}"

# Check if frontend port is available
if check_port 5173; then
    echo -e "${YELLOW}⚠️  Port 5173 is already in use. Frontend might already be running.${NC}"
else
    pnpm dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend server starting on http://localhost:5173${NC}"
fi

# Wait for servers to start
sleep 5

echo ""
echo -e "${GREEN}🎉 Nexus Development Environment is running!${NC}"
echo ""
echo -e "${BLUE}📡 Backend API:${NC} http://localhost:4000"
echo -e "${BLUE}🌐 Frontend App:${NC} http://localhost:5173"
echo -e "${BLUE}🏥 Health Check:${NC} http://localhost:4000/health"
echo ""
echo -e "${YELLOW}Test Accounts:${NC}"
echo -e "  Admin: admin@nexus.com / admin123!"
echo -e "  User:  user@nexus.com / user123!"
echo ""
echo -e "${YELLOW}💡 Useful commands:${NC}"
echo -e "  View database: cd server && pnpm db:studio"
echo -e "  Backend logs: tail -f server/logs/combined.log"
echo -e "  Stop all: pkill -f 'vite\\|tsx'"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap 'echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait