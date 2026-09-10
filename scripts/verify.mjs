import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {poems} from '../app/poems.ts';
import {makeScene,transitionPlan,sceneText,W,H} from '../app/scenes.ts';
let count=0;
for(const [p,poem]of poems.entries()){
 const source=readFileSync(`public/poems/${poem.slug}.txt`,'utf8');
 assert.deepEqual(poem.stanzas,source.replace(/^\n+|\n+$/g,'').split(/\n[ \t]*\n(?:[ \t]*\n)*/));
 for(let s=0;s<poem.stanzas.length;s++){
  const scene=makeScene(p,s),next=makeScene(p,Math.min(s+1,poem.stanzas.length-1));
  assert.equal(scene.cells.length,W*H);assert.ok(scene.label&&scene.description);
  assert.ok(scene.cells.every(c=>c.c.length===1&&c.c.charCodeAt(0)<128));
  assert.equal(sceneText(scene).split('\n').length,H);
  const morph=transitionPlan(scene.cells,next.cells);
  assert.deepEqual(morph(0),scene.cells);assert.deepEqual(morph(1),next.cells);
  for(const t of [.2,.5,.8])assert.equal(morph(t).length,W*H);
  count++;
 }
 assert.equal(readFileSync(`dist/client/poems/${poem.slug}.txt`,'utf8'),source);
}
assert.equal(sceneText(makeScene(0,20)).match(/\*/g)?.length,2);
assert.equal(sceneText(makeScene(0,21)).match(/\*/g)?.length||0,0);
assert.notEqual(sceneText(makeScene(1,19)),sceneText(makeScene(1,19,true)));
const html=readFileSync('dist/client/index.html','utf8');
const entities={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#x27;':"'",'&#39;':"'"};
const lines=Array.from(html.matchAll(/<span class="line">([\s\S]*?)<\/span>/g),m=>m[1].replace(/&(?:amp|lt|gt|quot|#x27|#39);/g,e=>entities[e]));
assert.deepEqual(lines,poems.flatMap(p=>p.stanzas.flatMap(s=>s.split('\n'))));
for(const m of html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g))assert.ok(existsSync('dist/client/'+m[1]),m[1]);
assert.ok(!html.includes('<!--poems-->'));
console.log(`${count} scenes and their transitions verified; ${lines.length} poem lines preserved; original files and relative assets verified.`);
