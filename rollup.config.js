import inject   from '@rollup/plugin-inject'
import resolve  from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import filesize from 'rollup-plugin-filesize'
import progress from 'rollup-plugin-progress'
import uglify   from 'rollup-plugin-uglify'

const prod = true

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/movies.js',
    format: 'iife'
  },
  plugins: [
    inject({
      include: 'src/**/*.js',
      exclude: 'node_modules/**',
      modules: {
        m: 'mithril',
        b: 'bss'
      }
    }),
    progress(),
    resolve(), // tells Rollup how to find node_modules
    commonjs(), // converts to ES modules
    filesize(),
    prod && uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    })
  ]
}
