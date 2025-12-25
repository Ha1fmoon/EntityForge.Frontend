import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5110',
                changeOrigin: true,
                secure: false,
                timeout: 180000,
                proxyTimeout: 180000,
                configure: (proxy) => {
                    proxy.on('error', (err) => {
                        console.error('Proxy error:', err.message)
                    })
                },
            },
        },
    },
})