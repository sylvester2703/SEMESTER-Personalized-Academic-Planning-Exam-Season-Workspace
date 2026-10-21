import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: "#FCFBF9",
          100: "#F7F5EF",
          200: "#EFECE1",
          300: "#DFDED6",
          400: "#C4C2B8",
          500: "#9C9A8E",
          600: "#444B45",
          700: "#2E3630",
          750: "#242C26",
          800: "#1E2520",
          850: "#171D19",
          900: "#121714",
          950: "#0C100E",
        },
        ink: {
          950: "#141A16",
          900: "#202722",
          800: "#2E3831",
          700: "#414E45",
          600: "#58655D",
          500: "#718076",
          400: "#8E9E94",
          300: "#B2BEB7",
          200: "#D3DBD6",
          100: "#EAEFEA",
          50: "#F4F7F4",
        },
        forest: {
          DEFAULT: "#2D5541",
          hover: "#234434",
          light: "#3A6E54",
          tint: "#EBF3EE",
          dark: "#1A3326",
        },
        sage: {
          DEFAULT: "#829986",
          light: "#E6EDE2",
          border: "#C7D6C5",
          dark: "#5E7763",
        },
        amber: {
          warm: "#D99B38",
          light: "#FDF5E6",
          border: "#F3D8A5",
          hover: "#BF8428",
          badge: "#9A6818",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Newsreader", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(32, 39, 34, 0.04), 0 1px 2px rgba(32, 39, 34, 0.02)",
        card: "0 2px 8px -2px rgba(32, 39, 34, 0.06), 0 1px 3px rgba(32, 39, 34, 0.04)",
        dropdown: "0 8px 24px -4px rgba(32, 39, 34, 0.12), 0 2px 6px -1px rgba(32, 39, 34, 0.04)",
        elevated: "0 12px 32px -4px rgba(32, 39, 34, 0.14)",
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.625rem",
      },
    },
  },
  plugins: [],
};

export default config;
