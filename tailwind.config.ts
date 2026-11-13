import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0F2342',
          navyDark: '#09172C',
          navyLight: '#18345E',
        },
        stillage: {
          blue: '#145DA0',
          blueDark: '#0D447A',
          blueLight: '#2176C7',
          sky: '#7DD3FC',
        },
        surface: {
          white: '#FFFFFF',
          slate: '#F8FAFC',
          steel: '#F1F4F7',
          // Legacy aliases mapped to cool industrial slate (cream removed per client preference)
          sand: '#F1F5F9',
          sandLight: '#F8FAFC',
          sandDark: '#CBD5E1',
        },
        steel: {
          900: '#1C2026',
          800: '#2B3036',
          600: '#4A525D',
          400: '#8C96A4',
          200: '#DCE1E7',
          100: '#F1F4F7',
          50: '#F8FAFC',
        },
        accent: {
          teal: '#00897B',
          amber: '#D97706',
        },
      },
      fontFamily: {
        display: ['var(--font-barlow)', 'sans-serif'],
        slab: ['var(--font-slab)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
