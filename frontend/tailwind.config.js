/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#fbd334",
        secondary: "#fbd334",
        darkBg: "var(--color-bg)",
        cardBg: "var(--color-card)",
        borderColor: "var(--color-border)",
        textPrimary: "var(--color-text)",
        textMuted: "var(--color-text-muted)",
        success: "#22C55E",
        error: "#EF4444",
        info: "#3B82F6",
        'delfood-blue': "#233cf6",
        'delfood-yellow': "#fbd334",
        'delfood-dark': "#1a2b4b",
      },
    },
  },
  plugins: [],
};
