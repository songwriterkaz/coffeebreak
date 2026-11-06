
/* Coffeebreak Ghost Hunting Tools — 12,000 generated catalogue (entertainment) */
(function(global){
  const CATS = [
    ["EMF Meter","emf","Measures electromagnetic field spikes near cold spots."],
    ["Spirit Box","spiritbox","Sweeps radio bands for fragmented spirit replies."],
    ["EVP Recorder","evp","Captures electronic voice phenomena on quiet loops."],
    ["Thermal Camera","thermal","Shows heat blooms and sudden cold pockets."],
    ["Full Spectrum Cam","fscam","Records across IR and near-UV for shadow play."],
    ["Motion Sensor","motion","Flags unseen movement in sealed rooms."],
    ["Laser Grid","laser","Projects a grid to reveal silhouette breaks."],
    ["Dowsing Rods","dowsing","Cross when a playful presence is near."],
    ["Spirit Board","board","Letter planchette for gentle yes or no chats."],
    ["EMF Watch","watch","Wearable spike alerts on your wrist."],
    ["Ghost Radar","radar","Maps soft contacts around your phone."],
    ["UV Light","uv","Finds dust trails and fingerprint glow."],
    ["Ion Detector","ion","Tracks charged air near windows and attics."],
    ["Temp Probe","temp","Logs sudden degree drops in seconds."],
    ["Infrasound Mic","infra","Listens for rumbles below hearing range."],
    ["REM Pod","rempod","Antenna field that sings when brushed."],
    ["Cat Ball","catball","Lights up if nudged by a soft presence."],
    ["Parabolic Mic","parab","Focuses distant knocks and whispers."],
    ["SLS Camera","sls","Stick-figure overlay for room scans."],
    ["Trigger Object","trigger","Leaves a coin, bell or cup for interaction."]
  ];
  const SERIES = ["Cafe","Latte","Noir","Velvet","Pink","Fog","Attic","Cellar","Chapel","Harbour","Outback","Harbourlight","Moonmilk","Sugarskull","Teacup","Lantern","Cobweb","Midnight","Porcelain","Haunt"];
  const GEN = ["Mk I","Mk II","Mk III","Pro","Lite","Ultra","Field","Studio","Pocket","XL","Nano","Prime","Legacy","Classic","Elite","Scout","Ranger","Archive","Signal","Echo"];
  const COLOR = ["rose","onyx","pearl","mint","violet","amber","ivory","crimson","silver","teal","lilac","copper","midnight","blush","graphite"];
  const ACC = ["with leather case","with coffee charm","with glow dial","with USB charge","with spare battery","with pink strap","with Faraday pouch","with wooden stand","with night mode","with voice notes","with map pins","with demo tones","with soft bag","with clip mount","with trip log"];
  const TOTAL = 12000;

  function toolAt(i){
    i = ((i%TOTAL)+TOTAL)%TOTAL;
    const cat = CATS[i % CATS.length];
    const series = SERIES[Math.floor(i/CATS.length) % SERIES.length];
    const gen = GEN[Math.floor(i/(CATS.length*SERIES.length)) % GEN.length];
    const color = COLOR[Math.floor(i/97) % COLOR.length];
    const acc = ACC[Math.floor(i/13) % ACC.length];
    const sku = "CB-GH-" + String(i+1).padStart(5,"0");
    const name = "Coffeebreak " + series + " " + cat[0] + " " + gen;
    const blurb = cat[2] + " Finish: " + color + ". " + acc + ".";
    const rarity = (i%50===0)?"legendary":(i%17===0)?"rare":(i%5===0)?"uncommon":"common";
    const power = 40 + (i*7)%60;
    return {id:i+1, sku:sku, name:name, cat:cat[1], catLabel:cat[0], series:series, gen:gen, color:color, acc:acc, blurb:blurb, rarity:rarity, power:power};
  }

  function search(q, limit, offset){
    q = (q||"").toLowerCase().trim();
    limit = limit==null?60:limit;
    offset = offset||0;
    const out = [];
    // deterministic walk — for empty query, sequential page
    if(!q){
      for(let i=offset;i<Math.min(TOTAL, offset+limit);i++) out.push(toolAt(i));
      return {total:TOTAL, items:out, offset:offset, limit:limit};
    }
    // scan in chunks for matches
    let scanned=0, matched=0;
    const maxScan = TOTAL;
    for(let i=0;i<maxScan && out.length<limit;i++){
      const t = toolAt(i);
      const hay = (t.name+" "+t.catLabel+" "+t.series+" "+t.color+" "+t.sku+" "+t.rarity+" "+t.blurb).toLowerCase();
      if(hay.indexOf(q)>=0){
        if(matched++ >= offset) out.push(t);
      }
      scanned++;
    }
    // approximate total for query: sample-based estimate is heavy; do a full count for short queries only
    let totalMatch = matched;
    if(out.length===limit){
      // continue counting
      for(let i=0;i<TOTAL;i++){
        // already counted matched up to where we stopped collecting; recount fully for accuracy on small sets
      }
      // full recount
      totalMatch = 0;
      for(let i=0;i<TOTAL;i++){
        const t = toolAt(i);
        const hay = (t.name+" "+t.catLabel+" "+t.series+" "+t.color+" "+t.sku+" "+t.rarity).toLowerCase();
        if(hay.indexOf(q)>=0) totalMatch++;
      }
    }
    return {total: totalMatch, items:out, offset:offset, limit:limit, query:q};
  }

  function categories(){ return CATS.map(c=>({id:c[1], label:c[0], blurb:c[2]})); }
  function byCat(cat, limit, offset){
    limit=limit||60; offset=offset||0;
    const items=[]; let matched=0;
    for(let i=0;i<TOTAL;i++){
      const t=toolAt(i);
      if(t.cat===cat){
        if(matched++>=offset && items.length<limit) items.push(t);
      }
    }
    let total=0;
    for(let i=0;i<TOTAL;i++) if(toolAt(i).cat===cat) total++;
    return {total:total, items:items, offset:offset, limit:limit, cat:cat};
  }

  function useTool(t, rng){
    rng = rng || Math.random;
    const spikes = Math.round(20 + rng()*t.power);
    const phrases = [
      "Soft knock near the kettle.",
      "Cold spot by the window seat.",
      "A whisper that sounds like 'latte'.",
      "Planchette drifts toward YES.",
      "Static forms a short laugh.",
      "Shadow pauses by the coat rack.",
      "Cup rattles once, then still.",
      "EMF peaks then settles.",
      "A name hinted in pink mist.",
      "Nothing clear — room feels calm."
    ];
    return {
      reading: spikes,
      note: phrases[Math.floor(rng()*phrases.length)],
      tool: t.name,
      sku: t.sku
    };
  }

  global.CBGhostTools = {TOTAL:TOTAL, toolAt:toolAt, search:search, categories:categories, byCat:byCat, useTool:useTool, CATS:CATS};
})(typeof window!=="undefined"?window:globalThis);
