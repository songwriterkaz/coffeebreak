/* Coffeebreak verse of the day: one small King James Version (public domain) verse at the bottom of each page. Idempotent. */
(function(){
  if (window.__CB_VERSE__) return;
  window.__CB_VERSE__ = 1;
  try { if (window.top !== window.self) return; } catch (e) { return; }
  var V = [["The LORD is my shepherd; I shall not want.", "Psalm 23:1"], ["For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.", "Jeremiah 29:11"], ["I can do all things through Christ which strengtheneth me.", "Philippians 4:13"], ["But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", "Isaiah 40:31"], ["Trust in the LORD with all thine heart; and lean not unto thine own understanding.", "Proverbs 3:5"], ["Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.", "Joshua 1:9"], ["The LORD bless thee, and keep thee:", "Numbers 6:24"], ["God is our refuge and strength, a very present help in trouble.", "Psalm 46:1"], ["Come unto me, all ye that labour and are heavy laden, and I will give you rest.", "Matthew 11:28"], ["Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.", "John 14:27"], ["And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", "Romans 8:28"], ["This is the day which the LORD hath made; we will rejoice and be glad in it.", "Psalm 118:24"], ["Casting all your care upon him; for he careth for you.", "1 Peter 5:7"], ["Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.", "Isaiah 41:10"], ["My help cometh from the LORD, which made heaven and earth.", "Psalm 121:2"], ["It is of the LORD’s mercies that we are not consumed, because his compassions fail not.", "Lamentations 3:22"], ["O LORD my God, I cried unto thee, and thou hast healed me.", "Psalm 30:2"], ["For I will restore health unto thee, and I will heal thee of thy wounds, saith the LORD; because they called thee an Outcast, saying , This is Zion, whom no man seeketh after.", "Jeremiah 30:17"], ["He healeth the broken in heart, and bindeth up their wounds.", "Psalm 147:3"], ["Beloved, I wish above all things that thou mayest prosper and be in health, even as thy soul prospereth.", "3 John 1:2"], ["And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness. Most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me.", "2 Corinthians 12:9"], ["The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.", "Psalm 34:18"], ["Blessed are the peacemakers: for they shall be called the children of God.", "Matthew 5:9"], ["We love him, because he first loved us.", "1 John 4:19"], ["For he shall give his angels charge over thee, to keep thee in all thy ways.", "Psalm 91:11"], ["Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.", "Isaiah 26:3"], ["A merry heart doeth good like a medicine: but a broken spirit drieth the bones.", "Proverbs 17:22"], ["For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", "John 3:16"], ["Delight thyself also in the LORD; and he shall give thee the desires of thine heart.", "Psalm 37:4"]];
  function inject(){
    if (!document.body || document.getElementById('cb-verse-line')) return;
    var now = new Date();
    var day = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 864e5);
    var v = V[day % V.length];
    var p = document.createElement('p');
    p.id = 'cb-verse-line';
    p.setAttribute('lang', 'en');
    p.style.cssText = 'display:block;box-sizing:border-box;width:100%;flex:0 0 100%;clear:both;max-width:820px;margin:14px auto 10px;padding:4px 12px;font:italic 12px/1.45 Georgia,serif;text-align:center;color:inherit;opacity:.85;position:static;';
    var q = document.createElement('span');
    q.textContent = '\u201C' + v[0] + '\u201D ';
    var r = document.createElement('b');
    r.style.fontStyle = 'normal';
    r.textContent = v[1] + ' (KJV)';
    p.appendChild(document.createTextNode('\uD83D\uDE4F Verse for today: '));
    p.appendChild(q);
    p.appendChild(r);
    var host = document.getElementById('cb-hubbar') || document.getElementById('cb-game-legal');
    if (!host) { var f = document.querySelectorAll('footer'); host = f.length ? f[f.length - 1] : null; }
    function floating(el){
      for (var e = el; e && e !== document.body; e = e.parentElement) {
        var pos = getComputedStyle(e).position;
        if (pos === 'fixed' || pos === 'absolute' || pos === 'sticky') return true;
      }
      return false;
    }
    if (host && !floating(host)) host.appendChild(p); else document.body.appendChild(p);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();
