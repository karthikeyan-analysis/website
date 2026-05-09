/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Theme palette (requested)
        "brand-navy": "#10197E", // Primary Text (Navy)
        "brand-purple": "#662082", // Header Accent (Purple)
        "brand-maroon": "#800847", // Logo Accent (Maroon)
        "brand-black": "#000000", // Secondary Text (Jet Black)
        "brand-orange": "#E65100", // Action Accent (Orange)
        "brand-sky": "#03A9F4", // Icon Accent (Sky)
        "brand-blue": "#03A9F4", // Button Primary (Blue)

        // Back-compat keys used across the UI (mapped to new palette)
        "brand-navy-light": "#662082",
        "brand-gold": "#E65100",
        "brand-cyan": "#03A9F4",
        "brand-fuchsia": "#800847",
        "brand-lime": "#03A9F4",
        "brand-cta": "#10197E",
      },
      fontFamily: {
        // Site-wide body font
        sans: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        // Header title / display text — keeps the current Book Antiqua look
        display: [
          "Book Antiqua Bold",
          "Book Antiqua",
          "Garamond",
          "Georgia",
          "serif",
        ],
        // Numbers / stats
        numbers: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px -30px rgba(2, 6, 23, 0.45)",
        card: "0 4px 24px -10px rgba(16, 25, 126, 0.08), 0 1px 2px rgba(16, 25, 126, 0.04)",
        elevate: "0 12px 40px -16px rgba(16, 25, 126, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {},
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -10px, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0.3" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        shimmer: "shimmer 3.5s ease-in-out infinite",
        blink: "blink 1s infinite",
      },
    },
  },
  plugins: [],
};
