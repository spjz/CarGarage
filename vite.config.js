import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5345,
    proxy: {
      '/api/vehicle-enquiry': {
        target: 'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/vehicle-enquiry/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('x-api-key', 'mG1zaRgSH21lGk5mHwqgV6Y4oGkm8UpX5VNbfHoN');
          });
        }
      }
    }
  },
});
