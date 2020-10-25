import inject   from '@rollup/plugin-inject'
import resolve  from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import filesize from 'rollup-plugin-filesize'
import progress from 'rollup-plugin-progress'
import {terser} from 'rollup-plugin-terser'

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
        z: 'zaftig'
      }
    }),
    progress(),
    resolve(), // tells Rollup how to find node_modules
    commonjs(), // converts to ES modules
    filesize(),
    terser()
  ]
}
