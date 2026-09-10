import {build,createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {renderToString} from 'react-dom/server';
import {createElement} from 'react';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// A relative-URL static bundle is portable between GitHub project Pages and Sites.
// Prerender the same Reader component so both poems remain readable without JS.
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const common={configFile:false,root,resolve:{alias:{'@':root},dedupe:['react','react-dom']}};
const renderer=await createServer({...common,plugins:[react()],server:{middlewareMode:true,hmr:false}});
let markup;
try{
 const {default:Reader}=await renderer.ssrLoadModule('/app/reader.tsx');
 markup=renderToString(createElement(Reader));
}finally{await renderer.close();}
await build({...common,base:'./',plugins:[react(),{name:'prerender-poems',transformIndexHtml:html=>html.replace('<!--poems-->',markup)}],build:{outDir:'dist/client',emptyOutDir:true}});
