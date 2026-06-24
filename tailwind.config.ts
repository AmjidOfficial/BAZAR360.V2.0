// Bazar360 Luxury Theme Engine - Tailwind Configuration Reference
// Designed for both Tailwind CSS v3 / v4 integration and documentation.
// In the Vite/Tailwind v4 pipeline, these tokens are mounted directly via index.css using CSS variables.

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Seamless Class-based mode switching
  theme: {
    extend: {
      colors: {
        // Luxury Page & UI tokens
        bg: {
          primary: "var(--color-bg-primary)",     // Seamless adaptive canvas
          secondary: "var(--color-bg-secondary)", // Elevated bento containers
        },
        text: {
          main: "var(--color-text-main)",         // High contrast crisp body text
          muted: "var(--color-text-muted)",       // Subdued secondary metadata
        },
        border: {
          main: "var(--color-border-main)",       // Elegant thin hairline borders
        },
        accent: {
          main: "var(--color-accent-main)",       // Warm Champagne Gold highlight
          hover: "var(--color-accent-hover)",     // Darker/lighter focus hover state
        },
        // Teal & Neutral design tokens
        'brand-teal-deep': '#1F6F5F',
        'brand-teal-active': '#2FA084',
        'brand-teal-light': '#6FCF97',
        'bg-neutral': '#EEEEEE',
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Work Sans", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        luxury: "0.15em",
        extreme: "0.25em",
      },
      boxShadow: {
        'luxury-glow': '0 0 40px rgba(197, 168, 128, 0.08)',
        'elevated': '0 12px 40px -10px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
