import packageJson from './package.json';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import terser from '@rollup/plugin-terser';

export default [
    {
        plugins: [
            typescript(),
            terser({
                output: {
                    comments: false
                }
            })
        ],
        input: 'src/index.ts',
        output: [
            {
                file: packageJson.exports['.'].require.default,
                format: 'cjs'
            },
            {
                file: packageJson.exports['.'].import.default,
                format: 'es'
            }
        ]
    },
    {
        plugins: [
            tsConfigPaths(),
            dts()
        ],
        input: 'src/index.ts',
        output: [
            {
                file: packageJson.exports['.'].require.types,
                format: 'cjs'
            },
            {
                file: packageJson.exports['.'].import.types,
                format: 'es'
            }
        ]
    }
];