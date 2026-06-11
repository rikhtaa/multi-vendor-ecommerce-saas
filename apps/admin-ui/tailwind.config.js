/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    '../admin-ui/src/**/*.{js,ts,tsx,jsx}',
    "../../packages/components/**/*.{js,ts,tsx,jsx}",
//     ...createGlobPatternsForDependencies(__dirname)
  ],
   theme: {
    extend: {
      fontFamily: {
        Poppins:["var(--font-poppins)"],
      }
    },
  },
  plugins: [],
};
