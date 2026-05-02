/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#060816",
          900: "#0b1020",
          800: "#11182d",
          700: "#17213a",
        },
        accent: {
          400: "#67e8f9",
          500: "#22d3ee",
          600: "#0891b2",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(103,232,249,0.1), 0 22px 50px rgba(2,8,23,0.65)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.14) 1px, transparent 0)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease-out",
      },
    },
  },
  plugins: [],
};
