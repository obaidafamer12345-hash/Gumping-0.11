const themes=[["#07153d","#312e81"],["#042f3b","#0f766e"],["#071a2b","#1d4ed8"],["#2b0808","#991b1b"],["#13071e","#581c87"],["#062e1b","#166534"],["#3b2105","#92400e"],["#020617","#172554"],["#171717","#7f1d1d"],["#0c1230","#4c1d95"]];

const stageProfiles=[
 {sky:["#06142e","#1e40af"],ground:"#1f2937",top:"#38bdf8",haz:"spike",name:"حدائق النيون"},
 {sky:["#052e3a","#075985"],ground:"#164e63",top:"#67e8f9",haz:"water",name:"جزر السماء"},
 {sky:["#111827","#312e81"],ground:"#312e81",top:"#a78bfa",haz:"laser",name:"مدينة البرق"},
 {sky:["#2a0905","#991b1b"],ground:"#451a03",top:"#fb923c",haz:"lava",name:"جبل الحمم"},
 {sky:["#13051e","#4c1d95"],ground:"#312e81",top:"#e879f9",haz:"blade",name:"قلعة الظلال"},
 {sky:["#052e16","#166534"],ground:"#14532d",top:"#4ade80",haz:"vine",name:"الغابة المفقودة"},
 {sky:["#422006","#b45309"],ground:"#78350f",top:"#fbbf24",haz:"sand",name:"صحراء العمالقة"},
 {sky:["#020617","#164e63"],ground:"#0f172a",top:"#22d3ee",haz:"energy",name:"المجرة الأخيرة"},
 {sky:["#18181b","#7f1d1d"],ground:"#27272a",top:"#f87171",haz:"meteor",name:"نهاية الكون"},
 {sky:["#0f172a","#581c87"],ground:"#1e1b4b",top:"#fbbf24",haz:"royal",name:"القلعة الملكية"}
];

const levels=[
["🌌","حدائق النيون",4200],["🌊","جزر السماء",4700],["⚡","مدينة البرق",5200],["🌋","جبل الحمم",5700],["🏰","قلعة الظلال",6200],["🌲","الغابة المفقودة",6700],["🏜️","صحراء العمالقة",7200],["🚀","المجرة الأخيرة",7800],["☄️","نهاية الكون",8400],["👑","القلعة الملكية",9200]
];
const heroes={
 nova:{name:"Nova",icon:"🦸",cost:0,type:"gold"},
 shadow:{name:"Shadow",icon:"🥷",cost:120,type:"diamond"},
 robot:{name:"Titan",icon:"🤖",cost:500,type:"gold"},
 fire:{name:"Inferno",icon:"🔥",cost:250,type:"diamond"},
 cyber:{name:"Cyber",icon:"🤩",cost:900,type:"gold"},
 ice:{name:"Frost",icon:"🧊",cost:400,type:"diamond"},
  runner:{name:"Volt",icon:"⚡",cost:1200,type:"gold"},
  guardian:{name:"Guardian",icon:"🛡️",cost:650,type:"diamond"}
};
function readNum(key, fallback){const n=Number(localStorage.getItem(key));return Number.isFinite(n)?n:fallback}
function readOwned(){try{const v=JSON.parse(localStorage.getItem("epixOwned")||'["nova"]');return Array.isArray(v)&&v.length?v.filter(k=>heroes[k]):["nova"]}catch{return ["nova"]}}
let best=readNum("epixBest",0),gbank=readNum("epixGold",500),dbank=readNum("epixDiamond",30),open=Math.max(1,Math.min(levels.length,Math.floor(readNum("epixOpen",1))));
let owned=readOwned(),hero=heroes[localStorage.getItem("epixHero")]?localStorage.getItem("epixHero"):"nova";
if(!owned.includes("nova"))owned.unshift("nova");if(!owned.includes(hero))hero="nova";
let mode="home",level=1,score=0,gold=0,diamond=0,lives=3,cam=0,tick=0,shake=0,checkpoint=80;
let platforms=[],coins=[],gems=[],enemies=[],particles=[],hazards=[],checkpoints=[];
const keys={};
const player={x:80,y:0,w:38,h:58,baseH:58,vx:0,vy:0,ground:false,dir:1,cd:0,dash:false,dt:0,inv:0,jumps:0,maxJumps:1,sliding:false,wallSide:0,
  coyote:0,jumpBuffer:0,jumpCutApplied:false,wallGrace:0};

