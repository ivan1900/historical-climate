module.exports = {
  apps: [
    {
      name: 'climate',
      script: '.next/standalone/server.js',
      exec_mode: 'fork',
      instances: 1,
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Load .env file automatically
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // PM2+ monitoring (optional)
      // instances: 'max',
      // exec_mode: 'cluster',

      // Restart/reload behavior
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', '.next', 'coverage'],

      // Logging
      out_file: '../.pm2/logs/climate-out.log',
      error_file: '../.pm2/logs/climate-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
