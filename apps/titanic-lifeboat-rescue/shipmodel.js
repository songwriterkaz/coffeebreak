// small stylised liner model, returns THREE.Group, length ~ 30 along -z
export function makeShip(THREE,opts={}){const g=new THREE.Group();const M=c=>new THREE.MeshLambertMaterial({color:c});
 const b=(w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));m.position.set(x,y,z);g.add(m);return m};
 b(6,2,26,opts.hull||0x111111,0,0,0);b(6,0.6,26,0x9b1b1b,0,-1.2,0);const bow=new THREE.Mesh(new THREE.ConeGeometry(3,5,4),M(opts.hull||0x111111));bow.rotation.x=-Math.PI/2;bow.rotation.y=Math.PI/4;bow.scale.set(1,1,0.47);bow.position.set(0,0,-15.4);g.add(bow);
 b(6.02,0.4,26,0xffffff,0,1.1,0);b(4.5,1.6,16,0xffffff,0,2.1,0);
 [-5,-1.5,2,5.5].forEach(z=>{b(1.2,3,1.4,opts.funnel||0xd9a441,0,4.3,z);b(1.22,0.6,1.42,0x111111,0,5.9,z)});return g}
