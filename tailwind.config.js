module.exports = {
  purge: {
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
    safelist: [
      "text-gray-500",
      "bg-gray-50",
      "hover:bg-gray-100",
      "focus:ring-gray-50",
      "opacity-50",
      "text-green-500",
      "bg-green-50",
      "hover:bg-green-100",
      "focus:ring-green-50",
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
