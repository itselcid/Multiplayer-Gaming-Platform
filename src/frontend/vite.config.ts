import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from "fs";


export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5000,
    https: {
      key: readFileSync('./certs/localhost-key.pem'),
      cert: readFileSync('./certs/localhost-cert.pem')
    },
  },
})
