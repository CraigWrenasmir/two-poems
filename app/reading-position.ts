// Use the reader's own end when it shares a page with other content.
export function activeStanza(tops:number[],readingLine:number,viewportBottom:number,end:number){
 let found=0;
 tops.forEach((top,i)=>{if(top<=readingLine)found=i;});
 if(viewportBottom>=end-8)found=tops.length-1;
 return Math.max(0,found);
}
