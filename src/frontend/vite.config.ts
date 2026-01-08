import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

// Only load SSL certs for dev server, not during build
const httpsConfig = process.env.NODE_ENV !== 'production' && fs.existsSync('./certs/localhost-key.pem')
  ? {
      key: fs.readFileSync('./certs/localhost-key.pem'),
      cert: fs.readFileSync('./certs/localhost-cert.pem')
    }
  : undefined;

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5000,
    https: httpsConfig,
  },
})
