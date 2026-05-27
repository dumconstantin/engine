module.exports = {
  exportAppStructure: true,
  webpack: {
    development: {
      devServer: (config) => ({ ...config, port: 8081 }),
    },
  },
};
