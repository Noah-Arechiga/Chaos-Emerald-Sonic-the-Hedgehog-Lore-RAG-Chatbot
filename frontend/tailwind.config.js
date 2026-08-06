/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Design tokens -> "Chaos Emerald: Sonic the Hedgehog Archive" console theme
        obsidian: '#0A0F0E',      // Page background
        panel: '#0F1C18',         // Card/panel background
        panelLine: '#1D3A31',     // Hairline borders on panels
        emerald: {
          DEFAULT: '#3FA9F5',     // Primary accent (old green: #2FE6A7)
          dim: '#1E6FB8',         // Old green #1B8F68
          glow: '#8FD3FF',        // Old green #7CFFCE
        },
        amber: '#F2B84B',         // Citation / relevance accent
        chaos: '#8B7CF6',         
        ink: {
          DEFAULT: '#EAF3EF',     // Primary text
          muted: '#7FA396',       // Secondary/label text
          faint: '#3E5C51',       // Disabled / hairline text
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        emeraldGlow: '0 0 24px 0 rgba(47, 230, 167, 0.25)',
      },
      keyframes: {
        pulseFacet: {
          '0%, 100%': { opacity: 0.55, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.06)' },
        },
        scan: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 200%' },
        },
      },
      animation: {
        pulseFacet: 'pulseFacet 1.6s ease-in-out infinite',
        scan: 'scan 3s linear infinite',
      },
    },
  },
  plugins: [],
};
