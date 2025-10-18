/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        "autumn-light": "#FFF5EC",
        "autumn-peach": "#F9DFC6",
        "autumn-orange": "#F2C199",
        "burnt-orange": "#D9822B",
        cranberry: "#A73636",
        goldenrod: "#E5B659",
        bark: "#3C2F2F",
        espresso: "#2C1E1E"
      },
      backgroundImage: {
        "autumn-gradient": "linear-gradient(to bottom, #FFF5EC, #F9DFC6 40%, #F2C199)"
      }
    }
  },
  plugins: []
};
