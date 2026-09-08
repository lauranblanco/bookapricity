import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sol: "#E8A33D",
        resol: {
          100: "#FDF0EA",
          200: "#F9DCCF",
          300: "#F3BCA4",
          400: "#EC9271",
          DEFAULT: "#E2683F",
          500: "#E2683F",
          600: "#C6512B",
          700: "#A03D1E",
          800: "#772C15",
          900: "#4C1F11",
        },
        umbral: {
          100: "#EDF0F6",
          200: "#D6DDEA",
          300: "#B2BED4",
          400: "#7E90B0",
          DEFAULT: "#35486B",
          500: "#4E628C",
          600: "#2B3B58",
          700: "#293857",
          800: "#1E2941",
          900: "#151C2C",
        },
        bruma: "#8FA3B8",
        crema: { DEFAULT: "#FBF3E4", 100: "#F5EEE0", 200: "#EBE1CE" },
        tinta: { DEFAULT: "#2A2118", 600: "#7A6E5D", 800: "#4A4136" },
        ok: { DEFAULT: "#2F6B4F", 100: "#E6F0E9", 900: "#1F4A36" },
        warn: { DEFAULT: "#E8A33D", 100: "#FCEFD5", 900: "#7A4E09" },
        bad: { DEFAULT: "#C0341C", 100: "#FBE9E5", 900: "#8E2614" },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        none: "0",
        DEFAULT: "0",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
        full: "0",
      },
    },
  },
  plugins: [],
};
export default config;
