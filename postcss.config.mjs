const config = {
  plugins: {
    "@tailwindcss/postcss": {
      content: {
        files: [
          "./app/**/*.{ts,tsx}",
          "./components/**/*.{ts,tsx}",
        ],
      },
    },
  },
};

export default config;
