// Coffeebreak 50,000 leg catalogue. Every leg id CBLEG-00001..CBLEG-50000 maps to one fixed recipe.
// The same maths is in tools/make_wrap.py (spec) so print wraps match the browser exactly.
(function(){
const TOTAL=50000,COMBOS=720;
const LAYOUTS=['feature','tiled','fishnet','pbfishnet','lace'];
const LAYNAMES={feature:'Feature',tiled:'Tiled',fishnet:'Pink Fishnet',pbfishnet:'Pink and Black Fishnet',lace:'Pink Lace'};
const COLOURWAYS=[['Cream Classic','#f5ead6','#c8102e','#111111'],['Bubblegum Pink','#ffd6ea','#ff4fa3','#1a1013'],['Mocha Latte','#fff4e6','#6b3e26','#1a1013'],['Lilac Dream','#e9e4ff','#7a4dff','#1a1013'],['Mint Sorbet','#e6f5ee','#2f8f6a','#111111'],['Honey Gold','#fff2c2','#d18a00','#1a1013']];
const POSENAMES=['Heart Mirror Peek','Vanity Lipstick','Satin Dress Back','Coffee Cup Bath','Chaise Robe','Corset Stockings'];
const ACCENTS=['Bee and Hearts','Roses','Honey Drips','Hearts and Roses'];
function leg(n){const D=window.D,ND=D.length;if(!(n>=1&&n<=TOTAL))return null;const i=n-1,di=i%ND,k=Math.floor(i/ND),v=(k*7919+di*31)%COMBOS,b=D[di];
 const lay=LAYOUTS[v%5],cw=Math.floor(v/5)%6,pose=Math.floor(v/30)%6,acc=Math.floor(v/180)%4;
 return {id:'CBLEG-'+String(n).padStart(5,'0'),num:n,name:b.name,col:b.col,base:b.id,n:b.n,lay,cw,pose,acc,
  layName:LAYNAMES[lay],cwName:COLOURWAYS[cw][0],poseName:POSENAMES[pose],accName:ACCENTS[acc]}}
window.CB50={TOTAL,LAYOUTS,LAYNAMES,COLOURWAYS,POSENAMES,ACCENTS,leg};
})();
