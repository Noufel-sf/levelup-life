/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#100B1D",
        "secondary-bg": "#19112B",
        card: "#211735",
        elevated: "#2B2042",
        primary: {
          DEFAULT: "#A855F7",
          foreground: "#F5F0FF",
          glow: "rgba(168, 85, 247, 0.4)",
        },
        arcade: {
          pink: "#F472B6",
          glow: "rgba(244, 114, 182, 0.4)",
        },
        cyber: {
          cyan: "#22D3EE",
          glow: "rgba(34, 211, 238, 0.4)",
        },
        terminal: {
          green: "#4ADE80",
          glow: "rgba(74, 222, 128, 0.4)",
        },
        caution: {
          amber: "#FACC15",
          glow: "rgba(250, 204, 21, 0.4)",
        },
        foreground: "#F5F0FF",
        muted: {
          DEFAULT: "#A99BBF",
          foreground: "#7D6F93",
        },
        border: "#403052",
        "border-glow": "#795290",
      },
      fontFamily: {
        sans: ["'Pixelify Sans'", "'Silkscreen'", "'Press Start 2P'", "monospace"],
        pixel: ["'Press Start 2P'", "'Pixelify Sans'", "monospace"],
        arcade: ["'Silkscreen'", "'Pixelify Sans'", "monospace"],
      },
      boxShadow: {
        "pixel-sm": "2px 2px 0px 0px rgba(0, 0, 0, 0.8)",
        "pixel-md": "3px 3px 0px 0px rgba(0, 0, 0, 0.9)",
        "pixel-lg": "4px 4px 0px 0px rgba(0, 0, 0, 0.95)",
        "pixel-purple": "3px 3px 0px 0px #7932c4, 5px 5px 0px 0px rgba(0,0,0,0.8)",
        "pixel-pink": "3px 3px 0px 0px #db2777, 5px 5px 0px 0px rgba(0,0,0,0.8)",
        "pixel-cyan": "3px 3px 0px 0px #0891b2, 5px 5px 0px 0px rgba(0,0,0,0.8)",
        "pixel-green": "3px 3px 0px 0px #16a34a, 5px 5px 0px 0px rgba(0,0,0,0.8)",
        "glow-purple": "0 0 15px rgba(168, 85, 247, 0.4)",
        "glow-pink": "0 0 15px rgba(244, 114, 182, 0.4)",
        "glow-cyan": "0 0 15px rgba(34, 211, 238, 0.4)",
      },
    },
  },
  plugins: [],
}

