import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export default [
  {
    input: 'src/index.js',
    output: {
      format: 'es',
      file: IS_PRODUCTION
        ? 'dist/web-vitals-element.min.js'
        : 'dist/web-vitals-element.js',
    },
    plugins: [
      nodeResolve(),
      IS_PRODUCTION ? terser() : null,
      postcss({
        plugins: [],
      }),
    ],
  },
  {
    input: 'src/index-styled.js',
    output: {
      format: 'es',
      file: IS_PRODUCTION
        ? 'dist/web-vitals-element.styled.min.js'
        : 'dist/web-vitals-element.styled.js',
    },
    plugins: [
      nodeResolve(),
      IS_PRODUCTION ? terser() : null,
      postcss({
        plugins: [],
      }),
    ],
  },
];
