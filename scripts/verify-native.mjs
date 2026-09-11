import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Script} from 'node:vm';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
import {activeStanza} from '../app/reading-position.ts';
import {nativeStyle} from '../app/native-style.ts';
import {poems} from '../app/poems.ts';

// A host-page intro precedes the reader, and a long footer follows it.
assert.equal(activeStanza([1000,1400,2000],600,900,2070),0);
assert.equal(activeStanza([1000,1400,2000],1500,1800,2070),1);
assert.equal(activeStanza([1000,1400,2000],1800,2100,2070),2);
// Layout shifts above the reader move its reference points, not the reading line.
assert.equal(activeStanza([1800,2200,2800],1500,1800,2870),0);
assert.equal(activeStanza([],0,800,Infinity),0);

const css=nativeStyle(readFileSync('app/globals.css','utf8'));
assert.ok(!/@media\((?:min|max)-width/.test(css));
assert.ok(!/\b(?:body|html)\{|:root|@font-face/.test(css));
assert.ok(css.includes('@container wrenasmir-poems (max-width:850px)'));
assert.ok(css.includes('--paper:#fff'));
assert.ok(!css.includes('data-night'));

const renderer=await createServer({configFile:false,root:process.cwd(),plugins:[react()],resolve:{alias:{'@':process.cwd()},dedupe:['react','react-dom']},server:{middlewareMode:true,hmr:false}});
try{
 const {default:Reader}=await renderer.ssrLoadModule('/app/reader.tsx');
 const base='https://craigwrenasmir.github.io/two-poems/';
 const native=renderToString(createElement(Reader,{embedded:true,assetBase:base}));
 const standalone=renderToString(createElement(Reader));
 const lines=html=>Array.from(html.matchAll(/<span class="line">([\s\S]*?)<\/span>/g),m=>m[1]);
 assert.deepEqual(lines(native),lines(standalone));
 assert.equal(lines(native).length,276);
 assert.ok(!native.includes('<main'));
 assert.equal((native.match(/<h2 /g)||[]).length,2);
 for(const p of poems)assert.ok(native.includes(`href="${base}poems/${p.slug}.txt"`));
}finally{await renderer.close();}

const bundle=readFileSync('dist/client/native/reader.js','utf8');
new Script(bundle); // A classic script, with no module imports or JSX remaining.
assert.ok(!bundle.includes('process.env.NODE_ENV'));
assert.ok(!bundle.includes('jsxDEV'),'Native production bundle must not call the development JSX runtime');
const snippet=readFileSync('public/squarespace-snippet.txt','utf8');
assert.ok(snippet.includes('https://craigwrenasmir.github.io/two-poems/native/reader.js'));
assert.ok(!snippet.includes('<iframe'));
assert.ok(Buffer.byteLength(snippet)<1024);
assert.ok(existsSync('dist/client/edition-mono.ttf'));
assert.ok(existsSync('dist/client/native-preview/index.html'));
console.log('Native checks passed: all 276 lines preserved, local reading positions, scoped styles, host-safe headings, external assets and classic-script syntax. Browser and saved Squarespace-page behaviour are not covered by these checks.');
