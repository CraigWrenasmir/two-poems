'use client';

import {Fragment,useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Switch} from '@/components/ui/switch';
import {poems} from './poems';
import {activeStanza} from './reading-position';
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
type Place={poem:number;stanza:number;anchored:boolean;focus?:boolean};
type ReaderProps={embedded?:boolean;assetBase?:string};
export default function Reader({embedded=false,assetBase=''}:ReaderProps){
 const edition=useRef<HTMLDivElement>(null);
 const Heading=embedded?'h2':'h1';
 const ReadingSurface=embedded?'div':'main';
 const place=useCallback((next:Place)=>{
  const id=poems[next.poem].slug;
  const node=edition.current?.querySelector<HTMLElement>(`#${id}${next.anchored?'-'+(next.stanza+1):'-title'}`);
  if(next.anchored)node?.scrollIntoView({block:'start'});
  else if(embedded)edition.current?.scrollIntoView({block:'start'});
  else window.scrollTo(0,0);
  if(next.focus)node?.focus({preventScroll:true});
 },[embedded]);
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
  const initFrame=requestAnimationFrame(()=>{preference();setEnhanced(true);if(!embedded)sync();});
  if(!embedded){window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);}
  return()=>{cancelAnimationFrame(initFrame);media.removeEventListener('change',preference);window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync);};
 },[embedded,place]);


 useEffect(()=>{
  if(pending.current){const next=pending.current;pending.current=null;requestAnimationFrame(()=>place(next));}
 },[poem,plain,enhanced,place]);

 useEffect(()=>{
  let raf=0,disposed=false;
  const nodes=Array.from(article.current?.querySelectorAll<HTMLElement>(`#${current.slug} [data-stanza]`)||[]);
  const measure=()=>{positions.current=nodes.map(n=>n.getBoundingClientRect().top+window.scrollY);};
  const update=()=>{
   raf=0;
   // Host content (images, accordions) may move the native reader after mount.
   if(embedded)measure();
   const narrow=(embedded?edition.current?.clientWidth||innerWidth:innerWidth)<=850;
   const panel=edition.current?.querySelector<HTMLElement>('.scene-panel');
   const stickyTop=embedded?parseFloat(getComputedStyle(edition.current!).getPropertyValue('--native-sticky-top'))||0:0;
   const readingLine=narrow?Math.max(Math.min(innerHeight*.6,260),stickyTop+(panel?.offsetHeight||0)+28):Math.max(innerHeight*.46,stickyTop+80);
   const end=embedded?(nodes.at(-1)?.getBoundingClientRect().bottom??Infinity)+window.scrollY:document.documentElement.scrollHeight;
   setStanza(activeStanza(positions.current,window.scrollY+readingLine,window.scrollY+innerHeight,end));
  };
  const scroll=()=>{if(!raf)raf=requestAnimationFrame(update);};
  const resize=()=>{if(!disposed){measure();scroll();}};
  const observer=new ResizeObserver(resize);if(article.current)observer.observe(article.current);
  window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',resize);
  void document.fonts.ready.then(resize);measure();update();
  return()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('scroll',scroll);window.removeEventListener('resize',resize);};
 },[poem,current.slug,plain,enhanced,embedded]);

 function go(nextPoem:number,nextStanza=0,anchored=false,zoom=false){
  const next={poem:nextPoem,stanza:nextStanza,anchored,focus:true};
  pending.current=next;
  if(!embedded)history.pushState(null,'',`${plain?'?view=plain':''}#${poems[nextPoem].slug}${anchored?'/'+(nextStanza+1):''}`);
  setPoem(nextPoem);setStanza(nextStanza);setEnlarged(zoom);
  requestAnimationFrame(()=>requestAnimationFrame(()=>place(next)));
 }
 function togglePlain(){
  const next=!plain;setPlain(next);
  if(!embedded)history.replaceState(null,'',`${next?'?view=plain':location.pathname}#${current.slug}/${stanza+1}`);
  pending.current={poem,stanza,anchored:true};
 }
 return <div ref={edition} className="edition" data-enhanced={enhanced} data-plain={plain} data-motion={motion}>
  <a className="skip-link" href="#reading" onClick={embedded?e=>{e.preventDefault();const target=edition.current?.querySelector<HTMLElement>('#reading');target?.scrollIntoView({block:'start'});target?.focus({preventScroll:true});}:undefined}>Skip to poem</a>
  <header className="masthead"><a className="signature" href={`${embedded?assetBase:''}#never-a-different-tomorrow`} onClick={e=>{e.preventDefault();go(0);}}>Craig Smith <span>/ two poems</span></a><span className="edition-label">Newcastle</span></header>
  <nav className="poem-nav" aria-label="Poems">{poems.map((p,i)=><a key={p.slug} href={`${embedded?assetBase:''}#${p.slug}`} aria-current={poem===i?'page':undefined} onClick={e=>{e.preventDefault();go(i);}}><span>0{i+1}</span>{p.title}</a>)}</nav>
  <div className="reading-layout" ref={article}>
   <ReadingSurface className="poems" id="reading" tabIndex={-1}>
    {poems.map((p,pi)=><article className="poem" id={p.slug} hidden={enhanced&&pi!==poem} key={p.slug} aria-labelledby={`${p.slug}-title`}>
     <div className="poem-heading"><p className="eyebrow">0{pi+1} / Craig Smith</p><Heading id={`${p.slug}-title`} tabIndex={-1}>{p.title}</Heading><p className="art-title">on ‘{p.art}’</p></div>
     {p.stanzas.map((s,i)=><div key={i} className="stanza" data-stanza={i} data-current={pi===poem&&i===stanza} id={`${p.slug}-${i+1}`} tabIndex={-1}>
      <a className="stanza-number" href={`${embedded?assetBase:''}#${p.slug}/${i+1}`} aria-label={`${embedded?'Go':'Link'} to stanza ${i+1}`} onClick={e=>{e.preventDefault();go(pi,i,true);}}>{String(i+1).padStart(2,'0')}</a>
      <p>{s.split('\n').map((line,j)=><Fragment key={j}><span className="line">{line}</span>{j<s.split('\n').length-1?'\n':''}</Fragment>)}</p>
     </div>)}
     <footer className="poem-end">
      {pi===1&&<button className="text-button inspect-link" onClick={()=>go(1,19,true,true)}>[ inspect an earlier turn ]</button>}
      <span className="end-mark" aria-hidden="true">* &nbsp; * &nbsp; *</span>
      <a className="next-poem" href={`${embedded?assetBase:''}#${poems[1-pi].slug}`} onClick={e=>{e.preventDefault();go(1-pi);}}><span>0{2-pi} / next poem</span>{poems[1-pi].title} <span aria-hidden="true">→</span></a>
      <div className="colophon"><span>Poems © Craig Smith</span><a href={`${assetBase}poems/${p.slug}.txt`}>Poem text ↗</a></div>
     </footer>
    </article>)}
   </ReadingSurface>
   <aside className="scene-panel" aria-label="Accompanying ASCII geography">
    <div className="scene-inner"><div className="scene-top"><span>0{poem+1} / {scene.label}</span><span aria-hidden="true">+</span></div>
     <Ascii scene={scene} motion={motion&&!plain} strip={poem===0&&stanza===5}/>
     <div className="scene-bottom"><span>{String(stanza+1).padStart(2,'0')} / {current.stanzas.length}</span><span>not to scale</span></div>
     <div className="reading-tools"><button className="text-button" onClick={togglePlain}>[ plain text ]</button><label className="motion-control" htmlFor="motion-enabled"><Switch id="motion-enabled" aria-label="Animate drawing transitions" checked={motion} onCheckedChange={setMotion} className="motion-switch"/>motion</label></div>
     {enlarged&&<button className="text-button return-link" onClick={()=>go(1,22,true)}>[ return to the ending ]</button>}
    </div>
   </aside>
  </div>
  {plain&&<div className="plain-toolbar"><button className="text-button" onClick={togglePlain}>[ return to illustrated reading ]</button>{embedded?<a className="text-button" href={`${assetBase}?view=plain#${current.slug}`} target="_blank" rel="noopener">[ printable edition ↗ ]</a>:<button className="text-button" onClick={()=>window.print()}>[ print ]</button>}</div>}
  <noscript><p className="no-script">Both poems are available in full above. The changing drawings need JavaScript.</p></noscript>
 </div>;
}
