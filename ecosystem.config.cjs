module.exports = {
  apps: [
    {
      name: 'gutenku-server',
      cwd: '/var/www/gutenku/packages/server',
      script: 'dist/src/index.js',
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '1G',
      out_file: '/var/log/pm2/gutenku-server.out.log',
      error_file: '/var/log/pm2/gutenku-server.err.log',
      merge_logs: true,
      time: true,
    },
  ],
};
