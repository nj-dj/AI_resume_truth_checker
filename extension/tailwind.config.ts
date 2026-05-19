import type { Config } from "tailwindcss";

export default {
  content: ["./popup.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111315",
        paper: "#f8faf7",
        accent: "#4edea3",
      },
      borderRadius: {
        xl: "10px",
      },
    },
  },
  plugins: [],
} satisfies Config;
