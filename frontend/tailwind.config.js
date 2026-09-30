/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oriental: {
          red: '#8B1E1E',
          darkred: '#5C1212',
          gold: '#C5A059',
          lightgold: '#F4ECD8',
          wood: '#3D2817',
          darkwood: '#25170B',
          paper: '#FBF8F1',
          ink: '#1E1E1E'
        }
      },
      fontFamily: {
        kai: ['Kaiti', 'STKaiti', 'DFKai-SB', 'BiauKai', 'serif'],
        song: ['SimSun', 'STSong', 'Songti TC', 'serif']
      }
    },
  },
  plugins: [],
}
