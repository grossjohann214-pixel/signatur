import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: { colors: { flow: { 50: "#f8fafc", 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1" } } },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
