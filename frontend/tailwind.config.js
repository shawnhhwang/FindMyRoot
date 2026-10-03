/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        oriental: {
          cinnabar: '#9E2A2B',      // 朱砂紅
          lacquer: '#5C1415',       // 漆紅 / 絳紅
          palace: '#360C0D',        // 宮廷深褐紅
          gold: '#D4AF37',          // 鎏金
          amberGold: '#F3E5AB',     // 箔金淺輝
          burnishedGold: '#B8860B', // 暗金
          sandalwood: '#2E1C14',    // 紫檀木
          ebony: '#1A1412',         // 沉香烏木
          xuan: '#F9F6F0',          // 生宣紙色
          agedPaper: '#EFE9DC',     // 陳年故紙色
          ink: '#1F1B18',           // 徽墨黑
          slate: '#3F3B36',         // 端硯灰
          celadon: '#3B6E60',       // 龍泉青瓷
          jade: '#2D5A4C'           // 碧玉深綠
        }
      },
      fontFamily: {
        serif: ['"Noto Serif TC"', 'Songti TC', 'SimSun', 'serif'],
        calligraphy: ['"Ma Shan Zheng"', '"Noto Serif TC"', 'cursive', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace']
      },
      boxShadow: {
        'paper': '0 2px 15px -3px rgba(46, 28, 20, 0.07), 0 10px 20px -2px rgba(46, 28, 20, 0.04)',
        'paper-elevated': '0 10px 30px -5px rgba(46, 28, 20, 0.12), 0 20px 25px -5px rgba(46, 28, 20, 0.07)',
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.45)',
        'tablet-3d': '0 25px 50px -12px rgba(15, 10, 8, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.15)',
        'seal': '0 2px 8px rgba(158, 42, 43, 0.35)'
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F9E7B3 0%, #D4AF37 50%, #AA820A 100%)',
        'wood-radial': 'radial-gradient(circle at 50% 30%, #3D261A 0%, #1F120B 100%)',
        'ebony-radial': 'radial-gradient(circle at 50% 30%, #292421 0%, #120F0E 100%)',
        'paper-grain': 'radial-gradient(#d6cfbe 1px, transparent 1px)'
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' }
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      },
      animation: {
        'shimmer': 'shimmer 3s infinite linear',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
        'float': 'floatSlow 6s infinite ease-in-out'
      }
    },
  },
  plugins: [],
}
