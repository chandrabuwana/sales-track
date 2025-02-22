import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        "background-light": "var(--background-light)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          foreground: "white",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "white",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "white",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "white",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "white",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "white",
        },
        error: {
          DEFAULT: "var(--error)",
          foreground: "white",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
