module.exports = {
  apps: [{
    name: 'twitter-api',
    script: 'server.js',
    instances: 'max', // CPU çekirdek sayısı kadar instance
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3038
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3038
    },
    // Restart policy
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Monitoring
    watch: false, // Production'da false olmalı
    ignore_watch: ['node_modules', 'logs'],
    
    // Auto restart on file changes (sadece development için)
    watch_options: {
      followSymlinks: false
    },
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // Environment variables
    env_file: '.env',
    
    // Health check
    health_check_grace_period: 3000,
    
    // Cluster mode settings
    instance_var: 'INSTANCE_ID',
    
    // Advanced settings
    node_args: '--max-old-space-size=1024',
    
    // Auto restart conditions
    autorestart: true,
    
    // Cron restart (her gün 02:00'da restart)
    cron_restart: '0 2 * * *',
    
    // Merge logs from all instances
    merge_logs: true,
    
    // Time zone
    time: true
  }],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'ubuntu',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'your-git-repo-url',
      path: '/var/www/twitter-api',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    }
  }
};