import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({
 plugins:[react()],
 resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))},dedupe:['react','react-dom']},
 server:{host:'127.0.0.1'},
 build:{outDir:'dist/client'},
});
