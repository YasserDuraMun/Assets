import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },
    server: {
      host: env.VITE_APP_HOST || '10.0.0.17',
      port: parseInt(env.VITE_APP_PORT || '8098'),
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL?.replace('/api', '') || 'http://10.0.0.17:8099',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: (id: string): string | undefined => {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor'
            }
            if (id.includes('node_modules/react-router')) {
              return 'router'
            }
            return undefined
          }
        }
      }
    },
    preview: {
      host: env.VITE_APP_HOST || '10.0.0.17',
      port: parseInt(env.VITE_APP_PORT || '8098'),
    }
  }
})
