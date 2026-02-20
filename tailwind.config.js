/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dakar-emerald': '#009B77',
                'safe-blue': '#0055A4',
                'deep-charcoal': '#333333',
                'soft-gray': '#F4F4F4',
            },
        },
    },
    plugins: [],
}
