/*
 * Sleeper Draft Coach — live draft recommendation overlay for Sleeper.
 *
 * HOW IT WORKS
 * Reads your draft's picks from Sleeper's public API and, every ~1s, scores the
 * best available players for YOUR roster using value-over-replacement at your
 * next pick, plus positional-balance and lineup-legality logic.
 *
 * DATA (see RAW below): player projections are derived from Vegas prop-implied
 * season totals; ADP is from public Sleeper PPR draft data. This is a SNAPSHOT
 * (June 2026) and will go stale — refresh before drafting a real league.
 *
 * The AVOID / VALUE_BOARD / VETRISK / CUFFS / STACKS lists are the author's
 * judgment layer on top of the data, not model output. Edit them to taste.
 *
 * Tuning weights (marginal value, positional balance, risk) were chosen via a
 * Monte-Carlo sweep against simulated opponents. See README for methodology.
 */
const RAW=[["Jahmyr Gibbs","RB",1,291,2,1],["Bijan Robinson","RB",2,276,1,-1],["Christian McCaffrey","RB",3,269,5,2],["Ja'Marr Chase","WR",4,245,3,-1],["Jonathan Taylor","RB",5,242,7,2],["Puka Nacua","WR",6,238,4,-2],["James Cook","RB",7,238,9,2],["Amon-Ra St. Brown","WR",8,236,8,0],["Jaxon Smith-Njigba","WR",9,234,6,-3],["Derrick Henry","RB",10,225,25,14],["Ashton Jeanty","RB",11,216,11,0],["CeeDee Lamb","WR",12,214,10,-2],["De'Von Achane","RB",13,210,13,0],["Omarion Hampton","RB",14,208,14,0],["Saquon Barkley","RB",15,207,16,1],["Jeremiyah Love","RB",16,203,20,4],["Javonte Williams","RB",17,203,34,16],["Kyren Williams","RB",18,203,32,13],["Drake London","WR",19,202,15,-4],["Justin Jefferson","WR",20,202,12,-8],["Chase Brown","RB",21,199,19,-2],["Kenneth Walker","RB",22,0,18,-4],["Josh Jacobs","RB",23,192,27,3],["A.J. Brown","WR",24,191,29,4],["Trey McBride","TE",25,188,17,-8],["Nico Collins","WR",26,186,23,-3],["Malik Nabers","WR",27,185,22,-5],["Breece Hall","RB",28,183,31,2],["George Pickens","WR",29,181,26,-4],["Chris Olave","WR",30,179,28,-3],["Brock Bowers","TE",31,177,21,-10],["Travis Etienne","RB",32,177,36,3],["DeVonta Smith","WR",33,173,45,10],["Garrett Wilson","WR",34,172,38,3],["Tetairoa McMillan","WR",35,171,35,-1],["Zay Flowers","WR",36,171,41,3],["Cam Skattebo","RB",37,168,46,7],["Davante Adams","WR",38,168,49,9],["David Montgomery","RB",39,168,55,13],["Quinshon Judkins","RB",40,168,50,8],["Bucky Irving","RB",41,166,33,-9],["Mike Evans","WR",42,166,60,14],["D'Andre Swift","RB",43,166,58,11],["Tee Higgins","WR",44,166,37,-8],["Emeka Egbuka","WR",45,161,47,0],["Rashee Rice","WR",46,160,30,-17],["Terry McLaurin","WR",47,160,53,3],["Ladd McConkey","WR",48,160,42,-8],["Jameson Williams","WR",49,159,51,0],["Alec Pierce","WR",50,157,81,25],["Jaylen Waddle","WR",51,156,48,-5],["TreVeyon Henderson","RB",52,154,44,-10],["Rome Odunze","WR",53,153,63,6],["DK Metcalf","WR",54,152,72,12],["Luther Burden","WR",55,0,39,-17],["Rico Dowdle","RB",56,149,80,18],["Tony Pollard","RB",57,149,85,21],["Courtland Sutton","WR",58,148,76,12],["DJ Moore","WR",59,147,57,-6],["Bhayshul Tuten","RB",60,147,59,-5],["Chuba Hubbard","RB",61,146,70,3],["Colston Loveland","TE",62,144,43,-21],["Christian Watson","WR",63,144,66,-2],["Parker Washington","WR",64,143,91,17],["Tyler Warren","TE",65,142,54,-14],["Marvin Harrison","WR",66,141,74,2],["Carnell Tate","WR",67,141,62,-9],["RJ Harvey","RB",68,140,61,-11],["Rhamondre Stevenson","RB",69,140,77,2],["Jordyn Tyson","WR",70,140,71,-5],["J.K. Dobbins","RB",71,139,94,12],["Harold Fannin","TE",72,139,64,-12],["Jakobi Meyers","WR",73,138,88,7],["Jaylen Warren","RB",74,137,67,-12],["Jadarian Price","RB",75,137,83,2],["Stefon Diggs","WR",76,135,133,40],["Michael Pittman","WR",77,134,98,10],["Michael Wilson","WR",78,134,78,-6],["Travis Kelce","TE",79,132,106,14],["Wan'Dale Robinson","WR",80,131,97,6],["Aaron Jones","RB",81,131,113,17],["Kyle Pitts","TE",82,131,75,-13],["Chris Godwin","WR",83,130,93,-1],["Brian Thomas","WR",84,128,69,-21],["Ricky Pearsall","WR",85,128,96,0],["Xavier Worthy","WR",86,128,121,19],["Jayden Reed","WR",87,128,115,13],["Khalil Shakir","WR",88,127,126,22],["Makai Lemon","WR",89,126,82,-13],["Quentin Johnston","WR",90,126,108,4],["Matthew Golden","WR",91,125,138,28],["Chris Rodriguez","RB",92,125,144,32],["George Kittle","TE",93,123,103,-1],["Jordan Addison","WR",94,122,99,-6],["Kyle Monangai","RB",95,122,79,-22],["Josh Downs","WR",96,122,120,8],["Oronde Gadsden","TE",97,0,111,-1],["Tucker Kraft","TE",98,120,73,-31],["Jalen Coker","WR",99,120,140,21],["Sam LaPorta","TE",100,120,87,-21],["Blake Corum","RB",101,118,95,-17],["Jayden Higgins","WR",102,117,128,10],["Romeo Doubs","WR",103,116,112,-6],["Kenneth Gainwell","RB",104,116,101,-14],["Jalen Nailor","WR",105,116,175,43],["K.C. Concepcion","WR",106,115,123,1],["Dallas Goedert","TE",107,114,119,-4],["Mark Andrews","TE",108,113,114,-9],["AJ Barner","TE",109,113,145,16],["Jacory Croskey-Merritt","RB",110,111,116,-9],["Jordan Mason","RB",111,111,117,-9],["Jake Ferguson","TE",112,111,100,-23],["Brenton Strange","TE",113,108,136,5],["Jauan Jennings","WR",114,108,147,13],["Omar Cooper Jr.","WR",115,108,150,15],["Dalton Kincaid","TE",116,107,102,-25],["Rachaad White","RB",117,107,122,-11],["Brandon Aiyuk","WR",118,106,167,23],["Juwan Johnson","TE",119,106,127,-8],["Deebo Samuel","WR",120,103,169,23],["Isaiah Likely","TE",121,103,110,-26],["Jerry Jeudy","WR",122,103,170,22],["Hunter Henry","TE",123,103,129,-10],["Dalton Schultz","TE",124,102,151,7],["Tyrone Tracy","RB",125,101,131,-10],["Tre Tucker","WR",126,101,194,36],["Denzel Boston","WR",127,100,162,10],["Jalen McMillan","WR",128,98,168,14],["Rashid Shaheed","WR",129,97,154,3],["Calvin Ridley","WR",130,97,199,35],["T.J. Hockenson","TE",131,97,156,2],["Tyjae Spears","RB",132,97,146,-6],["Kenyon Sadiq","TE",133,96,125,-24],["Pat Freiermuth","TE",134,95,256,62],["Ryan Flournoy","WR",135,94,215,42],["De'Zhaun Stribling","WR",136,93,214,40],["Tre' Harris","WR",137,93,197,27],["Chig Okonkwo","TE",138,92,148,-10],["Tory Horton","WR",139,89,262,60],["Cade Otton","TE",140,89,187,17],["Isaac TeSlaa","WR",141,89,195,22],["Isiah Pacheco","RB",142,88,161,-6],["Keaton Mitchell","RB",143,88,165,-3],["Gunnar Helm","TE",144,84,186,12],["Ted Hurst","WR",146,83,244,45],["Malik Washington","WR",147,82,173,0],["Zachariah Branch","WR",148,82,208,23],["Tank Dell","WR",149,0,206,20],["Antonio Williams","WR",150,80,172,-4],["Travis Hunter","WR",151,79,176,-2],["Kayshon Boutte","WR",152,79,179,0],["Dylan Sampson","RB",153,77,160,-18],["Germie Bernard","WR",154,77,223,29],["Rashod Bateman","WR",155,77,281,54],["Keenan Allen","WR",156,76,249,38],["Josh Allen","QB",1,328,24,0],["Drake Maye","QB",2,290,52,0],["Jalen Hurts","QB",3,287,68,0],["Joe Burrow","QB",4,286,56,0],["Trevor Lawrence","QB",5,283,92,0],["Lamar Jackson","QB",6,282,40,0],["Jayden Daniels","QB",7,280,65,0],["Caleb Williams","QB",8,270,86,0],["Brock Purdy","QB",9,268,105,0],["Justin Herbert","QB",10,266,89,0],["Patrick Mahomes","QB",11,266,104,0],["Bo Nix","QB",12,264,109,0],["Jared Goff","QB",13,262,118,0],["Dak Prescott","QB",14,261,90,0],["Matthew Stafford","QB",16,254,107,0],["Jaxson Dart","QB",17,254,84,0],["Baker Mayfield","QB",18,251,135,0],["Jordan Love","QB",19,245,132,0]];
const VALUE_BOARD=new Set(["Derrick Henry","Kyren Williams","Javonte Williams","Mike Evans","David Montgomery","Davante Adams","DeVonta Smith","DK Metcalf","Courtland Sutton","Alec Pierce","Parker Washington","Emeka Egbuka","Aaron Jones","J.K. Dobbins","Khalil Shakir","Xavier Worthy","Stefon Diggs","Matthew Golden","Brandon Aiyuk","Calvin Ridley","Travis Kelce","George Kittle","Oronde Gadsden","Josh Allen","Jalen Hurts","Trevor Lawrence","Brock Purdy","Trey McBride","Brock Bowers","Rico Dowdle","Tony Pollard"]);
const AVOID={"Tucker Kraft":"ADP well above projection","Brian Thomas":"projection below ADP","Colston Loveland":"TE depth, committee role","Sam LaPorta":"mid-TE value tax","Dalton Kincaid":"mid-TE value tax","Isaiah Likely":"mid-TE value tax","Jake Ferguson":"mid-TE value tax","Kyle Pitts":"mid-TE value tax","Rashee Rice":"ADP above projection","Luther Burden":"ADP above projection","Kyle Monangai":"backup-role risk","Blake Corum":"backup-role risk","Tyler Warren":"mid-TE value tax","RJ Harvey":"committee risk","Jaylen Warren":"negative ADP edge","TreVeyon Henderson":"projection below ADP","Harold Fannin":"ADP above projection","Kenneth Gainwell":"backup-role risk","Lamar Jackson":"QB value flat at ADP cost","Jaxson Dart":"projection well below ADP"};
const VETRISK=new Set(["Derrick Henry","Christian McCaffrey","Aaron Jones","Travis Kelce"]);
const FLOORS=new Set(["Jakobi Meyers","Michael Pittman","Michael Wilson","Romeo Doubs","Chris Godwin","Jordan Addison","Hunter Henry","Dallas Goedert","Wan'Dale Robinson","Josh Downs","Jalen Nailor","Jerry Jeudy"]);
const CUFFS=new Set(["Jordan Mason","Jacory Croskey-Merritt","Keaton Mitchell","Jadarian Price","Tyjae Spears","Rachaad White","Chris Rodriguez"]);
const STACKS={"Josh Allen":["Khalil Shakir","James Cook"],"Jalen Hurts":["A.J. Brown","DeVonta Smith","Saquon Barkley"],"Joe Burrow":["Ja'Marr Chase","Tee Higgins","Chase Brown"],"Trevor Lawrence":["Parker Washington","Jakobi Meyers","Travis Etienne"],"Brock Purdy":["Christian McCaffrey","Ricky Pearsall","George Kittle","Jauan Jennings"],"Patrick Mahomes":["Xavier Worthy","Travis Kelce"],"Bo Nix":["Courtland Sutton","Marvin Harrison"],"Jared Goff":["Amon-Ra St. Brown","Jameson Williams","Jahmyr Gibbs"],"Drake Maye":["Rhamondre Stevenson","Hunter Henry"],"Dak Prescott":["CeeDee Lamb","George Pickens","Javonte Williams"],"Justin Herbert":["Ladd McConkey","Omarion Hampton"],"Jayden Daniels":["Terry McLaurin","Deebo Samuel"],"Matthew Stafford":["Puka Nacua","Davante Adams","Kyren Williams"],"Caleb Williams":["Rome Odunze","DJ Moore"]};
const DEFK=[["Texans DEF","DEF",1],["Broncos DEF","DEF",2],["Seahawks DEF","DEF",3],["Eagles DEF","DEF",4],["Rams DEF","DEF",5],["Steelers DEF","DEF",6],["Vikings DEF","DEF",7],["Jaguars DEF","DEF",8],["Patriots DEF","DEF",9],["Ravens DEF","DEF",10],["Brandon Aubrey","K",1],["Cameron Dicker","K",2],["Jake Bates","K",3],["Chris Boswell","K",4],["Tyler Loop","K",5],["Wil Lutz","K",6],["Cairo Santos","K",7],["Jason Sanders","K",8],["Evan McPherson","K",9],["Harrison Butker","K",10]];
const POSC={RB:"#4FD1B5",WR:"#5BA8FF",TE:"#FFA24D",QB:"#FF6B9D",DEF:"#B07A5E",K:"#9D8CFF"};
// v3.2: position-level outcome volatility (higher = bustier/injury-prone). Used to risk-adjust projections.
const POSVOL={RB:0.16,WR:0.10,TE:0.12,QB:0.07,DEF:0,K:0};
// v3.2: target starting roster shape for an 8-team 1QB/2RB/2WR/1TE/2FLEX/DEF/K build
const ROSTER_NEED={QB:1,RB:4,WR:5,TE:1};
const P=RAW.map((r,i)=>({id:i,name:r[0],pos:r[1],vrank:r[2],pts:r[3],adp:r[4],edge:r[5]}));
const norm=s=>s.toLowerCase().replace(/[.'-]/g,"").replace(/\s(jr|sr|ii|iii|iv)$/,"").replace(/\s+/g," ").trim();
const BYNAME={}; P.forEach(p=>BYNAME[norm(p.name)]=p);

const draftId=(location.pathname.match(/draft\/nfl\/(\d+)/)||[])[1];
if(!draftId){console.log("DraftCoach: no draft id");}

let state={recLog:[],lastCount:-1,takenNames:new Set(),slot:null,slotLocked:false,teams:8,rounds:15,taken:new Set(),mine:[],collapsed:false,err:"",creator:null};

function myPickIn(r){return (r-1)*state.teams+(r%2===1?state.slot:state.teams+1-state.slot);}
function nextPicks(pickNum){const out=[];for(let r=1;r<=state.rounds;r++){const p=myPickIn(r);if(p>=pickNum)out.push(p);if(out.length===2)break;}return out;}

function coach(){
  const pickNum=state.taken.size+1;
  const round=Math.min(state.rounds,Math.floor((pickNum-1)/state.teams)+1);
  const counts={QB:0,RB:0,WR:0,TE:0};state.mine.forEach(m=>counts[m.pos]=(counts[m.pos]||0)+1);
  const myQB=state.mine.find(m=>m.pos==="QB");
  const stackSet=new Set(myQB?(STACKS[myQB.name]||[]):[]);
  const vetRBs=state.mine.filter(m=>VETRISK.has(m.name)&&m.pos==="RB").length;
  const nx=nextPicks(pickNum).concat([999,999]);const np=nx[0],npa=nx[1];
  const cands=P.filter(p=>!state.taken.has(p.id)).filter(p=>{
    if(AVOID[p.name]&&p.pos!=="QB")return false;
    if(p.pos==="TE"&&counts.TE>0)return false;
    if(p.pos==="QB"&&counts.QB>0)return false;
    if(p.pos==="QB"){
      if(p.name==="Josh Allen")return round>=3;
      if(p.name==="Jalen Hurts")return round>=6;
      if(["Trevor Lawrence","Joe Burrow"].includes(p.name))return round>=7;
      return round>=9;}
    if(p.pos==="TE"){
      if(["Trey McBride","Brock Bowers"].includes(p.name))return round>=2&&round<=5;
      return round>=9;}
    return true;});
  const apool=P.filter(x=>!state.taken.has(x.id)&&!AVOID[x.name]);
  const bestLater=(pos,after)=>{let b=0;for(const x of apool){if(x.pos===pos&&x.adp>=after-2&&x.pts>b)b=x.pts;}return b;};
  const repl={};["QB","RB","WR","TE"].forEach(ps=>repl[ps]=bestLater(ps,(np<=pickNum+1&&npa<900?npa:(np<900?np:pickNum+state.teams))));
  // v3.2: how far below target depth each position is, for THIS roster (0..1, higher = needier)
  const need={};["QB","RB","WR","TE"].forEach(ps=>{const have=counts[ps]||0;need[ps]=Math.max(0,(ROSTER_NEED[ps]-have)/ROSTER_NEED[ps]);});
  const scored=cands.map(p=>{
    const marginal=p.pts-(repl[p.pos]||p.pts*0.55);
    // v3.2: risk-adjust the points by position volatility (shave the bustier positions slightly)
    const riskAdj=p.pts*POSVOL[p.pos]*0.3;
    let s=marginal*3.5+p.pts*0.2-riskAdj;
    // v3.2: balance nudge — reward filling a thin position, softly (caps at ~+18 so it never overrides a big marginal gap)
    s+=need[p.pos]*38*(round<=10?1:0.4);
    s+=Math.max(-20,Math.min(30,p.edge))*0.1;
    if(p.adp>round*state.teams+12)s-=25;
    if(round>=9&&p.pos==="RB"&&counts.RB<4)s+=30;
    if(round>=11&&p.pos==="WR"&&p.edge>=18)s+=25;
    if(round>=11&&FLOORS.has(p.name))s-=40;
    if(round>=12&&CUFFS.has(p.name)&&counts.RB>=3)s+=20;
    if(stackSet.has(p.name)&&!AVOID[p.name])s+=22;
    if(VETRISK.has(p.name)&&p.pos==="RB"&&vetRBs>=1)s-=30;
    if(p.pos==="QB"&&p.name==="Josh Allen"&&round>=3&&round<=4)s+=60;
    if(p.pos==="TE"&&counts.TE===0&&round>=3)s+=40;
    if(p.adp<npa-4)s+=8;
    return Object.assign({},p,{s,m:Math.round(marginal),stack:stackSet.has(p.name),urgent:(p.adp<np-1)&&(p.m>=25),lag:p.adp<=pickNum-10});});
  scored.sort((a,b)=>b.s-a.s);
  const tips=[];
  const haveTE=counts.TE>0,haveQB=counts.QB>0;
  if(round<=2)tips.push("R1-2: best RB/WR. Lean RB.");
  if(round>=3&&round<=4){if(!haveTE)tips.push("MONOPOLY: McBride/Bowers if up.");if(!haveQB)tips.push("Allen = the other monopoly. Other QBs: wait.");}
  if(round>=5&&round<=8)tips.push("VALUE WINDOW: Adams, Smith, Evans, Sutton, Pierce, Montgomery. No TEs.");
  if(round>=6&&!haveQB)tips.push("Hurts R6 / Lawrence R8 / Purdy free R10-11.");
  if(round>=9&&round<=10){if(counts.RB<4)tips.push("RB DEPTH: only "+counts.RB+" RBs. Grab a back.");if(!haveQB)tips.push("QB NOW: Purdy/Nix/Goff.");if(!haveTE)tips.push("TE now: Kelce/Kittle/Gadsden.");}
  if(round>=11&&round<=13)tips.push("CEILING ONLY. No floor vets (Meyers rule). Cuffs OK.");
  if(round>=14)tips.push("DEF R14, K R15.");
  if(haveTE)tips.push("NEVER a 2nd TE.");
  if(haveQB)tips.push("One QB only."+(stackSet.size?" Stack: "+myQB.name+"'s guys boosted.":""));
  if(vetRBs>=2)tips.push("WARNING: "+vetRBs+" age-cliff RBs. Cap it.");
  const haveDEF=state.mine.some(m=>m.pos==="DEF"),haveK=state.mine.some(m=>m.pos==="K");
  const remaining=state.rounds-state.mine.length;
  if(remaining<=2){
    const wantPos=(!haveDEF&&remaining<=2)?"DEF":((!haveK&&remaining<=1)||(!haveK&&haveDEF))?"K":null;
    if(wantPos){
      const dk=DEFK.filter(d=>d[1]===wantPos&&!state.takenNames.has(norm(d[0])));
      const top=dk.slice(0,3).map((d,i)=>({id:"dk"+i,name:d[0],pos:d[1],vrank:d[2],pts:0,adp:0,edge:0,s:999-i,stack:false,urgent:false,lag:false}));
      if(top.length)return{pickNum,round,counts,top,tips:[wantPos==="DEF"?"AUTO: Defense round.":"AUTO: Kicker round. Lock it and done.",...tips],np,npa};
    }
  }
  return{pickNum,round,counts,top:scored.slice(0,3),tips,np,npa};
}

function esc(t){return String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

function render(){
  let el=document.getElementById("mak-coach");
  if(!el){el=document.createElement("div");el.id="mak-coach";document.body.appendChild(el);
    el.style.cssText="position:fixed;top:70px;right:12px;width:330px;z-index:999999;font-family:Inter,system-ui,sans-serif;background:#0C1018;border:1px solid #2A3447;border-radius:12px;color:#E8EDF5;box-shadow:0 8px 30px rgba(0,0,0,.6);overflow:hidden;font-size:13px";
    let dx=0,dy=0,drag=false;
    el.addEventListener("mousedown",e=>{if(!e.target.closest("#mkc-drag"))return;drag=true;dx=e.clientX-el.offsetLeft;dy=e.clientY-el.offsetTop;e.preventDefault();});
    document.addEventListener("mousemove",e=>{if(!drag)return;el.style.left=(e.clientX-dx)+"px";el.style.top=(e.clientY-dy)+"px";el.style.right="auto";});
    document.addEventListener("mouseup",()=>drag=false);}
  if(state.collapsed){el.innerHTML='<div id="mkc-head" style="padding:10px 12px;font-weight:800;cursor:pointer;background:#151B28;letter-spacing:.5px">DRAFT COACH <span style="color:#5A6478;font-size:9px;font-weight:600">v3.2</span> <span style="color:#2FE08A">&#9654;</span></div>';
    document.getElementById("mkc-head").onclick=()=>{state.collapsed=false;render();};return;}
  const c=coach();
  const slotOpts=Array.from({length:state.teams},(_,i)=>i+1).map(s=>'<option value="'+s+'"'+(s===state.slot?' selected':'')+'>'+s+'</option>').join("");
  const tags=p=>{let t="";if(p.lag)t+='<span style="background:#FF5C6A;color:#0C1018;font-size:9px;font-weight:800;border-radius:3px;padding:0 4px;margin-left:5px">VERIFY ON BOARD</span>';if(p.stack)t+='<span style="background:#FFC247;color:#0C1018;font-size:9px;font-weight:800;border-radius:3px;padding:0 4px;margin-left:5px">STACK</span>';if(p.urgent)t+='<span style="background:#2FE08A;color:#0C1018;font-size:9px;font-weight:800;border-radius:3px;padding:0 4px;margin-left:5px">NOW OR NEVER</span>';if(VETRISK.has(p.name))t+='<span style="color:#FFC247;border:1px solid #FFC247;font-size:9px;font-weight:800;border-radius:3px;padding:0 4px;margin-left:5px">VET</span>';return t;};
  el.innerHTML=
  '<div id="mkc-drag" style="padding:10px 12px;font-weight:800;background:#151B28;display:flex;justify-content:space-between;align-items:center;letter-spacing:.5px;cursor:move;white-space:nowrap;gap:8px" title="Drag to move"><span id="mkc-head" style="cursor:pointer">DRAFT COACH <span style="color:#2FE08A">LIVE</span> <span style="color:#5A6478;font-size:9px;font-weight:600">v3.2</span></span><span><span id="mkc-exp" style="cursor:pointer;color:#5BA8FF;font-size:13px;font-weight:800;margin-right:8px" title="Export draft log to clipboard">&#8681;</span><span id="mkc-sync" style="cursor:pointer;color:#5BA8FF;font-size:11px;margin-right:10px">&#8635; SYNC</span><span style="color:#FFC247;font-size:13px;white-space:nowrap">R'+c.round+'&middot;PK'+c.pickNum+'</span></span></div>'+
  '<div style="padding:8px 12px;border-bottom:1px solid #1B2333;color:#8A94A8;display:flex;gap:8px;align-items:center;flex-wrap:wrap">My slot'+(state.auto&&!state.slotLocked?' <b style="color:#2FE08A;font-size:9px">AUTO</b>':'')+' <select id="mkc-slot" style="background:#1E2636;color:#E8EDF5;border:1px solid #2A3447;border-radius:5px;padding:2px 5px">'+slotOpts+'</select><span>next: <b style="color:#E8EDF5">#'+c.np+'</b> then <b style="color:#E8EDF5">#'+c.npa+'</b></span>'+(state.err?'<span style="color:#FF5C6A">'+esc(state.err)+'</span>':'')+'</div>'+
  '<div style="padding:10px 12px;border-bottom:1px solid #1B2333">'+((c.top[0]&&c.top[0].urgent)?'<div style="background:#173B2A;border:1px solid #2FE08A;border-radius:6px;padding:5px 8px;margin-bottom:7px;color:#2FE08A;font-weight:800;font-size:12px">&#9888; TAKE '+esc(c.top[0].name).toUpperCase()+' NOW</div>':'')+'<div style="color:#2FE08A;font-weight:800;font-size:11px;letter-spacing:1px;margin-bottom:6px">COACH SAYS &mdash; TOP 3 NOW</div>'+
  c.top.map((p,i)=>'<div style="display:flex;align-items:center;gap:7px;padding:4px 0"><span style="color:#FFC247;font-weight:800;width:14px">'+(i+1)+'</span><span style="color:'+POSC[p.pos]+';font-weight:800;font-size:10px;width:24px">'+p.pos+'</span><span style="flex:1">'+esc(p.name)+tags(p)+'</span>'+(typeof p.m==="number"&&p.m>0&&p.pts>0?'<span title="Points gained vs best '+p.pos+' likely there at your next pick" style="color:'+(p.m>=20?"#2FE08A":"#8A94A8")+';font-weight:700;font-size:11px">+'+Math.max(0,p.m)+'</span>':'')+'</div>').join("")+'</div>'+
  '<div style="padding:10px 12px;border-bottom:1px solid #1B2333;max-height:130px;overflow:auto"><div style="color:#8A94A8;font-weight:800;font-size:11px;letter-spacing:1px;margin-bottom:4px">TEMPLATE</div>'+
  c.tips.map(t=>'<div style="padding:2px 0;color:'+(t.includes("NEVER")||t.includes("WARNING")?"#FF5C6A":"#C6CEDC")+'">'+esc(t)+'</div>').join("")+'</div>'+
  '<div style="padding:10px 12px;max-height:150px;overflow:auto"><div style="color:#8A94A8;font-weight:800;font-size:11px;letter-spacing:1px;margin-bottom:4px">MY ROSTER ('+state.mine.length+') &mdash; QB '+c.counts.QB+' / RB '+c.counts.RB+' / WR '+c.counts.WR+' / TE '+c.counts.TE+'</div>'+
  (state.mine.length?state.mine.map((p,i)=>'<div style="padding:1px 0"><span style="color:#5A6478">'+(i+1)+'.</span> <span style="color:'+(POSC[p.pos]||"#8A94A8")+';font-weight:800;font-size:10px">'+p.pos+'</span> '+esc(p.name)+'</div>').join(""):'<div style="color:#5A6478">Waiting for your picks&hellip;</div>')+'</div>';
  document.getElementById("mkc-head").onclick=()=>{state.collapsed=true;render();};
  const sy=document.getElementById("mkc-sync");if(sy)sy.onclick=()=>poll();
  const ex=document.getElementById("mkc-exp");if(ex)ex.onclick=()=>{
    const c2=coach();
    const dump={v:"2.0",draftId,slot:state.slot,
      myRoster:state.mine.map(m=>m.name),topNow:c2.top.map(t=>t.name),
      recHistory:state.recLog,
      allTaken:P.filter(p=>state.taken.has(p.id)).map(p=>p.name)};
    navigator.clipboard.writeText(JSON.stringify(dump)).then(()=>{ex.textContent="Copied \u2713";setTimeout(()=>ex.innerHTML="&#8681;",1500);});
  };
  document.getElementById("mkc-slot").onchange=e=>{state.slot=+e.target.value;state.slotLocked=true;render();};
}

function detectMe(order){
  if(!order)return null;
  let ls="";try{ls=JSON.stringify(localStorage);}catch(e){}
  for(const uid of Object.keys(order)){ if(uid&&ls.includes(uid)) return {uid,slot:order[uid]}; }
  return null;
}
async function refreshMeta(){
  try{
    const d=await(await fetch("https://api.sleeper.app/v1/draft/"+draftId+"?t="+Date.now())).json();
    state.teams=d.settings.teams||8;state.rounds=d.settings.rounds||15;
    state.creator=(d.creators||[])[0];
    if(!state.slotLocked){
      const me=detectMe(d.draft_order);
      if(me){state.me=me.uid;if(me.slot&&me.slot!==state.slot){state.slot=me.slot;state.auto=true;render();}}
      else if(d.draft_order&&state.creator&&d.draft_order[state.creator]){state.me=state.creator;const s=d.draft_order[state.creator];if(s!==state.slot){state.slot=s;state.auto=true;render();}}
    }
  }catch(e){}
}
async function init(){
  await refreshMeta();
  if(!state.slot)state.slot=1;
  render();poll();setInterval(poll,800);setInterval(refreshMeta,5000);
}
async function poll(){
  try{
    const picks=await(await fetch("https://api.sleeper.app/v1/draft/"+draftId+"/picks?t="+Date.now())).json();
    // auto-correct slot: if creator's picks appear under a different draft_slot, follow it (until user overrides)
    if(!state.slotLocked){
      const meId=state.me||state.creator;
      if(meId){const cpick=picks.find(pk=>pk.picked_by===meId);
        if(cpick&&cpick.draft_slot&&cpick.draft_slot!==state.slot){state.slot=cpick.draft_slot;state.auto=true;}}
    }
    const taken=new Set();const mine=[];const takenNames=new Set();
    for(const pk of picks){
      const nm=norm((pk.metadata.first_name||"")+" "+(pk.metadata.last_name||""));
      const pos=pk.metadata.position;
      let match=BYNAME[nm];
      if(!match){
        const ln=norm(pk.metadata.last_name||"");const fi=(pk.metadata.first_name||"")[0]?norm(pk.metadata.first_name[0]):"";
        const cands=P.filter(x=>{const xs=norm(x.name).split(" ");return xs[xs.length-1]===ln&&xs[0][0]===fi&&x.pos===pos;});
        if(cands.length===1)match=cands[0];
      }
      const rec=match||{id:"x-"+nm,name:pk.metadata.first_name+" "+pk.metadata.last_name,pos:["RB","WR","TE","QB"].includes(pos)?pos:pos};
      takenNames.add(nm);
      if(match)taken.add(match.id);
      if(pk.draft_slot===state.slot)mine.push(rec);
    }
    state.taken=taken;state.mine=mine;state.takenNames=takenNames;state.err="";
    if(picks.length!==state.lastCount){
      state.lastCount=picks.length;
      try{const c=coach();state.recLog.push({pick:c.pickNum,round:c.round,top:c.top.map(t=>t.name),
        lastPick:picks.length?picks[picks.length-1].metadata.first_name+" "+picks[picks.length-1].metadata.last_name:null});}catch(e){}
    }
  }catch(e){state.err="sync lost, retrying";}
  render();
}
init();
