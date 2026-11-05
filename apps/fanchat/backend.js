// Backend adapters. Both expose: init(), uid, isAdmin, isBanned(), send(room,name,text), listen(room,cb),
// del(id), ban(uid), report(msg,reason)
(function(){
const MAX=500;
function MockBackend(){
  const K='cbchat-mock';const ch=('BroadcastChannel' in window)?new BroadcastChannel('cbchat'):null;
  const load=()=>JSON.parse(localStorage.getItem(K)||'{"msgs":[],"bans":[],"reports":[]}');
  const save=d=>{localStorage.setItem(K,JSON.stringify(d));ch&&ch.postMessage(1);fire();};
  let L=[];const fire=()=>L.forEach(f=>f());ch&&(ch.onmessage=fire);
  let uid=localStorage.getItem('cbchat-uid');if(!uid){uid='u'+Math.random().toString(36).slice(2,10);localStorage.setItem('cbchat-uid',uid);}
  const b={mode:'demo',uid,isAdmin:location.hash==='#mockadmin',
    async init(){},
    isBanned(){return load().bans.includes(uid)},
    async send(room,name,text){const d=load();if(d.bans.includes(uid))throw Error('banned');
      d.msgs.push({id:'m'+Date.now()+Math.random().toString(36).slice(2,6),room,name,text:text.slice(0,MAX),uid,ts:Date.now()});d.msgs=d.msgs.slice(-500);save(d);},
    listen(room,cb){const f=()=>cb(load().msgs.filter(m=>m.room===room).slice(-100));L.push(f);f();return()=>{L=L.filter(x=>x!==f)}},
    async del(id){if(!b.isAdmin)throw Error('not admin');const d=load();d.msgs=d.msgs.filter(m=>m.id!==id);save(d)},
    async ban(u){if(!b.isAdmin)throw Error('not admin');const d=load();d.bans.push(u);d.msgs=d.msgs.filter(m=>m.uid!==u);save(d)},
    async report(m,reason){const d=load();d.reports.push({msgId:m.id,uid:m.uid,text:m.text,reason,by:uid,ts:Date.now()});save(d)},
    async reports(){return load().reports}};
  return b;
}
function FirebaseBackend(cfg){
  const b={mode:'live',uid:null,isAdmin:false,banned:false};
  let db;
  b.init=async()=>{firebase.initializeApp(cfg);db=firebase.firestore();
    const c=await firebase.auth().signInAnonymously();b.uid=c.user.uid;
    try{b.isAdmin=(await db.doc('admins/'+b.uid).get()).exists}catch(e){}
    try{b.banned=(await db.doc('bans/'+b.uid).get()).exists}catch(e){}};
  b.isBanned=()=>b.banned;
  b.send=async(room,name,text)=>{const ts=firebase.firestore.FieldValue.serverTimestamp();const bt=db.batch();
    bt.set(db.collection('messages').doc(),{room,name:name.slice(0,24),text:text.slice(0,MAX),uid:b.uid,ts});
    bt.set(db.doc('ratelimit/'+b.uid),{last:ts});await bt.commit();};
  b.listen=(room,cb)=>db.collection('messages').where('room','==',room).orderBy('ts','desc').limit(100)
    .onSnapshot(s=>cb(s.docs.map(d=>({id:d.id,...d.data(),ts:d.data().ts?d.data().ts.toMillis():Date.now()})).reverse()));
  b.del=id=>db.doc('messages/'+id).delete();
  b.ban=u=>db.doc('bans/'+u).set({ts:firebase.firestore.FieldValue.serverTimestamp()});
  b.report=(m,reason)=>db.collection('reports').add({msgId:m.id,uid:m.uid,text:m.text,reason,by:b.uid,ts:firebase.firestore.FieldValue.serverTimestamp()});
  b.reports=async()=>(await db.collection('reports').orderBy('ts','desc').limit(50).get()).docs.map(d=>d.data());
  return b;
}
window.CBBackend=function(){const c=(window.CB_CHAT_CONFIG||{}).firebase;return (c&&window.firebase)?FirebaseBackend(c):MockBackend();};
})();
