/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1a4dff",
          deep: "#0b2a99",
          soft: "#dde7ff",
          ink: "#061654",
        },
        accent: {
          DEFAULT: "#ffd13a",
          soft: "#fff4c2",
        },
        midnight: "#0a1740",
        surface: {
          DEFAULT: "#ffffff",
          alt: "#f8fafd",
        },
        canvas: "#f6f9ff",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "ui-sans-serif",
          "system-ui",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "sans-serif"
        ],
        serif: [
          "Gowun Batang",
          "Noto Serif KR",
          "serif"
        ]
      }
    }
  },
  plugins: []
};
