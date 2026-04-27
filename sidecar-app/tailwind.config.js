/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          elevated: 'var(--color-bg-elevated)',
          sunken: 'var(--color-bg-sunken)',
          deep: 'var(--color-bg-deep)',
          glass: 'var(--color-bg-glass)',
          'glass-dark': 'var(--color-bg-glass-dark)',
        },
        brand: {
          gold: 'var(--color-gold)',
          'gold-bright': 'var(--color-gold-bright)',
          'gold-dim': 'var(--color-gold-dim)',
          'gold-glow': 'var(--color-gold-glow)',
          navy: 'var(--color-navy)',
          'navy-deep': 'var(--color-navy-deep)',
          'navy-light': 'var(--color-navy-light)',
        },
        prd: {
          expired: { bg: 'var(--color-prd-expired-bg)', text: 'var(--color-prd-expired-text)', dot: 'var(--color-prd-expired-dot)' },
          critical: { bg: 'var(--color-prd-critical-bg)', text: 'var(--color-prd-critical-text)', dot: 'var(--color-prd-critical-dot)' },
          urgent: { bg: 'var(--color-prd-urgent-bg)', text: 'var(--color-prd-urgent-text)', dot: 'var(--color-prd-urgent-dot)' },
          watch: { bg: 'var(--color-prd-watch-bg)', text: 'var(--color-prd-watch-text)', dot: 'var(--color-prd-watch-dot)' },
          stable: { bg: 'var(--color-prd-stable-bg)', text: 'var(--color-prd-stable-text)', dot: 'var(--color-prd-stable-dot)' },
        },
        surface: {
          border: 'var(--color-border)',
          'border-subtle': 'var(--color-border-subtle)',
          'border-gold': 'var(--color-border-gold)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        data: ['var(--font-data)'],
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glow: 'var(--shadow-glow)',
        card: 'var(--shadow-card)',
      },
      transitionTimingFunction: {
        'out': 'var(--ease-out)',
        'spring': 'var(--ease-spring)',
      },
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'base': 'var(--duration-base)',
        'slow': 'var(--duration-slow)',
      }
    },
  },
  plugins: [],
}
