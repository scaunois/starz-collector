import { defineConfig } from 'vite'

export default defineConfig({
    base: '/starz-collector/',
    build: {
        sourcemap: true,
        minify: false,
    }
})