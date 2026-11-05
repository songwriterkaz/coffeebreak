const $=s=>document.querySelector(s);
const OCC=['Weddings','School formals','Birthdays','Hens and bucks','Airport transfers','Hunter Valley winery tours','Corporate','Other'];
const svg=(len,tall,col)=>`<svg viewBox="0 0 200 90"><rect x="${100-len/2}" y="${55-tall}" width="${len}" height="${tall}" rx="10" fill="${col}"/><rect x="${100-len/2+12}" y="${58-tall}" width="${len-24}" height="${tall*0.4}" rx="4" fill="#cfe3f0"/><circle cx="${100-len/2+22}" cy="62" r="11" fill="#222"/><circle cx="${100+len/2-22}" cy="62" r="11" fill="#222"/><text x="100" y="86" font-size="9" text-anchor="middle" fill="#666">illustration</text></svg>`;
const V=[{n:'Classic sedan',d:'Luxury sedan for airport runs and small groups',max:3,rate:99,min:2,art:svg(110,26,'#222')},
{n:'Stretch limousine',d:'The classic stretch for weddings and formals',max:10,rate:180,min:3,art:svg(180,26,'#f4f4f4')},
{n:'SUV stretch',d:'Bigger stretch for parties',max:14,rate:250,min:3,art:svg(185,34,'#111')},
{n:'Vintage wedding car',d:'Classic styling for the bridal party',max:4,rate:220,min:2,art:svg(120,32,'#e9dcc0')},
{n:'Party bus',d:'For hens, bucks and big birthdays',max:20,rate:300,min:3,art:svg(190,44,'#6a2b8a')}];
let occ=OCC[0];
function rOcc(){$('#occ').innerHTML=OCC.map(o=>`<span class="${o==occ?'on':''}">${o}</span>`).join('');document.querySelectorAll('#occ span').forEach(s=>s.onclick=()=>{occ=s.textContent;$('#bO').value=occ;rOcc()})}
$('#bO').innerHTML=OCC.map(o=>`<option>${o}</option>`).join('');rOcc();
$('#veh').innerHTML=V.map((v,i)=>`<div class="card" data-i="${i}">${v.art}<h4>${v.n}</h4><p style="font-size:.85rem">${v.d}. Up to ${v.max} passengers.</p><b>From $${v.rate} per hour</b>, ${v.min} hour minimum</div>`).join('');
$('#qV').innerHTML=V.map((v,i)=>`<option value="${i}">${v.n}</option>`).join('');
document.querySelectorAll('#veh .card').forEach(c=>c.onclick=()=>{$('#qV').value=c.dataset.i;calc()});
let last={};
function calc(){const v=V[$('#qV').value];let h=Math.max(v.min,+$('#qH').value||1),p=+$('#qP').value||1;
 $('#qWarn').textContent=p>v.max?`The ${v.n} seats up to ${v.max}. Choose a bigger vehicle.`:(+$('#qH').value<v.min?`Minimum hire is ${v.min} hours, so the quote uses ${v.min}.`:'');
 let t=v.rate*h+($('#qX').checked?60:0);$('#qT').textContent='$'+t;$('#qD').textContent='$'+Math.round(t*0.2);
 document.querySelectorAll('#veh .card').forEach(c=>c.classList.toggle('sel',c.dataset.i==$('#qV').value));last={v:v.n,h,p,t}}
['qV','qH','qP','qX'].forEach(k=>$('#'+k).oninput=calc);calc();
$('#fB').onsubmit=e=>{e.preventDefault();const g=k=>$('#'+k).value;
 const body=`Hi Coffeebreak Limo Hire,\n\nI would like to request a booking.\n\nName: ${g('bN')}\nPhone: ${g('bPh')}\nEmail: ${g('bE')}\nOccasion: ${g('bO')}\nDate: ${g('bDt')}\nPick-up time: ${g('bT')}\nPick-up address: ${g('bFrom')}\nDestination or route: ${g('bTo')}\nVehicle: ${last.v}\nHours: ${last.h}\nPassengers: ${last.p}\nDrinks and decorations package: ${$('#qX').checked?'Yes':'No'}\nEstimated from-price: $${last.t}\nNotes: ${g('bNo')}\n\nI understand this is a request and the booking is only confirmed by email.\n\nThanks`;
 location.href='mailto:songwriterkaz@gmail.com?subject='+encodeURIComponent('Limo booking request: '+g('bO')+' on '+g('bDt'))+'&body='+encodeURIComponent(body)};
$('#dep').onclick=()=>{location.href='mailto:songwriterkaz@gmail.com?subject='+encodeURIComponent('Limo deposit paid')+'&body='+encodeURIComponent('Hi Coffeebreak Limo Hire,\n\nI have paid my deposit by PayID to darkokaz@gmx.com.\nName: \nBooking date: \nAmount: \n\nThanks')};
