import {createRoot,type Root} from 'react-dom/client';
import Reader from './reader';
import css from './globals.css?raw';
import {nativeStyle} from './native-style';

// The classic script works in a Squarespace HTML Code Block. All assets are
// resolved against its own URL, never against the Squarespace page's URL.
const source=(document.currentScript as HTMLScriptElement|null)?.src;
const assetBase=new URL('../',source||'https://craigwrenasmir.github.io/two-poems/native/reader.js').href;
const fontName='Wrenasmir Edition Mono';
const styles=nativeStyle(css).replaceAll("'Edition Mono'",`'${fontName}'`);
let fontReady:Promise<unknown>|undefined;
function loadFont(){
 if(!fontReady&&'FontFace' in window){
  const font=new FontFace(fontName,`url("${assetBase}edition-mono.ttf")`,{display:'swap'});
  document.fonts.add(font);
  fontReady=font.load().catch(()=>undefined);
 }
}

class WrenasmirPoems extends HTMLElement{
 private reactRoot:Root|null=null;
 connectedCallback(){
  if(this.reactRoot)return;
  loadFont();
  const shadow=this.shadowRoot||this.attachShadow({mode:'open'});
  const style=document.createElement('style');style.textContent=styles;
  const mount=document.createElement('div');
  // The light-DOM link is retained, and exposed if rendering fails.
  const fallback=document.createElement('slot');
  shadow.replaceChildren(style,mount,fallback);
  this.reactRoot=createRoot(mount,{onUncaughtError:()=>{mount.hidden=true;fallback.hidden=false;}});
  fallback.hidden=true;
  this.reactRoot.render(<Reader embedded assetBase={assetBase}/>);
 }
 disconnectedCallback(){
  // Squarespace can move a block without removing it from the page.
  queueMicrotask(()=>{if(!this.isConnected){this.reactRoot?.unmount();this.reactRoot=null;}});
 }
}
if(!customElements.get('wrenasmir-poems'))customElements.define('wrenasmir-poems',WrenasmirPoems);
