// Original, imagined ASCII geographies; not reproductions of the artworks.
export const W=80, H=48;
export type Cell={c:string;ink:number};
export type Scene={cells:Cell[];label:string;description:string;night:boolean};
class Plate {
 cells:Cell[]=Array.from({length:W*H},()=>({c:' ',ink:0}));
 put(x:number,y:number,c:string,ink=0){x=Math.round(x);y=Math.round(y);if(x>=0&&x<W&&y>=0&&y<H)this.cells[y*W+x]={c,ink};}
 text(x:number,y:number,s:string,ink=0){s.split('').forEach((c,i)=>this.put(x+i,y,c,ink));}
 line(x1:number,y1:number,x2:number,y2:number,c?:string,ink=0){const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));const g=c||(x1===x2?'|':y1===y2?'-':(x2-x1)*(y2-y1)>0?'\\':'/');for(let i=0;i<=n;i++)this.put(x1+(x2-x1)*i/Math.max(1,n),y1+(y2-y1)*i/Math.max(1,n),g,ink);}
 box(x:number,y:number,w:number,h:number,ink=0){this.line(x,y,x+w,y,'-',ink);this.line(x,y+h,x+w,y+h,'-',ink);this.line(x,y,x,y+h,'|',ink);this.line(x+w,y,x+w,y+h,'|',ink);[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].forEach(([a,b])=>this.put(a,b,'+',ink));}
 ellipse(x:number,y:number,rx:number,ry:number,ink=0,c='.'){for(let a=0;a<Math.PI*2;a+=.025)this.put(x+rx*Math.cos(a),y+ry*Math.sin(a),c,ink);}
 clear(x:number,y:number,w:number,h:number){for(let a=x;a<x+w;a++)for(let b=y;b<y+h;b++)this.put(a,b,' ');}
 frame(){[[3,3],[76,3],[3,44],[76,44]].forEach(([x,y])=>this.put(x,y,'+',2));}
}
function water(p:Plate,level=13){for(let y=level;y<level+7;y+=2)for(let x=7;x<74;x++)if((x*13+y*7)%19<8)p.put(x,y,'~',2);}
function ship(p:Plate,x:number,y:number,s=1,ink=0){p.line(x,y,x+28*s,y,'_',ink);p.line(x,y,x+4*s,y+3*s,undefined,ink);p.line(x+28*s,y,x+24*s,y+3*s,undefined,ink);p.line(x+4*s,y+3*s,x+24*s,y+3*s,'=',ink);p.box(x+5*s,y-3*s,5*s,3*s,ink);p.line(x+8*s,y-7*s,x+8*s,y-3*s,'|',ink);for(let i=0;i<3;i++)p.box(x+(13+i*4)*s,y-2*s,3*s,2*s,ink);}
function city(p:Plate,v=0){water(p,6);p.line(8,16,69,16,'_');for(const [x,y,w,h]of [[9,20,14,7],[29,20,18,7],[54,20,15,7],[9,32,14,7],[29,32,18,7],[54,32,15,7]])p.box(x,y,w,h,2);p.line(6,30,73,30,'.');p.line(26,18,26,42,':');p.line(50,18,50,42,':');p.clear(47,35,3,2);p.text(37,35,'107-ish',1);p.line(13,41,26,41,'.',1);p.line(26,41,26,30,':',1);if(v>0){p.line(26,30,50,30,'.',1);p.line(50,30,50,37,':',1);p.put(50,37,'*',1);}else p.put(26,34,'*',1);p.text(7,19,'N',2);p.text(11,34,'GRAND',2);}
function web(p:Plate,strip=false){const cx=40,cy=24;for(let a=0;a<Math.PI*2;a+=Math.PI/8)p.line(cx,cy,cx+34*Math.cos(a),cy+20*Math.sin(a),undefined,2);for(const r of [.2,.4,.65,.88])for(let a=0;a<Math.PI*2;a+=Math.PI/8)p.line(cx+34*r*Math.cos(a),cy+20*r*Math.sin(a),cx+34*r*Math.cos(a+Math.PI/8),cy+20*r*Math.sin(a+Math.PI/8),'.');p.line(40,24,60,32,':',1);p.put(40,24,'*',1);p.put(60,32,'x',1);if(strip)for(let y=4;y<44;y++)if(y%5===1||y%5===2)p.clear(4,y,72,1);}
function cloth(p:Plate){for(let y=8;y<40;y++)for(let x=12;x<68;x++){const edge=3*Math.sin(y/5);if(x>14+edge&&x<65+edge&&(x+y)%3===0)p.put(x,y,(x+y)%2?'|':'-');}p.line(30,6,35,17,'/',1);p.line(35,17,30,31,'\\',1);p.line(30,31,39,41,'/',1);}
function room(p:Plate,people=true,boat=false){p.box(13,10,54,30);p.line(13,26,31,26,'-',2);p.line(31,26,31,40,'|',2);p.clear(38,9,18,3);p.line(38,10,55,10,'~',2);p.clear(12,30,3,6);p.line(13,35,20,31,'/');p.box(40,23,14,6);p.put(37,25,'[');p.put(57,27,']');p.box(39,33,19,5,2);p.line(42,35,55,35,'~',1);p.text(17,21,'107-ish',2);if(people){p.put(36,26,'*',1);p.put(58,26,'*',1);}if(boat)ship(p,30,7,.8,2);}
function parking(p:Plate,lights=false){for(let i=0;i<6;i++){const y=8+i*6;p.line(12,y,65,y,'_',2);p.line(12,y,12,y+5,'|',2);p.line(65,y,65,y+5,'|',2);p.line(20,y+1,56,y+5,'/');}p.line(24,38,58,10,'.',1);p.put(58,10,'*',1);if(lights){water(p,4);p.text(68,15,'|');p.text(67,14,'/\\');}}
function book(p:Plate,v=0){p.box(12,10,28,29);p.box(40,10,28,29);p.line(40,11,40,38,'|',1);for(let y=15;y<35;y+=4){p.line(17,y,34,y,'.',2);p.line(46,y,61,y,'.',2);}if(v>0){p.clear(45,15,19,17);p.ellipse(54,20,8,4,1,':');p.line(53,24,50,29,'|',1);p.line(55,24,58,29,'|',1);p.line(48,30,61,30,'_',1);if(v>1)p.text(47,34,'NEXT >',2);}}
function board(p:Plate){p.box(7,6,65,36);water(p,9);for(let x=13;x<68;x+=12)for(let y=21;y<39;y+=8)p.box(x,y,9,5,2);for(let y=17;y<41;y+=4)p.line(9,y,70,y,'.',2);p.ellipse(37,29,8,4,1,':');p.ellipse(37,29,3,1,1,'.');p.put(24,20,'*',1);p.text(14,45,'1 : 10,000',2);}
function hotel(p:Plate,garden=false,race=false){for(let j=0;j<4;j++){const y=8+j*9;p.ellipse(40,y+4,28,6,2,'-');p.line(12,y+4,12,y+10,'|');p.line(68,y+4,68,y+10,'|');p.ellipse(40,y+3,10,2,0,'.');if(garden)for(let x=17;x<65;x+=4){p.put(x,y+5,'Y',1);p.put(x,y+6,'|',1);}if(race){p.line(18,y+2,61,y+6,':');p.text(27+j*4,y+3,'[=]');}}}
function suite(p:Plate,enlarged=false){p.box(17,9,46,30);p.box(31,22,25,13,2);p.line(31,26,56,26,'-',2);p.box(33,23,9,2,2);p.box(45,23,9,2,2);p.clear(16,31,3,6);p.line(17,36,24,32);ship(p,enlarged?0:4,enlarged?29:25,enlarged?2.8:2.5,1);}
function glass(p:Plate,enlarged=false){for(const [x,y,rx,ry]of [[20,15,7,4],[47,10,12,7],[50,33,8,5],[24,35,5,3]]){p.line(x-rx,y,x,y-ry,'/',2);p.line(x,y-ry,x+rx,y,'\\');p.line(x+rx,y,x,y+ry,'/',1);p.line(x,y+ry,x-rx,y,'\\');p.put(x,y,'.',1);}if(enlarged){p.clear(7,4,67,39);p.ellipse(40,24,25,16,0,'/');p.ellipse(40,24,12,8,2,':');p.ellipse(40,24,3,2,1,'o');p.put(40,24,'*',1);}}
export function makeScene(poem:number,s:number,enlarged=false):Scene{
 const p=new Plate();p.frame();let label='',description='',night=false;
 if(poem===0){
  if(s<=3){city(p,s);label=['107-ish','public labyrinths','the same room','only lighting'][s];description='An uncertain street plan beside the harbour. A red route approaches an entrance marked 107-ish.';night=s===3;}
  else if(s<=5){web(p,s===5);label=s===4?'a street map':'arriving in strips';description=s===4?'Street lines have become a spider web. A red thread connects its centre to a disturbance.':'The web is interrupted by horizontal bands, like an image arriving through a modem.';night=true;}
  else if(s===6){cloth(p);label='a red thread';description='An open weave of characters carries one red thread across its folds.';}
  else if(s<=10){book(p,s-7);label=s<9?'the bookshop':s===9?'recommendations':'a last day';description='An open book, its gutter traced in red, contains an abstract cloud.';}
  else if(s<=12){parking(p,s===12);label=s===11?'the obstruction':'nearly everything';description='Sloping lines connect six levels of a car park. A red route climbs towards the harbour.';night=true;}
  else if(s===13){city(p,1);label='not the stairs';description='The route returns to the uncertain entrance on the street map.';night=true;}
  else if(s===14){cloth(p);label='the other side';description='A red thread runs through a sheet of woven characters.';night=true;}
  else{room(p,s<21,s===16||s===19);label=['her kitchenette','the harbour gap','a held-on note','hair against sundown','seven-ish','the colder dark','the room remains'][s-15]||'the room remains';description=s<21?'The map has folded into a room: passage, table, bed and window. Two red marks sit beside the table.':'The room remains with its table, bed and window. The two marks representing people have disappeared.';night=s!==18;}
 }else{
  if(s<=3){board(p);if(s===1)ship(p,26,12,.7,1);label=['across the grain','freight is extra','two or three players','1 : 10,000'][s];description='A board-sized city: streets cross the grain, diverting around a knot in the middle.';}
  else if(s<=7){hotel(p,s>=6,s>=7);label=['one corner','revolutions','wheat beneath fluorescence','simultaneous'][s-4];description=s===7?'A cylindrical hotel contains wheat and a racing line on the same floors.':s===6?'Wheat sprouts through the floors of a cylindrical hotel.':'An open-centred hotel repeats its elliptical floors.';}
  else if(s<=9){p.ellipse(39,23,20,14,0,'/');p.ellipse(39,23,16,10,2,'.');p.line(22,26,57,26,'_',1);p.line(51,35,58,41,'/');label=s===8?'the second head':'conditions may change';description='An oval helmet, a quiet dark visor, and the loose strap beneath it.';}
  else if(s<=12){board(p);p.box(10,7,60,33);for(let x=9;x<72;x+=7)p.line(x,43,x+5,40,'/',2);p.line(8,42,73,42,'=',1);label=['the pencil wall','held to the glass','untown the downtown'][s-10];description='A small drawn city sits inside a train window. Railway lines cross beneath the page.';}
  else if(s===13){p.box(21,7,37,33,2);p.line(40,8,40,39,'|',2);p.text(10,31,'___/^^\\______/^^\\__________________');p.text(8,32,'<___   o                              >',1);p.text(13,33,'\\__\\______/\\_____________/\\____/');p.text(11,39,'[ stairs ]',2);label='the door stays open';description='A long crocodile lies across the lift opening, holding its doors apart.';}
  else if(s<=17){suite(p,enlarged);label=['the overnight bag','where I sleep','an entire city','I made it up'][s-14];description='A coal ship exceeds the borders of a bed and the room that contains it.';if(s===17)for(const cell of p.cells)if(cell.ink===1&&cell.c!==' ')cell.c='.';}
  else if(s<=19){glass(p,enlarged);label=enlarged?'coming home enlarged':s===18?'painted ground':'cold through the palm';description=enlarged?'An earlier glass fragment, enlarged until the air bubble inside it becomes visible.':'Four translucent-looking fragments of punctuation, each containing a tiny mark.';}
  else if(s===20){suite(p);label='the interior load';description='The immense coal ship is still held inside the hotel room.';}
  else if(s===21){board(p);for(let i=0;i<7;i++)p.line(20+i*5,22,15+i*8,39,'.',1);label='alternatives';description='Several red possible routes cross the grain of the board-sized city.';}
  else{glass(p,true);label='daylight, enlarged';description='A small glass fragment has become a whole field. The air bubble inside is now visible.';}
  if(enlarged&&s<14){suite(p,true);label='coming home enlarged';description='The earlier room is revisited, enlarged: its ship extends beyond the drawing.';}
 }
 return{cells:p.cells,label,description,night};
}
export function sceneText(s:Scene){return Array.from({length:H},(_,y)=>s.cells.slice(y*W,(y+1)*W).map(c=>c.c).join('')).join('\n');}

export function transitionPlan(from:Cell[],to:Cell[]){
 const fixed: {i:number;cell:Cell}[]=[];
 const moving:{a:number;b:number;before:Cell;after:Cell}[]=[];
 for(let ink=0;ink<3;ink++){
  const old:number[]=[],next:number[]=[];
  for(let i=0;i<W*H;i++){
   const equal=from[i].c===to[i].c&&from[i].ink===to[i].ink;
   if(equal){if(ink===0&&to[i].c!==' ')fixed.push({i,cell:to[i]});continue;}
   if(from[i].c!==' '&&from[i].ink===ink)old.push(i);
   if(to[i].c!==' '&&to[i].ink===ink)next.push(i);
  }
  for(let j=0;j<Math.max(old.length,next.length);j++){
   const a=old[j]??next[j],b=next[j]??old[j];
   moving.push({a,b,before:old[j]===undefined?{c:' ',ink}:from[a],after:next[j]===undefined?{c:' ',ink}:to[b]});
  }
 }
 return(t:number)=>{
  if(t<=0)return from;if(t>=1)return to;
  const ease=t*t*(3-2*t),cells:Cell[]=Array.from({length:W*H},()=>({c:' ',ink:0}));
  for(const {i,cell}of fixed)cells[i]=cell;
  for(const m of moving){
   const x=Math.round(m.a%W+(m.b%W-m.a%W)*ease);
   const y=Math.round(Math.floor(m.a/W)+(Math.floor(m.b/W)-Math.floor(m.a/W))*ease);
   const cell=t<.5?m.before:m.after;
   if(cell.c!==' ')cells[y*W+x]=cell;
  }
  return cells;
 };
}
