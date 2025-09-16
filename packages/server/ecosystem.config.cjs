module.exports = {
  apps: [
    {
      name: 'server',
      script: 'ts-node',
      args: 'src/index.ts',
      max_memory_restart: '400M',
    },
  ],
};
