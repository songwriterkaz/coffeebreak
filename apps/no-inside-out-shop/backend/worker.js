// Coffee Break: No Inside Out - order backend (Cloudflare Worker, free plan).
// Secrets live ONLY in Cloudflare env (never in this file or the public zip):
//   ORGANISER_KEY  - Karen's organiser password
//   PRINTFUL_TOKEN - Printful private token (Orders scope)
// Plain vars (wrangler.toml): ALLOWED_ORIGIN, CONFIRM_ORDERS ("false" = draft, "true" = confirm), DESIGN_BASE_URL, PRINTFUL_STORE_ID (optional)
// KV binding: ORDERS

// Shop product id -> retail price (AUD), design file, and Printful catalog variant ids per size.
// variant ids: fill from https://api.printful.com/products/{id} for the colour Karen picks. null = not set yet.
const PRODUCTS = {
  p456:{price:36.95,design:"no-inside-out",variants:{S:null,M:null,L:null,XL:null,"2XL":null}},
  p71:{price:30.95,design:"coffee-break",variants:{S:null,M:null,L:null,XL:null,"2XL":null}},
  p713:{price:68.95,design:"soft-day",variants:{S:null,M:null,L:null,XL:null,"2XL":null}},
  p476:{price:40.95,design:"soft-day",variants:{"3-4":null,"5-6":null,"7-8":null,"9-11":null,"12-14":null}},
  p484:{price:93.95,design:"no-inside-out",variants:{S:null,M:null,L:null,XL:null,"2XL":null}},
  p146:{price:58.95,design:"coffee-break",variants:{S:null,M:null,L:null,XL:null,"2XL":null}},
  p603:{price:84.95,design:"soft-day",variants:{S:null,M:null,L:null,XL:null,"2XL":null}},
  p145:{price:49.95,design:"no-inside-out",variants:{S:null,M:null,L:null,XL:null,"2XL":null}},
  p882:{price:18.95,design:"soft-day",variants:{S:null,M:null,L:null}},
  p189:{price:61.95,design:"no-inside-out",variants:{XS:null,S:null,M:null,L:null,XL:null}},
  p641:{price:46.95,design:"coffee-break",variants:{"One size":null}},
  p449:{price:46.95,design:"coffee-break",variants:{"One size":null}},
};

const json=(o,s=200,h={})=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json",...h}});
const cors=env=>({"Access-Control-Allow-Origin":env.ALLOWED_ORIGIN||"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type"});
function safeEq(a,b){if(!a||!b||a.length!==b.length)return false;let r=0;for(let i=0;i<a.length;i++)r|=a.charCodeAt(i)^b.charCodeAt(i);return r===0}
const authed=(req,env)=>safeEq(req.headers.get("x-organiser-key")||"",env.ORGANISER_KEY||"");
const s=(v,n=200)=>String(v??"").slice(0,n);

async function createOrder(req,env){
  let b; try{b=await req.json()}catch{return json({error:"bad json"},400,cors(env))}
  const ref=s(b.ref,20); if(!/^NIO-[A-Z0-9]{4,12}$/.test(ref))return json({error:"bad ref"},400,cors(env));
  if(await env.ORDERS.get("order:"+ref))return json({ok:true,ref,dup:true},200,cors(env));
  const items=[];let total=0;
  for(const it of (b.items||[]).slice(0,30)){const p=PRODUCTS[it.id];const q=Math.min(20,Math.max(1,parseInt(it.qty)||0));
    if(!p||!(it.size in p.variants))return json({error:"unknown item"},400,cors(env));
    items.push({id:it.id,size:it.size,qty:q,name:s(it.name,80)});total+=q*p.price}
  if(!items.length)return json({error:"empty"},400,cors(env));
  const c=b.customer||{};
  const order={ref,created:new Date().toISOString(),status:"awaiting payment",total:Math.round(total*100)/100,items,
    customer:{name:s(c.name,80),email:s(c.email,120),phone:s(c.phone,30),address1:s(c.address1,120),address2:s(c.address2,120),city:s(c.city,60),state:s(c.state,3),zip:s(c.zip,4),address_text:s(c.address,400)}};
  await env.ORDERS.put("order:"+ref,JSON.stringify(order));
  return json({ok:true,ref,total:order.total},200,cors(env));
}

async function sendToPrintful(order,env){
  if(!env.PRINTFUL_TOKEN)return{error:"PRINTFUL_TOKEN not set"};
  const c=order.customer;
  if(!c.address1||!c.city||!c.state||!c.zip)return{error:"address incomplete: edit street, city, state, postcode in the organiser first"};
  const items=[];
  for(const it of order.items){const v=PRODUCTS[it.id]?.variants[it.size];if(!v)return{error:`variant id not set for ${it.id} size ${it.size} (edit PRODUCTS in worker.js)`};
    items.push({variant_id:v,quantity:it.qty,files:[{type:"front",url:`${env.DESIGN_BASE_URL}/${PRODUCTS[it.id].design}-4500x5400.png`}]})}
  const confirm=env.CONFIRM_ORDERS==="true";
  const h={"Authorization":"Bearer "+env.PRINTFUL_TOKEN,"content-type":"application/json"};
  if(env.PRINTFUL_STORE_ID)h["X-PF-Store-Id"]=env.PRINTFUL_STORE_ID;
  const r=await fetch(`https://api.printful.com/orders?confirm=${confirm}`,{method:"POST",headers:h,body:JSON.stringify({
    external_id:order.ref,recipient:{name:c.name,address1:c.address1,address2:c.address2||undefined,city:c.city,state_code:c.state,country_code:"AU",zip:c.zip,email:c.email,phone:c.phone||undefined},items})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)return{error:"Printful: "+(d.error?.message||d.result||r.status)};
  return{ok:true,printful_id:d.result?.id,printful_status:d.result?.status,confirm};
}

async function organiserApi(req,env,url){
  if(!authed(req,env))return json({error:"wrong password"},401);
  const m=url.pathname.match(/^\/api\/orders(?:\/(NIO-[A-Z0-9]+)\/(paid|cancel|address))?$/);
  if(!m)return json({error:"not found"},404);
  if(!m[1]){const l=await env.ORDERS.list({prefix:"order:"});const out=[];for(const k of l.keys.slice(-100))out.push(JSON.parse(await env.ORDERS.get(k.name)));
    return json(out.sort((a,b)=>b.created.localeCompare(a.created)))}
  const key="order:"+m[1];const o=JSON.parse(await env.ORDERS.get(key)||"null");if(!o)return json({error:"no such order"},404);
  if(m[2]==="address"){const b=await req.json();for(const k of["address1","address2","city","state","zip","phone"])if(k in b)o.customer[k]=s(b[k],120)}
  else if(m[2]==="cancel")o.status="cancelled";
  else{if(o.printful_id)return json({error:"already sent to Printful",order:o},409);
    const r=await sendToPrintful(o,env);if(r.error){o.last_error=r.error;await env.ORDERS.put(key,JSON.stringify(o));return json(r,502)}
    Object.assign(o,{status:r.confirm?"paid, sent to Printful (confirmed)":"paid, Printful draft created",paid_at:new Date().toISOString(),printful_id:r.printful_id,printful_status:r.printful_status,last_error:null})}
  await env.ORDERS.put(key,JSON.stringify(o));return json(o);
}

import PAGE from "./organiser.html";
export default{async fetch(req,env){
  const url=new URL(req.url);
  if(req.method==="OPTIONS")return new Response(null,{headers:cors(env)});
  if(url.pathname==="/order"&&req.method==="POST")return createOrder(req,env);
  if(url.pathname==="/organiser")return new Response(PAGE,{headers:{"content-type":"text/html; charset=utf-8","x-robots-tag":"noindex"}});
  if(url.pathname.startsWith("/api/"))return organiserApi(req,env,url);
  return new Response("Coffee Break order service",{status:200});
}};
