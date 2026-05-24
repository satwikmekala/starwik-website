import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#07070A',
        signal: '#C45A18',
        drift: '#B07820',
        transmit: '#4858C8',
        construct: '#0F7A6A',
        star: '#F2EDE6',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
