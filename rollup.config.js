import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export default {
  input: 'index.js',
  output: {
    format: 'es',
    file: IS_PRODUCTION
      ? 'dist/web-vitals-element.min.js'
      : 'dist/web-vitals-element.js',
  },
  plugins: [nodeResolve(), IS_PRODUCTION ? terser() : null],
};
