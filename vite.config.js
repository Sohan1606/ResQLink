import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on current mode
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    
    // Path aliases for cleaner imports (matches your project structure)
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@services": path.resolve(__dirname, "./src/services"),
      },
    },

    // Development server settings
    server: {
      port: 3000,
      host: true, // For network access (LAN testing)
      open: true, // Auto-open browser
      proxy: {
        // Proxy API calls to your Node.js backend during development
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },

    // Production build optimizations
    build: {
      outDir: "dist",
      sourcemap: env.VITE_SOURCEMAP === 'true', // Disable in production
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            // Separate chunk for your heavy UI libraries
            ui: ["@headlessui/react", "@heroicons/react"],
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Increase for larger apps
    },

    // Environment-specific defines
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __API_URL__: JSON.stringify(
        mode === 'production' 
          ? env.VITE_API_URL || 'https://api.resqlink.com'
          : 'http://localhost:5000'
      ),
    },

    // Optimize dependencies for faster cold starts
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },

    // CSS preprocessing
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "./src/styles/variables.scss";`,
        },
      },
    },
  }
})
