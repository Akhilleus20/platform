module.exports = {
    theme: {
        extend: {
            colors: {
                'klave-dark-blue': '#00021A',
                'klave-light-blue': '#00BFFF',
                'klave-cyan': '#00FFD5'
            }
        }
    },
    variants: {
        extend: {}
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms')({
            strategy: 'class'
        }),
        require('daisyui')
    ]
};