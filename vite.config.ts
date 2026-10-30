import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({command,isPreview})=>({plugins:[react()],base:command==='build'||isPreview?'/portfolio/':'/',build:{rollupOptions:{output:{manualChunks:{three:['three'],motion:['gsap','gsap/ScrollTrigger']}}}}}));
