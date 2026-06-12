const { join } = require('path');

module.exports = {
  plugins: {
    // Tailwind resolves its config from the build cwd (apps/web under Vite),
    // so the repo-root config must be referenced explicitly
    tailwindcss: { config: join(__dirname, 'tailwind.config.ts') },
    autoprefixer: {},
  },
};
