'use strict';
/* Coffeebreak School Bookings: configuration. © Karen (Coffeebreak). */
const CFG={key:'cb-school-bookings-v1',title:'Coffeebreak School Bookings',refPrefix:'SCH',hasRate:false,
 words:{venue:'school',venues:'schools',venueCap:'School',person:'teacher',personCap:'Teacher',peopleCap:'Teachers and staff'},
 extraFields:[{id:'student',label:'Student name',req:true},{id:'cls',label:'Class or year',req:false}],
 defaultTypes:[{id:'ptm',name:'Parent-teacher meeting',mins:15,price:0},{id:'pri',name:'Meet the principal',mins:20,price:0},{id:'tour',name:'School tour',mins:30,price:0}],
 empty:()=>({venues:[],appts:[],waitlist:[],absences:[],excursions:[],consents:[],sample:false}),
 sample:()=>{const wk={1:['08:30','15:30'],2:['08:30','15:30'],3:['08:30','15:30'],4:['08:30','15:30'],5:['08:30','14:30']};const h=()=>JSON.parse(JSON.stringify(wk));
  const T=()=>JSON.parse(JSON.stringify(CFG.defaultTypes)).concat([{id:'enrol',name:'Enrolment interview',mins:30,price:0},{id:'tutor',name:'After-school tutoring',mins:45,price:25}]);
  const v1={id:'s1',name:'Sample Bay Public School',suburb:'Newcastle NSW',address:'1 Sample Street (made up)',phone:'02 4000 0001',email:'office@sample-bay.example',payid:'payments@sample-bay.example',
   people:[{id:'t1',name:'Ms Rivers (Year 1)',role:'Teacher',hours:h()},{id:'t2',name:'Mr Lake (Year 4)',role:'Teacher',hours:h()},{id:'t3',name:'Principal Hill',role:'Principal',hours:{1:['09:00','12:00'],3:['09:00','12:00'],5:['09:00','12:00']}}],types:T()};
  v1.types[1].roles=['Principal'];v1.types[3].roles=['Principal'];
  const v2={id:'s2',name:'Sample Valley High School',suburb:'Maitland NSW',address:'2 Example Road (made up)',phone:'02 4000 0002',email:'office@sample-valley.example',payid:'payments@sample-valley.example',
   people:[{id:'t4',name:'Ms Brook (English)',role:'Teacher',hours:h()},{id:'t5',name:'Mr Stone (Maths)',role:'Teacher',hours:h()}],types:JSON.parse(JSON.stringify(CFG.defaultTypes))};
  const nx=n=>{let d=today();for(let i=0;i<n;){d=addDays(d,1);const w=parseD(d).getDay();if(w>0&&w<6)i++}return d};
  return {venues:[v1,v2],sample:true,waitlist:[],
   appts:[{id:'a1',ref:'SCHDEMO1',venueId:'s1',personId:'t1',typeId:'ptm',mins:15,price:0,date:nx(1),time:'15:00',client:{name:'Sample Parent',phone:'0400000001',email:'parent@example.com'},extra:{student:'Sample Student',cls:'1R'},note:'',status:'booked',paid:false,created:Date.now()},
    {id:'a2',ref:'SCHDEMO2',venueId:'s1',personId:'t2',typeId:'ptm',mins:15,price:0,date:nx(1),time:'15:15',client:{name:'Demo Carer',phone:'0400000002',email:''},extra:{student:'Demo Student',cls:'4L'},note:'',status:'booked',paid:false,created:Date.now()}],
   absences:[{id:'ab1',ref:'ABSDEMO1',venueId:'s1',student:'Sample Student',cls:'1R',from:nx(2),to:nx(2),reason:'Family event',note:'',parent:'Sample Parent',phone:'0400000001',status:'reported',created:Date.now()}],
   excursions:[{id:'e1',venueId:'s1',title:'Aquarium day trip',cls:'Year 1',date:nx(8),depart:'09:00',ret:'14:30',cost:18,due:nx(5),info:'Bring a hat, water bottle and packed lunch.'},
    {id:'e2',venueId:'s1',title:'Science museum visit',cls:'Year 4',date:nx(12),depart:'08:45',ret:'15:00',cost:25,due:nx(9),info:'Wear full school uniform.'},
    {id:'e3',venueId:'s2',title:'Theatre performance',cls:'Year 9 English',date:nx(10),depart:'10:00',ret:'14:00',cost:30,due:nx(6),info:'Bus leaves from the front gate.'}],
   consents:[]}}};
