#!/bin/bash
# Telkom Insight Hub Server Startup Script
# This script provides multiple ways to start the server in the background

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="telkom-insight-hub"
PORT=4000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
check_port() {
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start with screen
start_with_screen() {
    print_status "Starting server with screen..."
    
    if ! command_exists screen; then
        print_error "screen is not installed. Please install it with:"
        print_warning "  Ubuntu/Debian: sudo apt-get install screen"
        print_warning "  CentOS/RHEL: sudo yum install screen"
        return 1
    fi
    
    # Check if screen session already exists
    if screen -list | grep -q "$APP_NAME"; then
        print_warning "Screen session '$APP_NAME' already exists"
        print_status "To view: screen -r $APP_NAME"
        print_status "To detach: Ctrl+A, then D"
        return 0
    fi
    
    # Start server in screen session
    cd "$PROJECT_DIR"
    screen -dmS "$APP_NAME" npm run server
    
    # Wait a moment and check if it started successfully
    sleep 2
    if check_port; then
        print_success "Server started successfully in screen session '$APP_NAME'"
        print_status "To view the session: screen -r $APP_NAME"
        print_status "To detach: Ctrl+A, then D"
        print_status "To kill the session: screen -S $APP_NAME -X quit"
    else
        print_error "Failed to start server. Check logs with: screen -r $APP_NAME"
    fi
}

# Function to start with tmux
start_with_tmux() {
    print_status "Starting server with tmux..."
    
    if ! command_exists tmux; then
        print_error "tmux is not installed. Please install it with:"
        print_warning "  Ubuntu/Debian: sudo apt-get install tmux"
        print_warning "  CentOS/RHEL: sudo yum install tmux"
        return 1
    fi
    
    # Check if tmux session already exists
    if tmux list-sessions 2>/dev/null | grep -q "$APP_NAME"; then
        print_warning "Tmux session '$APP_NAME' already exists"
        print_status "To view: tmux attach -t $APP_NAME"
        print_status "To detach: Ctrl+B, then D"
        return 0
    fi
    
    # Start server in tmux session
    cd "$PROJECT_DIR"
    tmux new-session -d -s "$APP_NAME" "npm run server"
    
    # Wait a moment and check if it started successfully
    sleep 2
    if check_port; then
        print_success "Server started successfully in tmux session '$APP_NAME'"
        print_status "To view the session: tmux attach -t $APP_NAME"
        print_status "To detach: Ctrl+B, then D"
        print_status "To kill the session: tmux kill-session -t $APP_NAME"
    else
        print_error "Failed to start server. Check logs with: tmux attach -t $APP_NAME"
    fi
}

# Function to start with nohup
start_with_nohup() {
    print_status "Starting server with nohup..."
    
    cd "$PROJECT_DIR"
    
    # Check if process is already running
    if pgrep -f "node.*server/index.js" > /dev/null; then
        print_warning "Server process is already running"
        return 0
    fi
    
    # Start server with nohup
    nohup npm run server > server.log 2>&1 &
    SERVER_PID=$!
    
    # Wait a moment and check if it started successfully
    sleep 2
    if check_port; then
        print_success "Server started successfully with PID: $SERVER_PID"
        print_status "Output is being logged to: server.log"
        print_status "To stop the server: kill $SERVER_PID"
        print_status "To view logs: tail -f server.log"
    else
        print_error "Failed to start server. Check logs with: tail -f server.log"
        kill $SERVER_PID 2>/dev/null
    fi
}

# Function to start with PM2
start_with_pm2() {
    print_status "Starting server with PM2..."
    
    if ! command_exists pm2; then
        print_error "PM2 is not installed. Please install it with:"
        print_warning "  npm install -g pm2"
        return 1
    fi
    
    cd "$PROJECT_DIR"
    
    # Check if app is already running
    if pm2 list | grep -q "$APP_NAME"; then
        print_warning "PM2 app '$APP_NAME' is already running"
        print_status "To view logs: pm2 logs $APP_NAME"
        print_status "To stop: pm2 stop $APP_NAME"
        return 0
    fi
    
    # Start server with PM2
    pm2 start ecosystem.config.js --name "$APP_NAME"
    
    # Wait a moment and check if it started successfully
    sleep 2
    if check_port; then
        print_success "Server started successfully with PM2"
        print_status "To view logs: pm2 logs $APP_NAME"
        print_status "To stop: pm2 stop $APP_NAME"
        print_status "To restart: pm2 restart $APP_NAME"
        print_status "To monitor: pm2 monit"
    else
        print_error "Failed to start server. Check logs with: pm2 logs $APP_NAME"
        pm2 delete "$APP_NAME" 2>/dev/null
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Start the Telkom Insight Hub server in the background."
    echo ""
    echo "Options:"
    echo "  screen    Start server using screen (recommended for basic usage)"
    echo "  tmux      Start server using tmux (recommended for advanced users)"
    echo "  nohup     Start server using nohup (simple background process)"
    echo "  pm2       Start server using PM2 (recommended for production)"
    echo "  stop      Stop any running server instances"
    echo "  status    Check server status"
    echo "  logs      Show server logs"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 screen    # Start with screen"
    echo "  $0 pm2       # Start with PM2"
    echo "  $0 stop      # Stop all instances"
    echo "  $0 status    # Check if server is running"
}

# Function to stop server
stop_server() {
    print_status "Stopping server instances..."
    
    # Stop PM2 instance
    if command_exists pm2; then
        if pm2 list | grep -q "$APP_NAME"; then
            pm2 delete "$APP_NAME"
            print_success "Stopped PM2 instance"
        fi
    fi
    
    # Stop screen session
    if screen -list | grep -q "$APP_NAME"; then
        screen -S "$APP_NAME" -X quit
        print_success "Stopped screen session"
    fi
    
    # Stop tmux session
    if tmux list-sessions 2>/dev/null | grep -q "$APP_NAME"; then
        tmux kill-session -t "$APP_NAME"
        print_success "Stopped tmux session"
    fi
    
    # Stop nohup process
    if pgrep -f "node.*server/index.js" > /dev/null; then
        pkill -f "node.*server/index.js"
        print_success "Stopped nohup process"
    fi
    
    print_success "All server instances stopped"
}

# Function to check server status
check_status() {
    print_status "Checking server status..."
    
    if check_port; then
        print_success "Server is running on port $PORT"
        
        # Check which method is being used
        if command_exists pm2 && pm2 list | grep -q "$APP_NAME"; then
            print_status "Running via PM2"
        elif screen -list | grep -q "$APP_NAME"; then
            print_status "Running via screen"
        elif tmux list-sessions 2>/dev/null | grep -q "$APP_NAME"; then
            print_status "Running via tmux"
        elif pgrep -f "node.*server/index.js" > /dev/null; then
            print_status "Running via nohup"
        fi
    else
        print_warning "Server is not running on port $PORT"
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing server logs..."
    
    # Check PM2 logs first
    if command_exists pm2 && pm2 list | grep -q "$APP_NAME"; then
        print_status "Showing PM2 logs (press Ctrl+C to exit):"
        pm2 logs "$APP_NAME"
    # Check screen session
    elif screen -list | grep -q "$APP_NAME"; then
        print_status "To view screen logs: screen -r $APP_NAME"
        print_status "To detach: Ctrl+A, then D"
    # Check tmux session
    elif tmux list-sessions 2>/dev/null | grep -q "$APP_NAME"; then
        print_status "To view tmux logs: tmux attach -t $APP_NAME"
        print_status "To detach: Ctrl+B, then D"
    # Check nohup logs
    elif [ -f "server.log" ]; then
        print_status "Showing nohup logs (press Ctrl+C to exit):"
        tail -f server.log
    else
        print_warning "No active server instance found"
    fi
}

# Main script logic
case "$1" in
    "screen")
        start_with_screen
        ;;
    "tmux")
        start_with_tmux
        ;;
    "nohup")
        start_with_nohup
        ;;
    "pm2")
        start_with_pm2
        ;;
    "stop")
        stop_server
        ;;
    "status")
        check_status
        ;;
    "logs")
        show_logs
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        echo "No option specified. Use '$0 help' for usage information."
        echo ""
        echo "Quick start options:"
        echo "  $0 screen    # Start with screen (recommended)"
        echo "  $0 pm2       # Start with PM2 (production)"
        ;;
    *)
        print_error "Unknown option: $1"
        echo ""
        show_help
        exit 1
        ;;
esac