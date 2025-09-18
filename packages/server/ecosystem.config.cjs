module.exports = {
  apps: [
    {
      name: 'server',
      script: 'npm',
      args: 'start',
      max_memory_restart: '400M',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
