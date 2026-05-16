import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#eef2ff", 500: "#4F46E5", 600: "#4338CA", 700: "#3730A3" },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
