'use client';

import {Fragment,useEffect,useMemo,useRef,useState} from 'react';
import {Switch} from '@/components/ui/switch';
import {poems} from './poems';
import {H,W,makeScene,transitionPlan,type Cell,type Scene} from './scenes';

function parseLocation(){
 const [slug,number]=location.hash.slice(1).split('/');
 const poem=Math.max(0,poems.findIndex(p=>p.slug===slug));
 const stanza=Math.min(poems[poem].stanzas.length-1,Math.max(0,(Number(number)||1)-1));
 return{poem,stanza,anchored:!!number};
}
function renderCells(cells:Cell[]){
 const runs:{text:string;ink:number}[]=[];
 for(let y=0;y<H;y++){
  for(let x=0;x<W;x++){
   const cell=cells[y*W+x],last=runs[runs.length-1];
   if(last&&last.ink===cell.ink)last.text+=cell.c;
   else runs.push({text:cell.c,ink:cell.ink});
  }
  if(y<H-1)runs[runs.length-1].text+='\n';
 }
 return runs.map((r,i)=><span key={i} className={`ink-${r.ink}`}>{r.text}</span>);
}
function Ascii({scene,motion,strip}:{scene:Scene;motion:boolean;strip:boolean}){
 const [cells,setCells]=useState(scene.cells);
 const latest=useRef(scene.cells);
 useEffect(()=>{
  const from=latest.current,to=scene.cells;
  let frame=0,started=0,lastFrame=0;
  if(!motion){latest.current=to;frame=requestAnimationFrame(()=>setCells(to));return()=>cancelAnimationFrame(frame);}
  const morph=transitionPlan(from,to);
  const draw=(now:number)=>{
   if(!started)started=now;
   const t=Math.min(1,(now-started)/(strip?1400:720));
   if(t<1&&now-lastFrame<35){frame=requestAnimationFrame(draw);return;}
   lastFrame=now;
   // An image arrives in bands at the modem; elsewhere existing marks move.
   const mixed=strip?to.map((cell,i)=>Math.floor(i/W)/H<t?cell:from[i]):morph(t);
   latest.current=mixed;setCells(mixed);
   if(t<1)frame=requestAnimationFrame(draw);
  };
  frame=requestAnimationFrame(draw);
  return()=>cancelAnimationFrame(frame);
 },[scene,motion,strip]);
 return <><pre className="ascii" aria-hidden="true">{renderCells(cells)}</pre><span className="sr-only">{scene.description}</span></>;
}
function place(next:{poem:number;stanza:number;anchored:boolean;focus?:boolean}){
  const id=poems[next.poem].slug;
  const node=next.anchored?document.getElementById(`${id}-${next.stanza+1}`):document.getElementById(`${id}-title`);
  if(next.anchored)node?.scrollIntoView({block:'start'});else window.scrollTo(0,0);
  if(next.focus)node?.focus({preventScroll:true});

 }
export default function Reader(){
 const [poem,setPoem]=useState(0),[stanza,setStanza]=useState(0);
 const [enhanced,setEnhanced]=useState(false),[plain,setPlain]=useState(false);
 const [motion,setMotion]=useState(false),[enlarged,setEnlarged]=useState(false);
 const article=useRef<HTMLDivElement>(null);
 const pending=useRef<{poem:number;stanza:number;anchored:boolean;focus?:boolean}|null>(null);
 const positions=useRef<number[]>([]);
 const scene=useMemo(()=>makeScene(poem,stanza,enlarged),[poem,stanza,enlarged]);
 const current=poems[poem];

 useEffect(()=>{
  const sync=()=>{
   const next=parseLocation();pending.current=next;
   setPoem(next.poem);setStanza(next.stanza);setEnlarged(false);
   setPlain(new URLSearchParams(location.search).get('view')==='plain');
   requestAnimationFrame(()=>requestAnimationFrame(()=>place(next)));
  };
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const preference=()=>setMotion(!media.matches);
  media.addEventListener('change',preference);
  const initFrame=requestAnimationFrame(()=>{preference();setEnhanced(true);sync();});
  window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);
  return()=>{cancelAnimationFrame(initFrame);media.removeEventListener('change',preference);window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync);};
 },[]);


 useEffect(()=>{
  if(pending.current){const next=pending.current;pending.current=null;requestAnimationFrame(()=>place(next));}
 },[poem,plain,enhanced]);

 useEffect(()=>{
  let raf=0;
  const nodes=Array.from(article.current?.querySelectorAll<HTMLElement>(`#${current.slug} [data-stanza]`)||[]);
  const measure=()=>{positions.current=nodes.map(n=>n.getBoundingClientRect().top+window.scrollY);};
  const update=()=>{
   raf=0;
   const mark=window.scrollY+(innerWidth<=850?Math.min(innerHeight*.6,260):innerHeight*.46);
   let found=0;positions.current.forEach((top,i)=>{if(top<=mark)found=i;});
   // The final short stanza must activate even when it cannot reach mid-screen.
   if(window.scrollY+innerHeight>=document.documentElement.scrollHeight-8)found=nodes.length-1;
   setStanza(Math.max(0,found));
  };
  const scroll=()=>{if(!raf)raf=requestAnimationFrame(update);};
  const resize=()=>{measure();scroll();};
  const observer=new ResizeObserver(resize);if(article.current)observer.observe(article.current);
  window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',resize);
  void document.fonts.ready.then(resize);measure();update();
  return()=>{cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('scroll',scroll);window.removeEventListener('resize',resize);};
 },[poem,current.slug,plain,enhanced]);

 function go(nextPoem:number,nextStanza=0,anchored=false,zoom=false){
  const next={poem:nextPoem,stanza:nextStanza,anchored,focus:true};
  pending.current=next;
  history.pushState(null,'',`${plain?'?view=plain':''}#${poems[nextPoem].slug}${anchored?'/'+(nextStanza+1):''}`);
  setPoem(nextPoem);setStanza(nextStanza);setEnlarged(zoom);
  requestAnimationFrame(()=>requestAnimationFrame(()=>place(next)));
 }
 function togglePlain(){
  const next=!plain;setPlain(next);
  history.replaceState(null,'',`${next?'?view=plain':location.pathname}#${current.slug}/${stanza+1}`);
  pending.current={poem,stanza,anchored:true};
 }
 return <div className="edition" data-enhanced={enhanced} data-plain={plain} data-motion={motion}>
  <a className="skip-link" href="#reading">Skip to poem</a>
  <header className="masthead"><a className="signature" href="#never-a-different-tomorrow" onClick={e=>{e.preventDefault();go(0);}}>Craig Smith <span>/ two poems</span></a><span className="edition-label">Newcastle</span></header>
  <nav className="poem-nav" aria-label="Poems">{poems.map((p,i)=><a key={p.slug} href={`#${p.slug}`} aria-current={poem===i?'page':undefined} onClick={e=>{e.preventDefault();go(i);}}><span>0{i+1}</span>{p.title}</a>)}</nav>
  <div className="reading-layout" ref={article}>
   <main className="poems" id="reading" tabIndex={-1}>
    {poems.map((p,pi)=><article className="poem" id={p.slug} hidden={enhanced&&pi!==poem} key={p.slug} aria-labelledby={`${p.slug}-title`}>
     <div className="poem-heading"><p className="eyebrow">0{pi+1} / Craig Smith</p><h1 id={`${p.slug}-title`} tabIndex={-1}>{p.title}</h1><p className="art-title">on ‘{p.art}’</p></div>
     {p.stanzas.map((s,i)=><div key={i} className="stanza" data-stanza={i} data-current={pi===poem&&i===stanza} id={`${p.slug}-${i+1}`} tabIndex={-1}>
      <a className="stanza-number" href={`#${p.slug}/${i+1}`} aria-label={`Link to stanza ${i+1}`} onClick={e=>{e.preventDefault();go(pi,i,true);}}>{String(i+1).padStart(2,'0')}</a>
      <p>{s.split('\n').map((line,j)=><Fragment key={j}><span className="line">{line}</span>{j<s.split('\n').length-1?'\n':''}</Fragment>)}</p>
     </div>)}
     <footer className="poem-end">
      {pi===1&&<button className="text-button inspect-link" onClick={()=>go(1,19,true,true)}>[ inspect an earlier turn ]</button>}
      <span className="end-mark" aria-hidden="true">* &nbsp; * &nbsp; *</span>
      <a className="next-poem" href={`#${poems[1-pi].slug}`} onClick={e=>{e.preventDefault();go(1-pi);}}><span>0{2-pi} / next poem</span>{poems[1-pi].title} <span aria-hidden="true">→</span></a>
      <div className="colophon"><span>Poems © Craig Smith</span><a href={`poems/${p.slug}.txt`}>Poem text ↗</a></div>
     </footer>
    </article>)}
   </main>
   <aside className="scene-panel" aria-label="Accompanying ASCII geography">
    <div className="scene-inner"><div className="scene-top"><span>0{poem+1} / {scene.label}</span><span aria-hidden="true">+</span></div>
     <Ascii scene={scene} motion={motion&&!plain} strip={poem===0&&stanza===5}/>
     <div className="scene-bottom"><span>{String(stanza+1).padStart(2,'0')} / {current.stanzas.length}</span><span>not to scale</span></div>
     <div className="reading-tools"><button className="text-button" onClick={togglePlain}>[ plain text ]</button><label className="motion-control" htmlFor="motion-enabled"><Switch id="motion-enabled" aria-label="Animate drawing transitions" checked={motion} onCheckedChange={setMotion} className="motion-switch"/>motion</label></div>
     {enlarged&&<button className="text-button return-link" onClick={()=>go(1,22,true)}>[ return to the ending ]</button>}
    </div>
   </aside>
  </div>
  {plain&&<div className="plain-toolbar"><button className="text-button" onClick={togglePlain}>[ return to illustrated reading ]</button><button className="text-button" onClick={()=>window.print()}>[ print ]</button></div>}
  <noscript><p className="no-script">Both poems are available in full above. The changing drawings need JavaScript.</p></noscript>
 </div>;
}
