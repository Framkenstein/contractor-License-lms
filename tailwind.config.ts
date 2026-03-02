import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#1a2332',
          950: '#0d1117',
        },
        amber: {
          450: '#f5a623',
        },
      },
    },
  },
  plugins: [],
}
export default config
