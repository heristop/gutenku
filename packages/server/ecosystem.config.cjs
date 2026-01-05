module.exports = {
  apps: [
    {
      name: 'server',
      script: 'pnpm',
      args: 'start',
      max_memory_restart: '400M',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
