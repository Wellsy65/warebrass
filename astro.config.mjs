import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.warebrass.com',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    server: {
      allowedHosts: ['desk-dev.voltnet.co.uk'],
    },
  },
});
