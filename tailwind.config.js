module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // bright blue
        secondary: '#64748B',
        app: {
          'dark': '#1E1F22',    // Darker sidebar
          'base': '#2B2D31',    // Main content area
          'light': '#313338',   // Lighter elements
          'hover': '#404249',   // Hover states
          'border': '#26282C'   // Border color
        },
        accent: {
          'blue': '#60A5FA',
          'indigo': '#818CF8',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        sm: '0 2px 8px rgb(0 0 0 / 0.08)',
        md: '0 4px 12px rgb(0 0 0 / 0.12)',
      },
      // Add scrollbar styling
      scrollbar: ['rounded'],
    }
  },
  plugins: [
    require('tailwind-scrollbar'),
  ]
};
