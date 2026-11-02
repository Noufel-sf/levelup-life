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
        background: "#09090b",
        "secondary-bg": "#0e0e12",
        card: "#121215",
        elevated: "#18181b",
        secondary: "#18181b",
        primary: {
          DEFAULT: "#a855f7",
          foreground: "#ffffff",
          glow: "rgba(168, 85, 247, 0.4)",
        },
        "neon-cyan": "#22d3ee",
        "neon-pink": "#ec4899",
        "neon-green": "#a3e635",
        "neon-yellow": "#facc15",
        "neon-purple": "#a855f7",
        "neon-blue": "#3b82f6",
        arcade: {
          pink: "#ec4899",
          glow: "rgba(236, 72, 153, 0.4)",
        },
        cyber: {
          cyan: "#22d3ee",
          glow: "rgba(34, 211, 238, 0.4)",
        },
        terminal: {
          green: "#a3e635",
          glow: "rgba(163, 230, 53, 0.4)",
        },
        caution: {
          amber: "#facc15",
          glow: "rgba(250, 204, 21, 0.4)",
        },
        foreground: "#fafafa",
        muted: {
          DEFAULT: "#a1a1aa",
          foreground: "#71717a",
        },
        border: "#27272a",
        "border-glow": "#3f3f46",
      },
      fontFamily: {
        sans: ["'Pixelify Sans'", "'Press Start 2P'", "'Space Grotesk'", "'Inter'", "sans-serif"],
        pixel: ["'Press Start 2P'", "'Pixelify Sans'", "monospace"],
        arcade: ["'Pixelify Sans'", "'Silkscreen'", "monospace"],
        score: ["'Space Grotesk'", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "'Liberation Mono'", "monospace"],
      },
      animation: {
        'arcade-float': 'arcadeFloat 5s ease-in-out infinite',
        'arcade-float-slow': 'arcadeFloatReverse 7s ease-in-out infinite',
        'arcade-float-fast': 'arcadeFloat 3.8s ease-in-out infinite',
        'arcade-pulse-slow': 'arcadePulseSlow 4s ease-in-out infinite',
      },
      keyframes: {
        arcadeFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(3deg)' },
        },
        arcadeFloatReverse: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(8px) rotate(-3deg)' },
        },
        arcadePulseSlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
      },
      boxShadow: {
        "pixel-sm": "1px 1px 0px 0px rgba(0, 0, 0, 0.9)",
        "pixel-md": "2px 2px 0px 0px rgba(0, 0, 0, 0.95)",
        "pixel-lg": "4px 4px 0px 0px rgba(0, 0, 0, 0.95)",
        "pixel-purple": "0 0 15px rgba(168, 85, 247, 0.35)",
        "pixel-pink": "0 0 15px rgba(236, 72, 153, 0.35)",
        "pixel-cyan": "0 0 15px rgba(34, 211, 238, 0.35)",
        "pixel-green": "0 0 15px rgba(163, 230, 53, 0.35)",
        "glow-purple": "0 0 15px rgba(168, 85, 247, 0.4)",
        "glow-pink": "0 0 15px rgba(236, 72, 153, 0.4)",
        "glow-cyan": "0 0 15px rgba(34, 211, 238, 0.4)",
        "glow-green": "0 0 15px rgba(163, 230, 53, 0.4)",
        "glow-amber": "0 0 15px rgba(250, 204, 21, 0.4)",
        "ambient-card": "0 0 25px rgba(168, 85, 247, 0.12)",
        "ambient-cyan": "0 0 25px rgba(34, 211, 238, 0.15)",
      },
    },
  },
  plugins: [],
}
