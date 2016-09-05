import { paramCase, pascalCase, camelCase } from 'change-case';
import { readFileSync, appendFileSync } from 'fs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import nodeResolve from 'rollup-plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';
// import babel from 'rollup-plugin-babel';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const moduleId = paramCase(pkg.name);
const moduleName = camelCase(pkg.name);

appendFileSync('./built/index.d.ts', `export as namespace ${moduleName};\n`);

console.log('moduleId:', moduleId);
console.log('moduleName:', moduleName);

export default {
  entry: 'built/main.js',
  sourceMap: (process.env.NODE_ENV === 'test') ? 'inline' : true,
  moduleId,
  moduleName,

  /// global dependecies
//   option: {
//       globals: ['ko', '$', '_'],
//   },

  plugins: [
    // nodeResolve({
    //   main: true,
    //   jsnext: true
    // }),
    // commonjs({
    //   include: 'node_modules/**'
    // }),
    sourcemaps({
      exclude: 'src/**'
    }),
    // babel({
    //   exclude: 'node_modules/**'
    // })
  ],
  targets: [
    { dest: `dist/${moduleId}.js`, format: 'iife' },
    { dest: `dist/${moduleId}.umd.js`, format: 'umd' },
    // { dest: `dist/${moduleId}.mjs`, format: 'es' },
  ],
};