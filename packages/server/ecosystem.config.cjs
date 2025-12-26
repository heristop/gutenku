module.exports = {
  apps: [
    {
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '400M',
      name: 'server',
      script: 'dist/index.js',
    },
  ],
};
