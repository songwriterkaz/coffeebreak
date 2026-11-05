// Profanity / slur filter + personal-info guard. Word list kept short and obfuscated-insensitive.
(function(){
const W=['fuck','shit','cunt','bitch','bastard','dick','cock','pussy','slut','whore','fag','faggot','nigger','nigga','retard','tranny','spic','chink','kike','wog','coon','dyke','twat','wanker','motherfucker'];
const norm=s=>s.toLowerCase().replace(/[@4]/g,'a').replace(/3/g,'e').replace(/[1!|]/g,'i').replace(/0/g,'o').replace(/[5$]/g,'s').replace(/7/g,'t');
function clean(t){return t.split(/(\s+)/).map(w=>{const n=norm(w).replace(/[^a-z]/g,'');return W.some(b=>n===b||n===b+'s'||(b.length>4&&n.includes(b))||['fuck','shit','cunt','nigg','fagg','wank'].some(r=>n.includes(r)))?'*'.repeat(w.length):w}).join('')}
const PI=[/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{1,4}\b/,/(\+?61|0)4\d{2}[ -]?\d{3}[ -]?\d{3}/,/\b\d{3}[ -]?\d{3}[ -]?\d{6,9}\b/,/[\w.+-]+@[\w-]+\.[\w.]+/,/\b\d{1,5}\s+\w+\s+(st|street|rd|road|ave|avenue|dr|drive|cres|crescent|pde|parade)\b/i];
function personalInfo(t){return PI.some(r=>r.test(t))}
window.CBFilter={clean,personalInfo};
})();
