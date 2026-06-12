// https://github.com/vitejs/vite/discussions/3448
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
    plugins: [react(), jsconfigPaths(),tailwindcss()],
    // https://github.com/jpuri/react-draft-wysiwyg/issues/1317
    define: {
        global: 'window'
    },
    build: { chunkSizeWarningLimit: 1600 },
    optimizeDeps: {
      exclude: ["@tabler-icons-react.js"], // Reemplázalo con el nombre del paquete que causa el error
    },
    resolve: {
        alias: [
            {
                find: /^~(.+)/,
                replacement: path.join(process.cwd(), 'node_modules/$1')
            },
            {
                find: /^src(.+)/,
                replacement: path.join(process.cwd(), 'src/$1')
            }
        ]
    },
    server: {
        port: 5173,
        hmr: true, // Asegúrate de que HMR (Hot Module Replacement) esté habilitado
        watch: {
            usePolling: true, // Usa el polling para detectar cambios en sistemas de archivos remotos (como contenedores Docker)
        },
    },
    
    preview: {
        // this ensures that the browser opens upon preview start
        // this sets a default port to 3000
        port: 5173
    }
});
