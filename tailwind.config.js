
// ✅ Tailwind CSS v4 では tailwind.config.js は必須ではない
//   作ると運用メリットがある


export default {
  // v4では必須ではないが、明示すると安心
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      /* ===============================
       * Color Tokens
       * =============================== */
      // colors: {
      //   primary: {
      //     DEFAULT: "#2563eb", // blue-600
      //     dark: "#1e40af",
      //     light: "#60a5fa",
      //   },
      //   secondary: "#9333ea",
      //   muted: "#64748b",
      // },

      /* ===============================
       * Typography
       * =============================== */
      // fontFamily: {
      //   sans: ["Inter", "system-ui", "sans-serif"],
      //   mono: ["JetBrains Mono", "monospace"],
      // },

      /* ===============================
       * Spacing / Size
       * =============================== */
      // spacing: {
      //   18: "4.5rem",
      //   22: "5.5rem",
      // },

      /* ===============================
       * Animation
       * =============================== */
      // animation: {
      //   fade: "fadeIn 0.3s ease-out",
      //   slide: "slideUp 0.4s ease-out",
      // },
      // keyframes: {
      //   fadeIn: {
      //     from: { opacity: 0 },
      //     to: { opacity: 1 },
      //   },
      //   slideUp: {
      //     from: { transform: "translateY(100%)", opacity: 0 },
      //     to: { transform: "translateY(0)", opacity: 1 },
      //   },
      // },
    },
  },

  plugins: [
    // 公式プラグインは必要になったら追加
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
};
