import tailwindcss from '@tailwindcss/postcss';
import postcssColorFunctionalNotation from 'postcss-color-functional-notation';

export default {
  plugins: [
    tailwindcss(),
    postcssColorFunctionalNotation({ preserve: false })
  ]
};
