// Reuse the edition's styling inside a shadow root. Layout breakpoints follow
// the Code Block's width, rather than the width of the surrounding browser.
export function nativeStyle(css:string){
 return css
  .replace(/@font-face\{[^}]*\}/g,'')
  .replace(/:root/g,':host')
  .replace(/\bhtml\{/g,':host{')
  .replace(/\bbody\{/g,'.edition{')
  .replace(/\bh1\b/g,'h2')
  .replace(/@media(\((?:min|max)-width[^{}]*)\{/g,'@container wrenasmir-poems $1{')
  .replace(/([\d.]+)vw\b/g,'$1cqw')
  + `
 :host{all:initial;display:block;min-width:0;max-width:100%;container:wrenasmir-poems / inline-size;color-scheme:light;--paper:#fff;--native-sticky-top:0px}
 .edition{position:relative;display:block;width:100%;margin:0;line-height:normal;text-align:left;scroll-margin-top:calc(var(--native-sticky-top) + 16px);isolation:isolate}
 [hidden]{display:none!important}
 .scene-panel{top:var(--native-sticky-top);height:calc(100svh - var(--native-sticky-top));background:var(--paper)}
 .poems{scroll-margin-top:calc(var(--native-sticky-top) + 24px)}
 .stanza{scroll-margin-top:calc(var(--native-sticky-top) + 70px)}
 .plain-toolbar{position:sticky;bottom:0;left:auto;right:auto;flex-wrap:wrap}
 .plain-toolbar a{text-decoration:none}
 .edition[data-plain=true] .stanza{scroll-margin-top:calc(var(--native-sticky-top) + 25px)}
 .skip-link{position:absolute;top:16px;opacity:0;pointer-events:none;background:var(--paper);color:var(--ink);border:1px solid var(--rule)}
 .skip-link:focus{opacity:1;pointer-events:auto}
 @container wrenasmir-poems (min-width:851px){
  .ascii{font-size:min(1.99cqw,calc((100svh - var(--native-sticky-top) - 285px)/62.4))}
 }
 @container wrenasmir-poems (max-width:850px){
  .scene-panel{height:164px}
  .scene-panel:has(.return-link){height:195px}
  .stanza,.poems{scroll-margin-top:calc(var(--native-sticky-top) + 220px)}
  .ascii{font-size:min(3.1px,calc((100cqw - 144px)/48));line-height:1}
 }
 @media print{.scene-panel,.plain-toolbar{display:none!important}.reading-layout{display:block}.poem{padding:0}.stanza{margin-bottom:24px}.stanza p{font-size:11pt}.poem h2{font-size:24pt}}
 `;
}
