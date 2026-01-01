# Server Deployment Guide

This guide provides multiple solutions to keep your Node.js server running even when your Putty session closes.

## Problem

When you run `npm run server` in a Putty session and then close the terminal, the Node.js process terminates because it's running in the foreground as a child process of the SSH session.

## Solutions

### 1. PM2 (Recommended for Production)

PM2 is a production process manager for Node.js applications that provides process management, monitoring, and clustering.

#### Installation
```bash
npm install -g pm2
```

#### Usage
```bash
# Start the server
pm2 start ecosystem.config.js --name telkom-insight-hub

# View logs
pm2 logs telkom-insight-hub

# Monitor processes
pm2 monit

# Stop the server
pm2 stop telkom-insight-hub

# Restart the server
pm2 restart telkom-insight-hub

# List all processes
pm2 list

# Save current processes to restart on system boot
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

#### Configuration
The [`ecosystem.config.js`](./ecosystem.config.js) file contains the PM2 configuration with:
- Process name: `telkom-insight-hub`
- Script: `./server/index.js`
- Environment: Production
- Auto-restart on failure
- Memory monitoring
- Log files

### 2. Screen (Recommended for Development)

Screen allows you to create persistent terminal sessions that continue running after you disconnect.

#### Installation
```bash
# Ubuntu/Debian
sudo apt-get install screen

# CentOS/RHEL
sudo yum install screen
```

#### Usage
```bash
# Start a new screen session
screen -S telkom-insight-hub

# Run your server
npm run server

# Detach from screen (press Ctrl+A, then D)

# Reattach to screen
screen -r telkom-insight-hub

# List all screen sessions
screen -list

# Kill a screen session
screen -S telkom-insight-hub -X quit
```

### 3. Tmux (Advanced Terminal Multiplexer)

Tmux is similar to screen but with more features and better customization.

#### Installation
```bash
# Ubuntu/Debian
sudo apt-get install tmux

# CentOS/RHEL
sudo yum install tmux
```

#### Usage
```bash
# Start a new tmux session
tmux new-session -s telkom-insight-hub

# Run your server
npm run server

# Detach from tmux (press Ctrl+B, then D)

# Reattach to tmux
tmux attach -t telkom-insight-hub

# List all tmux sessions
tmux list-sessions

# Kill a tmux session
tmux kill-session -t telkom-insight-hub
```

### 4. Nohup (Simple Background Process)

Nohup runs commands immune to hangups, with output to a non-tty.

#### Usage
```bash
# Start the server in background
nohup npm run server > server.log 2>&1 &

# View logs
tail -f server.log

# Stop the server (find PID first)
ps aux | grep "node.*server/index.js"
kill [PID]
```

### 5. Systemd Service (Linux Servers)

For production Linux servers, create a systemd service that starts automatically on boot.

#### Setup
1. Edit the [`telkom-insight-hub.service`](./telkom-insight-hub.service) file:
   - Replace `/path/to/your/project` with your actual project path
   - Replace `nodejs` user/group if needed

2. Copy the service file:
```bash
sudo cp telkom-insight-hub.service /etc/systemd/system/
```

3. Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable telkom-insight-hub
sudo systemctl start telkom-insight-hub

# Check status
sudo systemctl status telkom-insight-hub

# View logs
sudo journalctl -u telkom-insight-hub -f
```

### 6. Windows Service

For Windows servers, use the provided batch script to create a Windows service.

#### Setup
1. Install [NSSM](https://nssm.cc/download) (Non-Sucking Service Manager)
2. Add nssm.exe to your PATH
3. Run the installation script as administrator:
```cmd
install-windows-service.bat
```

This will create a Windows service that starts automatically on boot.

### 7. Automated Startup Script

The [`start-server.sh`](./start-server.sh) script provides a unified interface for starting your server with different methods:

```bash
# Make the script executable
chmod +x start-server.sh

# Start with screen
./start-server.sh screen

# Start with PM2
./start-server.sh pm2

# Start with tmux
./start-server.sh tmux

# Start with nohup
./start-server.sh nohup

# Check status
./start-server.sh status

# View logs
./start-server.sh logs

# Stop all instances
./start-server.sh stop

# Show help
./start-server.sh help
```

## Recommendations

### For Development
- **Screen** or **Tmux**: Easy to use, allows you to monitor logs and interact with the server
- **Nohup**: Simple solution for basic background running

### For Production
- **PM2**: Industry standard for Node.js production deployments
  - Provides monitoring, clustering, and automatic restarts
  - Built-in load balancing
  - Memory and CPU monitoring
  - Easy deployment and rollback

### For System Administration
- **Systemd** (Linux): Integrates with system boot process
- **Windows Service**: Integrates with Windows service manager

## Environment Variables

Make sure your environment variables are properly set. The server uses:
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment (development/production)
- Database connection strings
- Any other variables defined in your `.env` file

For systemd and Windows services, you may need to specify environment variables in the service configuration.

## Monitoring

After deployment, monitor your server with:

### PM2
```bash
pm2 monit  # Real-time monitoring
pm2 logs   # View logs
```

### Systemd
```bash
sudo systemctl status telkom-insight-hub
sudo journalctl -u telkom-insight-hub -f
```

### Manual
```bash
# Check if port is listening
netstat -tlnp | grep :4000

# Check process
ps aux | grep "node.*server/index.js"

# Check logs
tail -f server.log
```

## Troubleshooting

### Server Won't Start
1. Check if port 4000 is already in use:
   ```bash
   netstat -tlnp | grep :4000
   ```
2. Check logs for errors
3. Verify environment variables are set correctly

### Permission Issues
- Ensure the user running the service has read access to your project files
- For systemd, create a dedicated user for the service
- For Windows, ensure the service account has appropriate permissions

### Environment Variables Not Loading
- For systemd: Add `EnvironmentFile=/path/to/.env` to the service file
- For PM2: Set environment variables in `ecosystem.config.js`
- For screen/tmux: Export variables before starting the session

## Security Considerations

1. **Run as non-root user**: Never run your application as root
2. **File permissions**: Restrict access to sensitive files
3. **Environment variables**: Don't expose secrets in logs
4. **Firewall**: Configure firewall rules to only allow necessary ports
5. **Updates**: Keep Node.js and dependencies updated

## Next Steps

1. Choose the deployment method that best fits your needs
2. Set up monitoring and logging
3. Configure automatic restarts and health checks
4. Set up backup and recovery procedures
5. Consider setting up a reverse proxy (nginx) for production