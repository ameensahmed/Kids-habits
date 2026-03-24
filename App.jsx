import { useState, useRef, useCallback, useEffect } from "react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = [
  { bg:"linear-gradient(135deg,#FF6B6B,#FF8E53)", light:"#FFF0EE", accent:"#FF6B6B", dark:"#C94F4F" },
  { bg:"linear-gradient(135deg,#4ECDC4,#44A8A0)", light:"#EEFAF9", accent:"#4ECDC4", dark:"#2DA89F" },
  { bg:"linear-gradient(135deg,#A78BFA,#7C3AED)", light:"#F3EEFF", accent:"#A78BFA", dark:"#6D28D9" },
  { bg:"linear-gradient(135deg,#F59E0B,#EF8C00)", light:"#FFFBEB", accent:"#F59E0B", dark:"#B45309" },
  { bg:"linear-gradient(135deg,#10B981,#059669)", light:"#ECFDF5", accent:"#10B981", dark:"#047857" },
  { bg:"linear-gradient(135deg,#F472B6,#EC4899)", light:"#FDF2F8", accent:"#F472B6", dark:"#BE185D" },
  { bg:"linear-gradient(135deg,#38BDF8,#0284C7)", light:"#EFF9FF", accent:"#38BDF8", dark:"#0369A1" },
  { bg:"linear-gradient(135deg,#FB923C,#EA580C)", light:"#FFF4EE", accent:"#FB923C", dark:"#C2410C" },
];

const AVATARS = ["🦁","🐼","🦊","🐸","🐯","🦋","🐬","🦄","🐙","🦚","🐧","🦝","🐻","🐨","🦒","🐘","🦓","🦅","🦜","🐺","🐮","🐷","👦","👧","🧒","🧑‍🚀","🧑‍🎨","🧑‍🏫","🧑‍🔬"];

const HABIT_EMOJI_GROUPS = {
  "🧼 Hygiene":    ["🦷","🚿","🛁","🧴","🪥","💆","💅","🧻"],
  "📖 Learning":   ["📚","✏️","📝","🔬","🎓","💡","🗺️","🧮","📐","🖊️"],
  "🥗 Health":     ["🥦","🍎","🥕","🥗","💧","🏃","⚽","🤸","🏋️","🚴","🧘","😴","🫀"],
  "🏠 Chores":     ["🛏️","🧹","🧺","🍽️","🪴","🗑️","🧽","🪣","🔧","🚪"],
  "🙏 Faith":      ["🕌","🤲","📿","🌙","⭐","🕋","🛐","📖","🕯️","🌿"],
  "🎨 Creativity": ["🎨","🎵","🎹","🎸","🖌️","🎭","📸","🎬","🧩","🎲"],
  "💛 Character":  ["🤝","😊","❤️","🌟","🏅","🎯","💪","🧠","🐾","👏","🌈","🕊️"],
  "📵 Screen":     ["📵","⏰","📱","💻","🎮","📺"],
};

const REWARD_EMOJI_GROUPS = {
  "🍕 Food":       ["🍕","🍦","🧁","🍰","🍫","🍿","🥤","🍔","🌮","🍜"],
  "🎮 Fun":        ["🎮","🎡","🎢","🎠","🎯","🎳","🎲","🧩","🎪","🃏"],
  "📱 Tech":       ["📱","💻","🎵","📺","🎬","📷","🎧","🕹️"],
  "✈️ Outings":    ["🏖️","🎡","🎥","🏟️","🛍️","🏕️","🚂","✈️","🎭","🏊"],
  "🛌 Privileges": ["🌙","⏰","🛏️","🚗","🎤","👑","🔑","🎁"],
  "🏅 Trophies":   ["🏅","🥇","🏆","⭐","🌟","💎","👏","🎀"],
  "💰 Money":      ["💰","💵","💳","🏦","💸","🪙","💴","💶"],
};

const DEFAULT_HABITS = [
  { id:"h1", label:"Brush teeth",  emoji:"🦷", points:10 },
  { id:"h2", label:"Make my bed",  emoji:"🛏️",points:10 },
  { id:"h3", label:"Read a book",  emoji:"📚", points:20 },
  { id:"h4", label:"Do homework",  emoji:"✏️", points:20 },
  { id:"h5", label:"Eat veggies",  emoji:"🥦", points:15 },
  { id:"h6", label:"Pray on time", emoji:"🤲", points:25 },
];

const DEFAULT_REWARDS = [
  { id:"r1", label:"Extra screen time", emoji:"📱", cost:50,  moneyValue:0 },
  { id:"r2", label:"Choose dinner",     emoji:"🍕", cost:80,  moneyValue:0 },
  { id:"r3", label:"Stay up late",      emoji:"🌙", cost:100, moneyValue:0 },
  { id:"r4", label:"Fun outing",        emoji:"🎡", cost:200, moneyValue:0 },
];

let _id = 4000;
const uid = () => `u${++_id}`;
const TODAY = new Date();
const fmt = d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const todayStr = fmt(TODAY);
const makeHistory = ()=>{ const h={}; for(let i=29;i>=1;i--){ const d=new Date(TODAY); d.setDate(d.getDate()-i); h[fmt(d)]=Math.random()>0.35?"done":Math.random()>0.5?"partial":"miss"; } return h; };

const SAMPLE_KIDS = [
  { id:"k1",name:"Emma", avatar:"🦋",photo:null,paletteIdx:0,points:145,streak:5, moneyRate:0.10, habits:DEFAULT_HABITS,rewards:DEFAULT_REWARDS,checked:{h1:true,h3:true},history:makeHistory(),dayChecked:{},claimedRewards:[],transactions:[] },
  { id:"k2",name:"Liam", avatar:"🦁",photo:null,paletteIdx:1,points:220,streak:8, moneyRate:0.10, habits:[...DEFAULT_HABITS,{id:"h7",label:"Practice piano",emoji:"🎹",points:25}],rewards:DEFAULT_REWARDS,checked:{h1:true,h2:true,h4:true},history:makeHistory(),dayChecked:{},claimedRewards:[],transactions:[] },
  { id:"k3",name:"Zoe",  avatar:"🐼",photo:null,paletteIdx:2,points:75, streak:2, moneyRate:0.10, habits:[...DEFAULT_HABITS,{id:"h8",label:"Water plants",emoji:"🪴",points:10}],rewards:DEFAULT_REWARDS,checked:{},history:makeHistory(),dayChecked:{},claimedRewards:[],transactions:[] },
];

// ─── Components ───────────────────────────────────────────────────────────────
function Confetti({ active }) {
  if (!active) return null;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999}}>
      {Array.from({length:40},(_,i)=>(
        <div key={i} style={{position:"absolute",top:"-12px",left:`${2+Math.random()*96}%`,width:8+(i%3)*4,height:8+(i%3)*4,borderRadius:i%4===0?"50%":"2px",background:["#FF6B6B","#FFD93D","#6BCB77","#4ECDC4","#A78BFA","#F472B6","#FF922B","#38BDF8"][i%8],animation:`cffall ${1+Math.random()*1.8}s ease-in ${Math.random()*0.7}s forwards`}}/>
      ))}
    </div>
  );
}

function Modal({ children, onClose, wide }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(10,10,25,0.6)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"white",borderRadius:26,padding:26,width:"100%",maxWidth:wide?520:450,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function KidAvatar({kid,size=56,showRing,ringColor}) {
  const pal=PALETTE[kid.paletteIdx];
  const shadow=showRing?`0 0 0 3px white, 0 0 0 6px ${ringColor||pal.accent}`:"none";
  return kid.photo
    ? <img src={kid.photo} alt={kid.name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,boxShadow:shadow}}/>
    : <div style={{width:size,height:size,borderRadius:"50%",background:pal.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.46,flexShrink:0,boxShadow:shadow}}>{kid.avatar}</div>;
}

function PhotoUploader({currentPhoto,onPhoto,size=80,accent="#6366F1"}) {
  const ref=useRef();
  const handle=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>onPhoto(ev.target.result);r.readAsDataURL(f);};
  return (
    <div style={{position:"relative",width:size,height:size,cursor:"pointer",flexShrink:0}} onClick={()=>ref.current.click()}>
      {currentPhoto
        ?<img src={currentPhoto} alt="p" style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:`3px solid ${accent}`}}/>
        :<div style={{width:size,height:size,borderRadius:"50%",background:"#F4F0FF",border:`3px dashed ${accent}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
          <span style={{fontSize:26}}>📷</span>
          <span style={{fontSize:10,color:accent,fontWeight:800,textAlign:"center",lineHeight:1.2}}>Add<br/>Photo</span>
        </div>}
      <div style={{position:"absolute",bottom:1,right:1,background:accent,borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,boxShadow:"0 2px 6px rgba(0,0,0,0.22)"}}>✏️</div>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={handle}/>
    </div>
  );
}

function EmojiPicker({groups,value,onChange,accent="#5B5BD6"}) {
  const [tab,setTab]=useState(Object.keys(groups)[0]);
  return (
    <div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
        {Object.keys(groups).map(cat=>(
          <button key={cat} onClick={()=>setTab(cat)} style={{background:tab===cat?accent:"#F3F3F8",color:tab===cat?"white":"#777",border:"none",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>{cat}</button>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,maxHeight:110,overflowY:"auto",paddingRight:4}}>
        {groups[tab].map(e=>(
          <button key={e} onClick={()=>onChange(e)} style={{fontSize:22,background:value===e?"#F3F0FF":"#FAFAFA",border:`2px solid ${value===e?accent:"#EEE"}`,borderRadius:10,padding:"5px 7px",cursor:"pointer",lineHeight:1}}>{e}</button>
        ))}
      </div>
    </div>
  );
}

// ── SortableList — pointer-events, handle-only drag, works on touch + mouse ──
function SortableList({ items, onReorder, renderItem, dragEnabled, itemKey }) {
  const [dragIdx, setDragIdx]       = useState(null);
  const [overIdx, setOverIdx]       = useState(null);
  const [ghostPos, setGhostPos]     = useState(null);
  const containerRef = useRef(null);
  const rowRefs      = useRef([]);
  const dragState    = useRef(null);
  const activePointerId = useRef(null);

  const getRowMeta = () => rowRefs.current.map(r => {
    if (!r) return { top: 0, height: 48, mid: 24 };
    const rect = r.getBoundingClientRect();
    return { top: rect.top, height: rect.height, mid: rect.top + rect.height / 2 };
  });

  // Called only from the handle element
  const handlePointerDown = (e, i) => {
    if (!dragEnabled) return;
    e.stopPropagation();
    e.preventDefault();
    const row = rowRefs.current[i];
    if (!row) return;
    // Capture on the handle's parent row div instead
    try { row.setPointerCapture(e.pointerId); } catch(_) {}
    activePointerId.current = e.pointerId;
    const rect = row.getBoundingClientRect();
    dragState.current = {
      startIdx: i,
      currentIdx: i,
      offsetY: e.clientY - rect.top,
    };
    setDragIdx(i);
    setOverIdx(i);
    setGhostPos({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
  };

  const handlePointerMove = (e, i) => {
    if (!dragEnabled || !dragState.current || dragState.current.startIdx !== i) return;
    if (activePointerId.current !== null && e.pointerId !== activePointerId.current) return;
    const { offsetY } = dragState.current;
    const newTop = e.clientY - offsetY;
    setGhostPos(prev => prev ? { ...prev, top: newTop } : null);
    // Determine drop slot
    const meta = getRowMeta();
    let newOver = 0;
    for (let j = 0; j < meta.length; j++) {
      if (e.clientY >= meta[j].mid) newOver = j;
    }
    if (newOver !== dragState.current.currentIdx) {
      dragState.current.currentIdx = newOver;
      setOverIdx(newOver);
    }
  };

  const handlePointerUp = (e, i) => {
    if (!dragState.current || dragState.current.startIdx !== i) return;
    const { startIdx, currentIdx } = dragState.current;
    dragState.current = null;
    activePointerId.current = null;
    setDragIdx(null);
    setOverIdx(null);
    setGhostPos(null);
    if (startIdx !== currentIdx) {
      const arr = [...items];
      const [item] = arr.splice(startIdx, 1);
      arr.splice(currentIdx, 0, item);
      onReorder(arr);
    }
  };

  const handlePointerCancel = () => {
    dragState.current = null;
    activePointerId.current = null;
    setDragIdx(null); setOverIdx(null); setGhostPos(null);
  };

  const ghostContent = dragIdx !== null ? renderItem(items[dragIdx], dragIdx, true) : null;

  return (
    <div ref={containerRef} style={{ position: "relative", userSelect: "none" }}>
      {items.map((item, i) => {
        const isDragging = dragIdx === i;
        const isOver = overIdx === i && dragIdx !== null && dragIdx !== i;
        const key = itemKey ? item[itemKey] : item.id;
        return (
          <div key={key}
            ref={el => rowRefs.current[i] = el}
            onPointerMove={e => handlePointerMove(e, i)}
            onPointerUp={e => handlePointerUp(e, i)}
            onPointerCancel={handlePointerCancel}
            style={{
              opacity: isDragging ? 0.2 : 1,
              borderTop: isOver ? "3px solid #A78BFA" : "3px solid transparent",
              transition: "opacity 0.12s, border 0.1s",
              touchAction: dragEnabled ? "none" : "auto",
            }}>
            {/* Pass handlePointerDown for the handle to call */}
            {renderItem(item, i, false, e => handlePointerDown(e, i))}
          </div>
        );
      })}

      {/* Floating ghost */}
      {ghostPos && ghostContent && (
        <div style={{
          position: "fixed",
          top: ghostPos.top,
          left: ghostPos.left,
          width: ghostPos.width,
          pointerEvents: "none",
          zIndex: 9000,
          opacity: 0.93,
          transform: "scale(1.02) rotate(0.8deg)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
          borderRadius: 14,
          background: "white",
        }}>
          {ghostContent}
        </div>
      )}
    </div>
  );
}

// Reusable drag handle dots button
function DragHandle({ onPointerDown }) {
  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        display: "flex", flexDirection: "column", gap: 3,
        padding: "6px 8px", cursor: "grab", flexShrink: 0,
        borderRadius: 8, touchAction: "none",
        alignItems: "center", justifyContent: "center",
      }}
      title="Hold to drag">
      {[0,1,2].map(row => (
        <div key={row} style={{ display: "flex", gap: 3 }}>
          {[0,1].map(col => (
            <div key={col} style={{ width: 4, height: 4, borderRadius: "50%", background: "#C4B5FD" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Reward Calendar ───────────────────────────────────────────────────────────
function RewardCalendar({ kid, pal, onUpdateDay }) {
  const [calMonth, setCalMonth] = useState(()=>{const d=new Date();return{y:d.getFullYear(),m:d.getMonth()};});
  const [selectedDay, setSelectedDay] = useState(null); // dateStr
  const [editingStatus, setEditingStatus] = useState(false);

  const {y,m} = calMonth;
  const firstDay = new Date(y,m,1).getDay();
  const daysInMonth = new Date(y,m+1,0).getDate();
  const monthName = new Date(y,m,1).toLocaleString("default",{month:"long",year:"numeric"});

  const claimedByDay = {};
  (kid.claimedRewards||[]).forEach(cr=>{
    const day=cr.date.slice(0,10);
    if(!claimedByDay[day]) claimedByDay[day]=[];
    claimedByDay[day].push(cr);
  });

  const txByDay = {};
  (kid.transactions||[]).forEach(t=>{
    const day=t.date.slice(0,10);
    if(!txByDay[day]) txByDay[day]=[];
    txByDay[day].push(t);
  });

  const history = kid.history||{};
  const cells=[]; for(let i=0;i<firstDay;i++) cells.push(null); for(let d=1;d<=daysInMonth;d++) cells.push(d);

  // Per-day habit completion stored in kid.dayChecked[dateStr] = {habitId: bool}
  const dayChecked = kid.dayChecked||{};

  const statusMeta = {
    done:    { label:"All Done",  bg:`${pal.accent}22`, border:pal.accent,  icon:"✅", textColor:"#1A1A2E" },
    partial: { label:"Partial",   bg:"#FFF3E0",          border:"#F59E0B",   icon:"🟡", textColor:"#1A1A2E" },
    miss:    { label:"Missed",    bg:"#FFF0F0",          border:"#FF6B6B",   icon:"❌", textColor:"#1A1A2E" },
    none:    { label:"No record", bg:"#F8F8FB",          border:"#EEE",      icon:"⬜", textColor:"#aaa"    },
  };

  const getDayStyle = (ds, hist, isToday, isFuture, isSelected) => {
    let bg="transparent", textColor="#444", borderColor="transparent";
    if(isFuture){ textColor="#ccc"; }
    else if(hist==="done")    { bg=`${pal.accent}22`; borderColor=pal.accent; }
    else if(hist==="partial") { bg="#FFF3E0"; borderColor="#F59E0B"; }
    else if(hist==="miss")    { bg="#FFF0F0"; borderColor="#FF6B6B"; }
    if(isToday)   { bg=pal.bg; textColor="white"; borderColor="transparent"; }
    if(isSelected){ borderColor="#5B5BD6"; }
    return {bg, textColor, borderColor};
  };

  const selDs = selectedDay;
  const selHist = selDs ? (history[selDs]||"none") : null;
  const selClaimed = selDs ? (claimedByDay[selDs]||[]) : [];
  const selTx = selDs ? (txByDay[selDs]||[]) : [];
  const selChecked = selDs ? (dayChecked[selDs]||{}) : {};
  const selIsFuture = selDs ? selDs>todayStr : false;
  const selIsToday  = selDs ? selDs===todayStr : false;
  const selDateLabel = selDs ? new Date(selDs+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}) : "";

  const handleStatusChange = (newStatus) => {
    if(!selDs || selIsFuture) return;
    onUpdateDay(selDs, { status: newStatus });
    setEditingStatus(false);
  };

  const toggleDayHabit = (habitId) => {
    if(!selDs || selIsFuture) return;
    const cur = dayChecked[selDs]||{};
    const wasDone = !!cur[habitId];
    const newChecked = {...cur, [habitId]: !wasDone};
    // Auto-compute status from checked habits
    const total = kid.habits.length;
    const doneCount = Object.values(newChecked).filter(Boolean).length;
    const newStatus = doneCount===0 ? "miss" : doneCount===total ? "done" : "partial";
    onUpdateDay(selDs, { dayChecked: newChecked, status: newStatus });
  };

  return (
    <div>
      {/* ── Calendar grid ── */}
      <div style={{background:"white",borderRadius:20,padding:18,boxShadow:"0 2px 12px rgba(0,0,0,0.07)",marginBottom:selectedDay?14:0}}>
        {/* Month nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <button onClick={()=>{setCalMonth(({y,m})=>m===0?{y:y-1,m:11}:{y,m:m-1});setSelectedDay(null);}} style={{background:"#F5F5FF",border:"none",borderRadius:10,padding:"6px 14px",cursor:"pointer",fontSize:18,fontWeight:700,color:"#5B5BD6"}}>‹</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#1A1A2E"}}>{monthName}</div>
          <button onClick={()=>{setCalMonth(({y,m})=>m===11?{y:y+1,m:0}:{y,m:m+1});setSelectedDay(null);}} style={{background:"#F5F5FF",border:"none",borderRadius:10,padding:"6px 14px",cursor:"pointer",fontSize:18,fontWeight:700,color:"#5B5BD6"}}>›</button>
        </div>

        {/* Day headers */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:6}}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>(
            <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:800,color:"#bbb",paddingBottom:4}}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {cells.map((day,i)=>{
            if(!day) return <div key={`e${i}`}/>;
            const ds=`${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const isToday=ds===todayStr, isFuture=ds>todayStr, isSelected=ds===selectedDay;
            const hist=history[ds];
            const claimed=claimedByDay[ds]||[];
            const {bg,textColor,borderColor} = getDayStyle(ds,hist,isToday,isFuture,isSelected);
            return (
              <button key={ds} onClick={()=>setSelectedDay(ds===selectedDay?null:ds)}
                style={{background:bg,borderRadius:10,padding:"5px 2px",textAlign:"center",fontSize:13,fontWeight:isToday||isSelected?900:600,color:textColor,minHeight:36,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:`2px solid ${borderColor}`,cursor:isFuture?"default":"pointer",transition:"all 0.15s",outline:"none",position:"relative"}}>
                {day}
                {claimed.length>0 && (
                  <div style={{display:"flex",gap:1,flexWrap:"wrap",justifyContent:"center",marginTop:1}}>
                    {claimed.slice(0,2).map((c,ci)=><span key={ci} style={{fontSize:8}}>{c.emoji}</span>)}
                  </div>
                )}
                {hist==="done"&&!isToday&&<div style={{fontSize:8,lineHeight:1}}>✅</div>}
                {hist==="partial"&&!isToday&&<div style={{fontSize:8,lineHeight:1}}>🟡</div>}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:14,fontSize:11,color:"#aaa"}}>
          {[[pal.bg,"Today","white"],[`${pal.accent}22`,"All done","#555"],["#FFF3E0","Partial","#555"],["#FFF0F0","Missed","#555"]].map(([bg,lbl,c])=>(
            <div key={lbl} style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:12,height:12,borderRadius:3,background:bg,border:"1px solid #EEE"}}/>
              <span style={{color:c}}>{lbl}</span>
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:4}}><span>🎁</span><span>Reward claimed</span></div>
        </div>
      </div>

      {/* ── Day Detail Panel ── */}
      {selectedDay && (
        <div style={{background:"white",borderRadius:20,padding:18,boxShadow:"0 4px 20px rgba(0,0,0,0.1)",animation:"slideUp 0.25s ease"}}>

          {/* Day header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#1A1A2E"}}>{selDateLabel}</div>
              <div style={{fontSize:12,color:"#aaa",marginTop:2}}>
                {selIsToday ? "Today" : selIsFuture ? "Future date" : "Past day"}
              </div>
            </div>
            <button onClick={()=>setSelectedDay(null)} style={{background:"#F5F5F5",border:"none",borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:16,color:"#aaa",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>

          {/* Status badge + edit */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:800,color:"#aaa",letterSpacing:1,marginBottom:8}}>DAY STATUS</div>
            {!editingStatus ? (
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,background:statusMeta[selHist]?.bg||"#F8F8FB",border:`2px solid ${statusMeta[selHist]?.border||"#EEE"}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>{statusMeta[selHist]?.icon||"⬜"}</span>
                  <span style={{fontWeight:700,fontSize:15,color:statusMeta[selHist]?.textColor||"#aaa"}}>{statusMeta[selHist]?.label||"No record"}</span>
                </div>
                {!selIsFuture && (
                  <button onClick={()=>setEditingStatus(true)} style={{background:"#F3F0FF",border:"none",borderRadius:12,padding:"10px 14px",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,color:"#5B5BD6",whiteSpace:"nowrap"}}>✏️ Edit</button>
                )}
              </div>
            ) : (
              <div>
                <div style={{fontSize:13,color:"#888",marginBottom:8}}>Set day status:</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                  {[["done","✅","All Done",`${pal.accent}22`,pal.accent],["partial","🟡","Partial","#FFF3E0","#F59E0B"],["miss","❌","Missed","#FFF0F0","#FF6B6B"]].map(([val,icon,label,bg,border])=>(
                    <button key={val} onClick={()=>handleStatusChange(val)}
                      style={{background:selHist===val?bg:"#FAFAFA",border:`2px solid ${selHist===val?border:"#EEE"}`,borderRadius:12,padding:"10px 6px",cursor:"pointer",fontFamily:"inherit",fontWeight:800,fontSize:12,display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all 0.15s"}}>
                      <span style={{fontSize:20}}>{icon}</span>
                      <span style={{color:selHist===val?border:"#888"}}>{label}</span>
                    </button>
                  ))}
                </div>
                <button onClick={()=>setEditingStatus(false)} style={{background:"#F5F5F5",border:"none",borderRadius:10,padding:"7px 16px",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,color:"#aaa"}}>Cancel</button>
              </div>
            )}
          </div>

          {/* Habits checklist for that day */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:800,color:"#aaa",letterSpacing:1,marginBottom:8}}>HABITS</div>
            {kid.habits.length===0 && <div style={{color:"#ccc",fontSize:13}}>No habits defined</div>}
            {kid.habits.map(h=>{
              // For today use live checked state, for past days use dayChecked
              const done = selIsToday ? !!(kid.checked||{})[h.id] : !!(selChecked[h.id]);
              return (
                <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #F5F5F5"}}>
                  <span style={{fontSize:20}}>{h.emoji}</span>
                  <span style={{flex:1,fontWeight:600,fontSize:14,color:done?"#1A1A2E":"#aaa",textDecoration:done?"none":"none"}}>{h.label}</span>
                  <span style={{fontSize:12,color:done?pal.accent:"#ddd",fontWeight:700}}>{done?`+${h.points}pts`:""}</span>
                  {!selIsFuture && !selIsToday ? (
                    <button onClick={()=>toggleDayHabit(h.id)} style={{background:done?pal.accent:"#F0F0F8",border:"none",borderRadius:9,width:32,height:32,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",flexShrink:0}}>
                      {done?"✅":"⬜"}
                    </button>
                  ) : (
                    <span style={{fontSize:18,flexShrink:0}}>{done?"✅":"⬜"}</span>
                  )}
                </div>
              );
            })}
            {/* Points summary for that day */}
            {!selIsFuture && (()=>{
              const pts = selIsToday
                ? kid.habits.filter(h=>!!(kid.checked||{})[h.id]).reduce((s,h)=>s+h.points,0)
                : kid.habits.filter(h=>!!selChecked[h.id]).reduce((s,h)=>s+h.points,0);
              const total = kid.habits.reduce((s,h)=>s+h.points,0);
              return (
                <div style={{marginTop:10,background:`${pal.accent}10`,borderRadius:10,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#666"}}>Points earned</span>
                  <span style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:pal.accent}}>{pts} / {total}</span>
                </div>
              );
            })()}
          </div>

          {/* Rewards claimed that day */}
          {selClaimed.length>0 && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:800,color:"#aaa",letterSpacing:1,marginBottom:8}}>REWARDS CLAIMED</div>
              {selClaimed.map((cr,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:"#FFFBEB",borderRadius:12,padding:"9px 12px",marginBottom:6}}>
                  <span style={{fontSize:20}}>{cr.emoji}</span>
                  <span style={{flex:1,fontWeight:700,fontSize:13}}>{cr.label}</span>
                  <span style={{background:"#FFF3D0",color:"#D97706",borderRadius:8,padding:"3px 8px",fontSize:12,fontWeight:800}}>-{cr.cost}pts</span>
                  {cr.moneyValue>0&&<span style={{background:"#F0FFF4",color:"#047857",borderRadius:8,padding:"3px 8px",fontSize:12,fontWeight:800}}>💵${cr.moneyValue.toFixed(2)}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Transactions that day */}
          {selTx.length>0 && (
            <div>
              <div style={{fontSize:12,fontWeight:800,color:"#aaa",letterSpacing:1,marginBottom:8}}>POINT ACTIVITY</div>
              {selTx.map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,padding:"7px 10px",background:"#FAFAFA",borderRadius:10}}>
                  <span style={{fontSize:16}}>{t.type==="fine"?"⚠️":t.type==="bonus"?"🌟":"🎁"}</span>
                  <span style={{flex:1,fontSize:13,fontWeight:600,color:"#444"}}>{t.label}</span>
                  <span style={{fontWeight:800,fontSize:13,color:t.amount<0?"#FF6B6B":"#10B981"}}>{t.amount>0?"+":""}{t.amount}pts</span>
                </div>
              ))}
            </div>
          )}

          {selClaimed.length===0 && selTx.length===0 && !selIsFuture && (
            <div style={{textAlign:"center",color:"#ccc",fontSize:13,padding:"8px 0"}}>No rewards or transactions on this day</div>
          )}
          {selIsFuture && (
            <div style={{textAlign:"center",color:"#ccc",fontSize:13,padding:"8px 0"}}>📅 This day hasn't happened yet</div>
          )}
        </div>
      )}

      {/* Recent claims summary */}
      {(kid.claimedRewards||[]).length>0 && !selectedDay && (
        <div style={{background:"white",borderRadius:20,padding:18,marginTop:14,boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
          <div style={{fontWeight:800,fontSize:13,color:"#666",marginBottom:10}}>🎁 Recent Claims</div>
          {[...(kid.claimedRewards||[])].reverse().slice(0,5).map((cr,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,background:"#FAFAFA",borderRadius:10,padding:"7px 10px"}}>
              <span style={{fontSize:18}}>{cr.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13}}>{cr.label}</div>
                <div style={{fontSize:11,color:"#aaa"}}>{new Date(cr.date).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</div>
              </div>
              <span style={{background:`${pal.accent}20`,color:pal.dark,borderRadius:8,padding:"3px 8px",fontSize:12,fontWeight:800}}>-{cr.cost}pts</span>
              {cr.moneyValue>0&&<span style={{background:"#F0FFF4",color:"#047857",borderRadius:8,padding:"3px 8px",fontSize:12,fontWeight:800}}>${cr.moneyValue.toFixed(2)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PIN Verify mini-modal ─────────────────────────────────────────────────────
function PinVerify({ pin, onSuccess, onCancel, message="Enter parent PIN to continue" }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => { if(val===pin){onSuccess();}else{setErr(true);setVal("");} };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(10,10,25,0.65)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onCancel}>
      <div style={{background:"white",borderRadius:22,padding:28,width:"100%",maxWidth:340,textAlign:"center",boxShadow:"0 24px 64px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:40,marginBottom:8}}>🔐</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,marginBottom:4}}>Parent Required</div>
        <div style={{color:"#aaa",fontSize:13,marginBottom:18}}>{message}</div>
        <input autoFocus type="password" maxLength={8} placeholder="• • • •" value={val}
          onChange={e=>{setVal(e.target.value);setErr(false);}}
          onKeyDown={e=>e.key==="Enter"&&submit()}
          style={{width:"100%",border:`2px solid ${err?"#FF6B6B":"#E8E8EE"}`,borderRadius:12,padding:"10px",fontFamily:"inherit",fontSize:24,textAlign:"center",letterSpacing:8,outline:"none",marginBottom:err?8:16}}/>
        {err&&<div style={{color:"#FF6B6B",fontSize:13,fontWeight:700,marginBottom:12}}>❌ Wrong PIN</div>}
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,background:"#F0F0F0",color:"#888",border:"none",borderRadius:12,padding:"10px",fontFamily:"inherit",fontWeight:800,cursor:"pointer"}}>Cancel</button>
          <button onClick={submit} style={{flex:1,background:"linear-gradient(135deg,#5B5BD6,#8B5CF6)",color:"white",border:"none",borderRadius:12,padding:"10px",fontFamily:"inherit",fontWeight:800,cursor:"pointer"}}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [kids, setKids] = useState(() => {
    try {
      const saved = localStorage.getItem("fh_kids");
      return saved ? JSON.parse(saved) : SAMPLE_KIDS;
    } catch { return SAMPLE_KIDS; }
  });

  const [view, setView] = useState("home");
  const [activeKid, setActiveKid] = useState(null);
  const [kidTab, setKidTab] = useState("habits");
  const [confetti, setConfetti] = useState(false);
  const [toast, setToast] = useState(null);

  // PIN — persisted separately
  const [parentPin, setParentPin] = useState(() => {
    try { return localStorage.getItem("fh_pin") || "1234"; } catch { return "1234"; }
  });
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [changePinOpen, setChangePinOpen] = useState(false);
  const [cpOld,setCpOld]=useState(""); const [cpNew,setCpNew]=useState(""); const [cpNew2,setCpNew2]=useState(""); const [cpErr,setCpErr]=useState("");

  // Session-based parent login for habit checking (login once, check freely)
  const [parentSessionActive, setParentSessionActive] = useState(false);
  const [habitLoginOpen, setHabitLoginOpen] = useState(false);
  const [habitLoginInput, setHabitLoginInput] = useState("");
  const [habitLoginErr, setHabitLoginErr] = useState(false);

  // Edit mode for drag & drop lives only in Parent Dashboard (always-on there)

  // Modals
  const [addKidOpen, setAddKidOpen] = useState(false);
  const [editKidId, setEditKidId] = useState(null);
  const [addHabitKid, setAddHabitKid] = useState(null);
  const [addRewardKid, setAddRewardKid] = useState(null);
  const [fineModal, setFineModal] = useState(null);      // kidId
  const [bonusModal, setBonusModal] = useState(null);    // kidId
  const [moneyModal, setMoneyModal] = useState(null);    // {kidId, rewardId}
  const [rateModal, setRateModal] = useState(null);      // kidId — set global pts→money rate

  // Forms
  const [nkName,setNkName]=useState(""); const [nkAvatar,setNkAvatar]=useState("🦁"); const [nkPhoto,setNkPhoto]=useState(null); const [nkPalette,setNkPalette]=useState(0);
  const [ekName,setEkName]=useState(""); const [ekAvatar,setEkAvatar]=useState("🦁"); const [ekPhoto,setEkPhoto]=useState(null); const [ekPalette,setEkPalette]=useState(0);
  const [nhLabel,setNhLabel]=useState(""); const [nhEmoji,setNhEmoji]=useState("🌟"); const [nhPoints,setNhPoints]=useState(10);
  const [nrLabel,setNrLabel]=useState(""); const [nrEmoji,setNrEmoji]=useState("🎁"); const [nrCost,setNrCost]=useState(50);
  // Fine form
  const [fineAmount,setFineAmount]=useState(10); const [fineReason,setFineReason]=useState("");
  // Bonus form
  const [bonusAmount,setBonusAmount]=useState(20); const [bonusReason,setBonusReason]=useState("");
  // Money form
  const [moneyRate,setMoneyRate]=useState("0.10");
  const [rateInput,setRateInput]=useState("0.10");

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(null),2800);};
  const boom=()=>{setConfetti(true);setTimeout(()=>setConfetti(false),2600);};

  // ── Auto-save to localStorage whenever kids or PIN change ──
  useEffect(()=>{
    try { localStorage.setItem("fh_kids", JSON.stringify(kids)); } catch {}
  }, [kids]);

  useEffect(()=>{
    try { localStorage.setItem("fh_pin", parentPin); } catch {}
  }, [parentPin]);
  const kid=kids.find(k=>k.id===activeKid);
  const pal=kid?PALETTE[kid.paletteIdx]:PALETTE[0];
  const updateKid=(id,fn)=>setKids(ks=>ks.map(k=>k.id===id?fn(k):k));
  const dailyPts=k=>Object.entries(k.checked).filter(([,v])=>v).reduce((s,[id])=>s+(k.habits.find(h=>h.id===id)?.points||0),0);
  const maxPts=k=>k.habits.reduce((s,h)=>s+h.points,0);

  // Habit toggle — session-based: login once, then check freely
  const doToggle=(kidId,habitId)=>{
    const k=kids.find(x=>x.id===kidId);
    const habit=k.habits.find(h=>h.id===habitId);
    const wasDone=!!k.checked[habitId];
    const prevStars=Math.floor(k.points/100);
    const newPoints=Math.max(0,k.points+(wasDone?-habit.points:habit.points));
    const newHistory={...k.history};
    const allDone=k.habits.every(h=>h.id===habitId?!wasDone:!!k.checked[h.id]);
    newHistory[todayStr]=allDone?"done":"partial";
    updateKid(kidId,k=>({...k,points:newPoints,checked:{...k.checked,[habitId]:!wasDone},history:newHistory}));
    if(!wasDone){
      if(Math.floor(newPoints/100)>prevStars){boom();showToast("⭐ New star earned!");}
      else showToast(`+${habit.points} pts — ${habit.label}!`);
    }
  };

  const handleHabitCheck=(kidId,habitId)=>{
    if(parentSessionActive){ doToggle(kidId,habitId); return; }
    // Not logged in yet — open login overlay, store pending action
    setHabitLoginOpen({kidId,habitId});
    setHabitLoginInput(""); setHabitLoginErr(false);
  };

  const confirmHabitLogin=()=>{
    if(habitLoginInput===parentPin){
      setParentSessionActive(true);
      const {kidId,habitId}=habitLoginOpen;
      setHabitLoginOpen(false); setHabitLoginInput("");
      doToggle(kidId,habitId);
    } else {
      setHabitLoginErr(true); setHabitLoginInput("");
    }
  };

  const claimReward=(kidId,reward)=>{
    const k=kids.find(x=>x.id===kidId);
    if(k.points<reward.cost) return;
    const claim={...reward,date:new Date().toISOString()};
    updateKid(kidId,k=>({...k,points:k.points-reward.cost,claimedRewards:[...(k.claimedRewards||[]),claim],
      transactions:[...(k.transactions||[]),{id:uid(),type:"reward",label:`Claimed: ${reward.label}`,amount:-reward.cost,date:new Date().toISOString()}]
    }));
    boom(); showToast(`🎉 Claimed: ${reward.emoji} ${reward.label}!`);
  };

  const applyFine=(kidId)=>{
    if(!fineReason.trim()) return;
    updateKid(kidId,k=>({...k,
      points:Math.max(0,k.points-fineAmount),
      transactions:[...(k.transactions||[]),{id:uid(),type:"fine",label:`Fine: ${fineReason}`,amount:-fineAmount,date:new Date().toISOString()}]
    }));
    setFineModal(null); setFineReason(""); setFineAmount(10);
    showToast(`⚠️ Fine of ${fineAmount} pts applied`);
  };

  const applyBonus=(kidId)=>{
    if(!bonusReason.trim()) return;
    updateKid(kidId,k=>({...k,
      points:k.points+bonusAmount,
      transactions:[...(k.transactions||[]),{id:uid(),type:"bonus",label:`Bonus: ${bonusReason}`,amount:bonusAmount,date:new Date().toISOString()}]
    }));
    setBonusModal(null); setBonusReason(""); setBonusAmount(20);
    boom(); showToast(`🌟 Bonus of ${bonusAmount} pts added!`);
  };

  const saveMoneyRate=(kidId,rewardId)=>{
    const rate=parseFloat(moneyRate)||0;
    updateKid(kidId,k=>({...k,rewards:k.rewards.map(r=>r.id===rewardId?{...r,moneyValue:parseFloat((r.cost*rate).toFixed(2))}:r)}));
    setMoneyModal(null); showToast("💰 Money value saved!");
  };

  const saveKidMoneyRate=(kidId)=>{
    const rate=parseFloat(rateInput)||0;
    // Update global rate and auto-recalculate all rewards that don't have a custom moneyValue
    updateKid(kidId,k=>({
      ...k,
      moneyRate: rate,
      rewards: k.rewards.map(r=>({...r, moneyValue: parseFloat((r.cost * rate).toFixed(2))}))
    }));
    setRateModal(null); showToast("💵 Money rate updated for all rewards!");
  };

  // Helper: get effective money value for a reward (custom override or global rate)
  const rewardMoney=(kid,r)=> r.moneyValue>0 ? r.moneyValue : parseFloat(((kid.moneyRate||0)*r.cost).toFixed(2));

  const addKid=()=>{
    if(!nkName.trim()) return;
    const newK={id:uid(),name:nkName.trim(),avatar:nkAvatar,photo:nkPhoto,paletteIdx:nkPalette,points:0,streak:0,moneyRate:0.10,habits:[...DEFAULT_HABITS],rewards:[...DEFAULT_REWARDS],checked:{},history:{},dayChecked:{},claimedRewards:[],transactions:[]};
    setKids(ks=>[...ks,newK]); setAddKidOpen(false); setNkName(""); setNkAvatar("🦁"); setNkPhoto(null); setNkPalette(0);
    showToast(`${newK.name} added! 🎉`);
  };
  const openEditKid=k=>{setEkName(k.name);setEkAvatar(k.avatar);setEkPhoto(k.photo);setEkPalette(k.paletteIdx);setEditKidId(k.id);};
  const saveEditKid=()=>{updateKid(editKidId,k=>({...k,name:ekName.trim()||k.name,avatar:ekAvatar,photo:ekPhoto,paletteIdx:ekPalette}));setEditKidId(null);showToast("Profile updated ✅");};
  const removeKid=id=>{setKids(ks=>ks.filter(k=>k.id!==id));setView("parent");};
  const giveBonus=(id,n)=>{updateKid(id,k=>({...k,points:k.points+n,transactions:[...(k.transactions||[]),{id:uid(),type:"bonus",label:"Quick bonus",amount:n,date:new Date().toISOString()}]}));showToast(`+${n} pts! ⭐`);};
  const addHabit=()=>{
    if(!nhLabel.trim()) return;
    const h={id:uid(),label:nhLabel.trim(),emoji:nhEmoji,points:nhPoints};
    updateKid(addHabitKid,k=>({...k,habits:[...k.habits,h]}));
    setAddHabitKid(null);setNhLabel("");setNhEmoji("🌟");setNhPoints(10);
    showToast(`"${h.label}" added!`);
  };
  const removeHabit=(kidId,hid)=>updateKid(kidId,k=>({...k,habits:k.habits.filter(h=>h.id!==hid),checked:Object.fromEntries(Object.entries(k.checked).filter(([id])=>id!==hid))}));
  const reorderHabits=(kidId,newOrder)=>updateKid(kidId,k=>({...k,habits:newOrder}));
  const updateHabitPoints=(kidId,hid,pts)=>{
    const val=Math.max(1,Math.min(999,parseInt(pts)||1));
    updateKid(kidId,k=>({...k,habits:k.habits.map(h=>h.id===hid?{...h,points:val}:h)}));
  };
  const reorderRewards=(kidId,newOrder)=>updateKid(kidId,k=>({...k,rewards:newOrder}));
  const addReward=()=>{
    if(!nrLabel.trim()) return;
    const r={id:uid(),label:nrLabel.trim(),emoji:nrEmoji,cost:nrCost,moneyValue:0};
    updateKid(addRewardKid,k=>({...k,rewards:[...k.rewards,r]}));
    setAddRewardKid(null);setNrLabel("");setNrEmoji("🎁");setNrCost(50);
    showToast(`"${r.label}" added!`);
  };
  const removeReward=(kidId,rid)=>updateKid(kidId,k=>({...k,rewards:k.rewards.filter(r=>r.id!==rid)}));
  const savePin=()=>{
    if(cpOld!==parentPin){setCpErr("Current PIN is incorrect");return;}
    if(cpNew.length<4){setCpErr("New PIN must be at least 4 digits");return;}
    if(cpNew!==cpNew2){setCpErr("New PINs don't match");return;}
    setParentPin(cpNew);setChangePinOpen(false);setCpOld("");setCpNew("");setCpNew2("");setCpErr("");
    showToast("🔐 PIN changed!");
  };

  const inp={width:"100%",border:"2px solid #E8E8EE",borderRadius:12,padding:"10px 14px",fontFamily:"inherit",fontSize:15,outline:"none",marginBottom:12,transition:"border 0.2s"};
  function Btn({onClick,gradient,children,color="white",disabled,style:sx}){
    return <button onClick={onClick} disabled={disabled} className="hov" style={{background:gradient,color,border:"none",borderRadius:13,padding:"11px 20px",fontFamily:"inherit",fontWeight:800,fontSize:14,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.4:1,transition:"all 0.18s",boxShadow:"0 4px 14px rgba(0,0,0,0.1)",...sx}}>{children}</button>;
  }

  return (
    <div style={{minHeight:"100vh",background:"#EEEEFF",fontFamily:"'Nunito',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",paddingBottom:52}}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&family=Fredoka+One&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;}body{margin:0;}
        @keyframes cffall{to{transform:translateY(110vh) rotate(720deg);opacity:0;}}
        @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(18px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
        .slide-up{animation:slideUp 0.32s ease forwards;}
        .hov{transition:all 0.18s;}.hov:hover{transform:translateY(-2px);filter:brightness(1.04);}.hov:active{transform:scale(0.97);}
        input:focus{border-color:#A78BFA!important;outline:none;}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:#DDD;border-radius:8px;}
      `}</style>

      <Confetti active={confetti}/>
      {toast&&<div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#1A1A2E",color:"white",borderRadius:14,padding:"12px 24px",fontWeight:700,fontSize:14,zIndex:9997,whiteSpace:"nowrap",animation:"toastIn 0.3s ease",boxShadow:"0 8px 24px rgba(0,0,0,0.3)"}}>{toast}</div>}

      {/* Session login overlay for habit checking */}
      {habitLoginOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(10,10,25,0.65)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setHabitLoginOpen(false)}>
          <div style={{background:"white",borderRadius:22,padding:28,width:"100%",maxWidth:340,textAlign:"center",boxShadow:"0 24px 64px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:40,marginBottom:8}}>🔐</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,marginBottom:4}}>Parent Login</div>
            <div style={{color:"#aaa",fontSize:13,marginBottom:6}}>Enter PIN to unlock habit tracking</div>
            <div style={{background:"#F0FFF4",borderRadius:10,padding:"8px 14px",marginBottom:18,fontSize:12,color:"#047857",fontWeight:700}}>✅ After logging in, you can check habits freely without entering PIN again</div>
            <input autoFocus type="password" maxLength={8} placeholder="• • • •" value={habitLoginInput}
              onChange={e=>{setHabitLoginInput(e.target.value);setHabitLoginErr(false);}}
              onKeyDown={e=>e.key==="Enter"&&confirmHabitLogin()}
              style={{width:"100%",border:`2px solid ${habitLoginErr?"#FF6B6B":"#E8E8EE"}`,borderRadius:12,padding:"10px",fontFamily:"inherit",fontSize:24,textAlign:"center",letterSpacing:8,outline:"none",marginBottom:habitLoginErr?8:16}}/>
            {habitLoginErr&&<div style={{color:"#FF6B6B",fontSize:13,fontWeight:700,marginBottom:12}}>❌ Wrong PIN</div>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setHabitLoginOpen(false)} style={{flex:1,background:"#F0F0F0",color:"#888",border:"none",borderRadius:12,padding:"10px",fontFamily:"inherit",fontWeight:800,cursor:"pointer"}}>Cancel</button>
              <button onClick={confirmHabitLogin} style={{flex:1,background:"linear-gradient(135deg,#5B5BD6,#8B5CF6)",color:"white",border:"none",borderRadius:12,padding:"10px",fontFamily:"inherit",fontWeight:800,cursor:"pointer"}}>Login & Check</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ HOME ══════ */}
      {view==="home"&&(
        <div style={{width:"100%",maxWidth:520}} className="slide-up">
          <div style={{background:"linear-gradient(135deg,#5B5BD6,#8B5CF6)",padding:"40px 24px 30px",color:"white",borderRadius:"0 0 44px 44px",boxShadow:"0 12px 44px rgba(91,91,214,0.38)",marginBottom:28,textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-40,right:-40,width:130,height:130,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
            <div style={{position:"absolute",bottom:-25,left:-25,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.06)"}}/>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:38,lineHeight:1.1}}>🏠 Family Habits</div>
            <div style={{opacity:0.8,fontSize:14,marginTop:6,marginBottom:20}}>Tap a kid to track today's habits</div>
            <button className="hov" onClick={()=>setView("parent")} style={{background:"rgba(255,255,255,0.18)",color:"white",border:"none",borderRadius:14,padding:"9px 24px",fontFamily:"inherit",fontWeight:800,fontSize:14,cursor:"pointer"}}>🔧 Parent Dashboard</button>
          </div>
          <div style={{padding:"0 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {kids.map(k=>{
              const p=PALETTE[k.paletteIdx],dp=dailyPts(k),mp=maxPts(k),pct=mp?Math.round(dp/mp*100):0,done=Object.values(k.checked).filter(Boolean).length;
              return (
                <button key={k.id} className="hov" onClick={()=>{setActiveKid(k.id);setView("kid");setKidTab("habits");}}
                  style={{background:"white",border:`3px solid ${p.accent}22`,borderRadius:26,padding:"20px 14px 16px",cursor:"pointer",textAlign:"center",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{marginBottom:10}}><KidAvatar kid={k} size={68} showRing/></div>
                  <div style={{fontFamily:"'Fredoka One',cursive",fontSize:19,color:"#1A1A2E"}}>{k.name}</div>
                  <div style={{fontSize:12,color:"#aaa",marginBottom:10}}>🔥 {k.streak}-day streak</div>
                  <div style={{width:"100%",background:"#F0F0F8",borderRadius:999,height:8,overflow:"hidden",marginBottom:8}}>
                    <div style={{height:"100%",width:`${pct}%`,background:p.bg,borderRadius:999,transition:"width 0.4s"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",width:"100%",fontSize:12,color:"#bbb",marginBottom:8}}>
                    <span>✅ {done}/{k.habits.length}</span><span>⭐ {Math.floor(k.points/100)}</span>
                  </div>
                  <div style={{background:p.light,borderRadius:12,padding:"6px 18px",fontWeight:900,color:p.accent,fontSize:17}}>{k.points} pts</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════ KID VIEW ══════ */}
      {view==="kid"&&kid&&(
        <div style={{width:"100%",maxWidth:520}} className="slide-up">
          {/* Header */}
          <div style={{background:pal.bg,padding:"32px 20px 26px",color:"white",borderRadius:"0 0 40px 40px",boxShadow:`0 12px 40px ${pal.accent}55`,marginBottom:22,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-30,right:-30,width:110,height:110,borderRadius:"50%",background:"rgba(255,255,255,0.1)"}}/>
            <button onClick={()=>setView("home")} style={{position:"absolute",top:16,left:16,background:"rgba(255,255,255,0.22)",border:"none",borderRadius:10,padding:"6px 14px",color:"white",fontFamily:"inherit",fontWeight:700,cursor:"pointer",fontSize:13}}>← Back</button>
            <div style={{textAlign:"center"}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><KidAvatar kid={kid} size={86} showRing ringColor="white"/></div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:30}}>{kid.name}'s Day</div>
              <div style={{opacity:0.85,fontSize:13,marginTop:4,marginBottom:16}}>🔥 {kid.streak}-day streak!</div>
              <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:14}}>
                {[[kid.points,"Total Points"],[`⭐ ${Math.floor(kid.points/100)}`,"Stars"]].map(([val,label])=>(
                  <div key={label} style={{background:"rgba(255,255,255,0.22)",borderRadius:14,padding:"10px 20px",textAlign:"center"}}>
                    <div style={{fontFamily:"'Fredoka One',cursive",fontSize:26,lineHeight:1}}>{val}</div>
                    <div style={{fontSize:11,opacity:0.85}}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"rgba(255,255,255,0.28)",borderRadius:999,height:12,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${maxPts(kid)?Math.round(dailyPts(kid)/maxPts(kid)*100):0}%`,background:"white",borderRadius:999,transition:"width 0.5s",boxShadow:"0 0 12px rgba(255,255,255,0.7)"}}/>
              </div>
              <div style={{marginTop:6,fontSize:12,opacity:0.9}}>Today: {dailyPts(kid)} / {maxPts(kid)} pts</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:6,margin:"0 16px 18px",background:"white",borderRadius:999,padding:5,boxShadow:"0 2px 10px rgba(0,0,0,0.08)"}}>
            {[["habits","🌱 Habits"],["rewards","🎁 Rewards"],["calendar","📅 Calendar"]].map(([id,label])=>(
              <button key={id} onClick={()=>setKidTab(id)} style={{flex:1,border:"none",borderRadius:999,padding:"9px 0",fontFamily:"inherit",fontWeight:800,fontSize:12,cursor:"pointer",transition:"all 0.2s",background:kidTab===id?pal.bg:"transparent",color:kidTab===id?"white":"#999",boxShadow:kidTab===id?`0 4px 14px ${pal.accent}44`:"none"}}>
                {label}
              </button>
            ))}
          </div>

          <div style={{padding:"0 16px"}}>
            {/* HABITS tab — session login to check, fine/bonus when logged in */}
            {kidTab==="habits"&&(
              <div>
                {/* Status bar */}
                <div style={{display:"flex",alignItems:"center",gap:8,background:"white",borderRadius:14,padding:"10px 14px",marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                  <div style={{flex:1}}>
                    {parentSessionActive
                      ? <span style={{fontSize:13,color:"#047857",fontWeight:700}}>✅ Parent logged in</span>
                      : <span style={{fontSize:13,color:"#888"}}>🔐 Tap a habit to log in as parent</span>
                    }
                  </div>
                  {parentSessionActive&&<>
                    <button onClick={()=>{setFineModal(kid.id);setFineReason("");setFineAmount(10);}} style={{background:"#FFF0EE",border:"2px solid #FF6B6B44",borderRadius:9,padding:"5px 10px",fontSize:12,fontWeight:800,color:"#C94F4F",cursor:"pointer",fontFamily:"inherit"}}>⚠️ Fine</button>
                    <button onClick={()=>{setBonusModal(kid.id);setBonusReason("");setBonusAmount(20);}} style={{background:"#F0FFF4",border:"2px solid #10B98144",borderRadius:9,padding:"5px 10px",fontSize:12,fontWeight:800,color:"#047857",cursor:"pointer",fontFamily:"inherit"}}>🌟 Bonus</button>
                    <button onClick={()=>{setParentSessionActive(false);}} style={{background:"#F5F5F5",border:"none",borderRadius:9,padding:"5px 10px",fontSize:12,fontWeight:700,color:"#aaa",cursor:"pointer"}}>Log out</button>
                  </>}
                </div>

                {kid.habits.length===0&&<div style={{textAlign:"center",color:"#ccc",padding:48}}>No habits yet!</div>}
                {kid.habits.map(h=>{
                  const done=!!kid.checked[h.id];
                  return (
                    <div key={h.id} style={{display:"flex",alignItems:"center",gap:12,background:done?`${pal.accent}14`:"white",border:`2.5px solid ${done?pal.accent:"#EEE"}`,borderRadius:18,padding:"13px 14px",marginBottom:10,boxShadow:done?`0 4px 16px ${pal.accent}28`:"0 2px 8px rgba(0,0,0,0.05)",transition:"all 0.22s"}}>
                      <span style={{fontSize:24,flexShrink:0}}>{h.emoji}</span>
                      <span style={{flex:1,fontWeight:700,fontSize:15}}>{h.label}</span>
                      <span style={{background:done?`${pal.accent}22`:"#F3F0FF",color:done?pal.dark:"#7C3AED",borderRadius:999,padding:"3px 10px",fontSize:12,fontWeight:800,flexShrink:0}}>+{h.points}</span>
                      <button onClick={()=>handleHabitCheck(kid.id,h.id)} style={{background:done?pal.accent:"#F0F0F8",border:"none",borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s",color:done?"white":"#aaa",flexShrink:0}}>
                        {done?"✅":"⬜"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* REWARDS tab — money wallet + habits + rewards */}
            {kidTab==="rewards"&&(
              <div>
                {/* 💰 Wallet Card */}
                {(kid.moneyRate||0)>0 && (
                  <div style={{background:"linear-gradient(135deg,#1A1A2E,#2D2D52)",borderRadius:22,padding:"18px 20px",marginBottom:14,color:"white",boxShadow:"0 8px 28px rgba(26,26,46,0.35)",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:-20,right:-20,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
                    <div style={{fontSize:11,fontWeight:800,letterSpacing:2,opacity:0.6,marginBottom:10}}>💼 MONEY WALLET</div>
                    <div style={{display:"flex",alignItems:"flex-end",gap:16,marginBottom:dailyPts(kid)>0?14:0}}>
                      <div>
                        <div style={{fontSize:11,opacity:0.6,marginBottom:2}}>Current Balance</div>
                        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:36,lineHeight:1,color:"#FFD700"}}>
                          ${(kid.points*(kid.moneyRate||0)).toFixed(2)}
                        </div>
                      </div>
                      <div style={{opacity:0.5,fontSize:13,marginBottom:6}}>{kid.points} pts × ${(kid.moneyRate||0).toFixed(2)}/pt</div>
                    </div>
                    {dailyPts(kid)>0&&(
                      <div style={{background:"rgba(255,255,255,0.1)",borderRadius:12,padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:13,opacity:0.85}}>💚 Earned today</span>
                        <span style={{fontWeight:800,color:"#6BCB77",fontSize:15}}>+${(dailyPts(kid)*(kid.moneyRate||0)).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Habit progress */}
                <div style={{background:"white",borderRadius:18,padding:16,marginBottom:14,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                  <div style={{fontWeight:800,fontSize:14,color:"#555",marginBottom:12}}>🌱 Today's Habits Progress</div>
                  {kid.habits.map(h=>{
                    const done=!!kid.checked[h.id];
                    return (
                      <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,opacity:done?1:0.45}}>
                        <span style={{fontSize:18}}>{h.emoji}</span>
                        <span style={{flex:1,fontSize:14,fontWeight:done?700:400,color:done?"#1A1A2E":"#aaa"}}>{h.label}</span>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1}}>
                          {done&&<span style={{fontSize:12,color:pal.accent,fontWeight:700}}>+{h.points}pts</span>}
                          {done&&(kid.moneyRate||0)>0&&<span style={{fontSize:11,color:"#047857",fontWeight:700}}>+${(h.points*(kid.moneyRate||0)).toFixed(2)}</span>}
                        </div>
                        <span style={{fontSize:16}}>{done?"✅":"⬜"}</span>
                      </div>
                    );
                  })}
                  <div style={{marginTop:10,background:"#F0F0F8",borderRadius:999,height:10,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${maxPts(kid)?Math.round(dailyPts(kid)/maxPts(kid)*100):0}%`,background:pal.bg,borderRadius:999,transition:"width 0.5s"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:12,color:"#aaa"}}>
                    <span>{Object.values(kid.checked).filter(Boolean).length}/{kid.habits.length} done</span>
                    <span>{dailyPts(kid)}/{maxPts(kid)} pts{(kid.moneyRate||0)>0?` · $${(dailyPts(kid)*(kid.moneyRate||0)).toFixed(2)}/$${(maxPts(kid)*(kid.moneyRate||0)).toFixed(2)}`:""}</span>
                  </div>
                </div>

                {/* Next reward progress */}
                {(()=>{
                  const next=[...kid.rewards].filter(r=>r.cost>kid.points).sort((a,b)=>a.cost-b.cost)[0];
                  const affordable=kid.rewards.filter(r=>r.cost<=kid.points).length;
                  const nextMoney=(kid.moneyRate||0)>0&&next?rewardMoney(kid,next):null;
                  return (
                    <div style={{background:affordable>0?"#F0FFF4":"white",border:`2px solid ${affordable>0?"#10B981":"#EEE"}`,borderRadius:18,padding:"14px 16px",marginBottom:14}}>
                      <div style={{fontWeight:800,fontSize:14,color:affordable>0?"#047857":"#555",marginBottom:6}}>
                        {affordable>0?`🎉 ${affordable} reward${affordable>1?"s":""} unlocked!`:next?`Next: ${next.emoji} ${next.label}`:"Keep earning!"}
                      </div>
                      {next&&<>
                        <div style={{background:"#F0F0F8",borderRadius:999,height:10,overflow:"hidden",marginBottom:4}}>
                          <div style={{height:"100%",width:`${Math.min(100,Math.round(kid.points/next.cost*100))}%`,background:pal.bg,borderRadius:999,transition:"width 0.5s"}}/>
                        </div>
                        <div style={{fontSize:12,color:"#aaa",display:"flex",gap:8,flexWrap:"wrap"}}>
                          <span>{kid.points} / {next.cost} pts needed</span>
                          {nextMoney>0&&<span>· worth ${nextMoney.toFixed(2)}</span>}
                        </div>
                      </>}
                    </div>
                  );
                })()}

                {/* Rewards list */}
                {kid.rewards.map(r=>{
                  const can=kid.points>=r.cost;
                  const money=rewardMoney(kid,r);
                  return (
                    <div key={r.id} style={{background:"white",border:`2.5px solid ${can?"#FFD93D":"#EEE"}`,borderRadius:18,padding:"14px 16px",marginBottom:10,boxShadow:can?"0 4px 18px #FFD93D44":"0 2px 8px rgba(0,0,0,0.05)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <span style={{fontSize:28}}>{r.emoji}</span>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:15}}>{r.label}</div>
                          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginTop:4}}>
                            <span style={{fontSize:13,color:can?"#F59E0B":"#ccc",fontWeight:700}}>⭐ {r.cost} pts</span>
                            {money>0&&<span style={{background:"#F0FFF4",color:"#047857",borderRadius:8,padding:"3px 10px",fontSize:13,fontWeight:800}}>💵 ${money.toFixed(2)}</span>}
                          </div>
                        </div>
                        <Btn onClick={()=>claimReward(kid.id,r)} gradient={can?"linear-gradient(120deg,#FFD93D,#FF922B)":"#EEE"} color={can?"white":"#bbb"} disabled={!can} style={{padding:"9px 14px",fontSize:13}}>
                          {can?"Claim! 🎉":"🔒"}
                        </Btn>
                      </div>
                    </div>
                  );
                })}

                {/* Transaction log */}
                {(kid.transactions||[]).length>0&&(
                  <div style={{background:"white",borderRadius:18,padding:16,marginTop:8,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                    <div style={{fontWeight:800,fontSize:14,color:"#555",marginBottom:10}}>📋 Point History</div>
                    {[...(kid.transactions||[])].reverse().slice(0,8).map(t=>(
                      <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,paddingBottom:8,borderBottom:"1px solid #F5F5F5"}}>
                        <span style={{fontSize:16}}>{t.type==="fine"?"⚠️":t.type==="bonus"?"🌟":t.type==="reward"?"🎁":"✅"}</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:"#333"}}>{t.label}</div>
                          <div style={{fontSize:11,color:"#bbb"}}>{new Date(t.date).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontWeight:800,fontSize:13,color:t.amount<0?"#FF6B6B":"#10B981"}}>{t.amount>0?"+":""}{t.amount} pts</div>
                          {(kid.moneyRate||0)>0&&<div style={{fontSize:11,color:t.amount<0?"#FF6B6B":"#10B981",opacity:0.7}}>{t.amount>0?"+":"-"}${Math.abs(t.amount*(kid.moneyRate||0)).toFixed(2)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CALENDAR tab */}
            {kidTab==="calendar"&&<RewardCalendar kid={kid} pal={pal} onUpdateDay={(dateStr, changes)=>{
              updateKid(kid.id, k=>{
                const newHistory = changes.status ? {...(k.history||{}), [dateStr]: changes.status} : k.history||{};
                const newDayChecked = changes.dayChecked ? {...(k.dayChecked||{}), [dateStr]: changes.dayChecked} : k.dayChecked||{};
                return {...k, history: newHistory, dayChecked: newDayChecked};
              });
            }}/>}
          </div>
        </div>
      )}

      {/* ══════ PARENT DASHBOARD ══════ */}
      {view==="parent"&&(
        <div style={{width:"100%",maxWidth:520}} className="slide-up">
          <div style={{background:"linear-gradient(135deg,#1A1A2E,#2D2D52)",padding:"34px 20px 28px",color:"white",borderRadius:"0 0 40px 40px",boxShadow:"0 12px 44px rgba(26,26,46,0.45)",marginBottom:24,textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
            <button onClick={()=>{setView("home");setParentUnlocked(false);setPinInput("");}} style={{position:"absolute",top:16,left:16,background:"rgba(255,255,255,0.12)",border:"none",borderRadius:10,padding:"6px 14px",color:"white",fontFamily:"inherit",fontWeight:700,cursor:"pointer",fontSize:13}}>← Home</button>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:28}}>🔧 Parent Dashboard</div>
            <div style={{opacity:0.6,fontSize:13,marginTop:4}}>Manage kids, habits & rewards</div>
          </div>

          <div style={{padding:"0 16px"}}>
            {!parentUnlocked?(
              <div style={{background:"white",borderRadius:24,padding:36,textAlign:"center",boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
                <div style={{fontSize:56,marginBottom:12}}>🔐</div>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:26,marginBottom:6}}>Parent Access</div>
                <div style={{color:"#aaa",fontSize:14,marginBottom:22}}>Enter your PIN to continue</div>
                <input type="password" maxLength={8} placeholder="• • • •" value={pinInput}
                  onChange={e=>{setPinInput(e.target.value);setPinError(false);}}
                  onKeyDown={e=>{if(e.key==="Enter"){if(pinInput===parentPin){setParentUnlocked(true);setPinInput("");}else setPinError(true);}}}
                  style={{...inp,textAlign:"center",fontSize:28,letterSpacing:10,border:pinError?"2px solid #FF6B6B":"2px solid #E8E8EE"}}/>
                {pinError&&<div style={{color:"#FF6B6B",fontSize:13,fontWeight:800,marginBottom:10}}>❌ Wrong PIN</div>}
                <Btn onClick={()=>{if(pinInput===parentPin){setParentUnlocked(true);setPinInput("");}else setPinError(true);}} gradient="linear-gradient(135deg,#5B5BD6,#8B5CF6)" style={{width:"100%",fontSize:16}}>Unlock Dashboard</Btn>
              </div>
            ):(
              <>
                {/* Stats */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
                  {[["👨‍👩‍👧‍👦",kids.length,"Kids"],["⭐",kids.reduce((s,k)=>s+Math.floor(k.points/100),0),"Stars"],["🔥",kids.length?Math.max(...kids.map(k=>k.streak)):0,"Best Streak"]].map(([ic,val,label])=>(
                    <div key={label} style={{background:"white",borderRadius:18,padding:"14px 0",textAlign:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.07)"}}>
                      <div style={{fontSize:24}}>{ic}</div>
                      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:"#5B5BD6"}}>{val}</div>
                      <div style={{fontSize:11,color:"#bbb"}}>{label}</div>
                    </div>
                  ))}
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
                  <Btn onClick={()=>{setAddKidOpen(true);setNkName("");setNkAvatar("🦁");setNkPhoto(null);setNkPalette(0);}} gradient="linear-gradient(120deg,#5B5BD6,#8B5CF6)" style={{fontSize:14,padding:"13px 0"}}>➕ Add Child</Btn>
                  <Btn onClick={()=>{setChangePinOpen(true);setCpOld("");setCpNew("");setCpNew2("");setCpErr("");}} gradient="linear-gradient(120deg,#1A1A2E,#3B3B5C)" style={{fontSize:14,padding:"13px 0"}}>🔐 Change PIN</Btn>
                </div>

                {/* Data notice + reset */}
                <div style={{background:"#F0FFF4",borderRadius:14,padding:"10px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:18}}>💾</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#047857"}}>Auto-saved to this device</div>
                    <div style={{fontSize:12,color:"#888"}}>All data saves automatically in your browser</div>
                  </div>
                  <button onClick={()=>{
                    if(window.confirm("Reset ALL data? This cannot be undone.")){
                      localStorage.removeItem("fh_kids");
                      localStorage.removeItem("fh_pin");
                      setKids(SAMPLE_KIDS);
                      setParentPin("1234");
                      showToast("Data reset to defaults");
                    }
                  }} style={{background:"#FFF0EE",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",color:"#FF6B6B",fontWeight:700,fontSize:12,whiteSpace:"nowrap"}}>🗑 Reset</button>
                </div>

                {kids.map(k=>{
                  const p=PALETTE[k.paletteIdx];
                  return (
                    <div key={k.id} style={{background:"white",borderRadius:24,boxShadow:"0 4px 18px rgba(0,0,0,0.07)",padding:18,marginBottom:16}}>
                      {/* Header */}
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                        <KidAvatar kid={k} size={54} showRing/>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20}}>{k.name}</div>
                          <div style={{fontSize:12,color:"#bbb"}}>{k.points} pts · ⭐{Math.floor(k.points/100)} · 🔥{k.streak}d · {k.habits.length} habits</div>
                        </div>
                        <button className="hov" onClick={()=>openEditKid(k)} style={{background:p.light,border:"none",borderRadius:10,padding:"7px 12px",cursor:"pointer",color:p.dark,fontWeight:800,fontSize:12}}>✏️</button>
                        <button className="hov" onClick={()=>removeKid(k.id)} style={{background:"#FFF0EE",border:"none",borderRadius:10,padding:"7px 10px",cursor:"pointer",color:"#FF6B6B",fontWeight:800,fontSize:13}}>🗑</button>
                      </div>

                      {/* Money rate row */}
                      <div style={{display:"flex",alignItems:"center",gap:10,background:"#F8FFF4",borderRadius:12,padding:"10px 14px",marginBottom:14,border:"1.5px solid #D1FAE5"}}>
                        <span style={{fontSize:20}}>💵</span>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:13,color:"#1A1A2E"}}>Money Rate</div>
                          <div style={{fontSize:12,color:"#888"}}>
                            {(k.moneyRate||0)>0
                              ? <span>${(k.moneyRate||0).toFixed(2)} per point · Balance: <strong style={{color:"#047857"}}>${(k.points*(k.moneyRate||0)).toFixed(2)}</strong></span>
                              : <span style={{color:"#ccc"}}>Not set — tap to configure</span>
                            }
                          </div>
                        </div>
                        <button className="hov" onClick={()=>{setRateModal(k.id);setRateInput(String((k.moneyRate||0.10).toFixed(2)));}} style={{background:"linear-gradient(120deg,#10B981,#059669)",border:"none",borderRadius:10,padding:"7px 14px",cursor:"pointer",color:"white",fontWeight:800,fontSize:12,whiteSpace:"nowrap"}}>
                          {(k.moneyRate||0)>0?"✏️ Edit Rate":"Set Rate"}
                        </button>
                      </div>

                      {/* Habits — draggable list with inline Fine/Bonus/Add */}
                      <div style={{marginBottom:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                          <div style={{fontWeight:800,fontSize:13,color:"#666",marginRight:4}}>🌱 Habits ({k.habits.length})</div>
                          <div style={{flex:1}}/>
                          <button className="hov" onClick={()=>{setFineModal(k.id);setFineReason("");setFineAmount(10);}} style={{background:"#FFF0EE",border:"2px solid #FF6B6B33",borderRadius:9,padding:"5px 11px",fontFamily:"inherit",fontWeight:800,fontSize:12,cursor:"pointer",color:"#C94F4F",whiteSpace:"nowrap"}}>⚠️ Fine</button>
                          <button className="hov" onClick={()=>{setBonusModal(k.id);setBonusReason("");setBonusAmount(20);}} style={{background:"#F0FFF4",border:"2px solid #10B98133",borderRadius:9,padding:"5px 11px",fontFamily:"inherit",fontWeight:800,fontSize:12,cursor:"pointer",color:"#047857",whiteSpace:"nowrap"}}>🌟 Bonus</button>
                          <button className="hov" onClick={()=>{setAddHabitKid(k.id);setNhLabel("");setNhEmoji("🌟");setNhPoints(10);}} style={{background:"#F3F0FF",border:"none",borderRadius:9,padding:"5px 11px",fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer",color:"#5B5BD6",whiteSpace:"nowrap"}}>+ Add</button>
                        </div>
                        {k.habits.length===0 && <div style={{textAlign:"center",color:"#ccc",fontSize:13,padding:"10px 0"}}>No habits yet — add one above</div>}
                        <div style={{background:"#F8F7FF",borderRadius:10,padding:"6px 10px",marginBottom:6,fontSize:11,color:"#9B8EC4",fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
                          <span style={{display:"flex",flexDirection:"column",gap:2}}>{[0,1,2].map(r=><span key={r} style={{display:"flex",gap:2}}>{[0,1].map(c=><span key={c} style={{width:3,height:3,borderRadius:"50%",background:"#9B8EC4",display:"inline-block"}}/>)}</span>)}</span>
                          <span>Hold the dots to drag and reorder</span>
                        </div>
                        <SortableList
                          items={k.habits}
                          onReorder={newOrder=>reorderHabits(k.id,newOrder)}
                          dragEnabled={true}
                          renderItem={(h, idx, isGhost, onHandleDown)=>(
                            <div style={{display:"flex",alignItems:"center",gap:8,background:"white",border:"2px solid #EEEEF8",borderRadius:14,padding:"10px 10px",marginBottom:6,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
                              <DragHandle onPointerDown={onHandleDown||((e)=>e.preventDefault())}/>
                              <span style={{fontSize:20,flexShrink:0}}>{h.emoji}</span>
                              <span style={{flex:1,fontWeight:700,fontSize:14,color:"#333"}}>{h.label}</span>
                              {isGhost
                                ? <span style={{background:"#EEF",color:"#5B5BD6",borderRadius:8,padding:"3px 8px",fontSize:12,fontWeight:800,flexShrink:0}}>{h.points}pts</span>
                                : <div style={{display:"flex",alignItems:"center",gap:4,background:"#EEF",borderRadius:8,padding:"2px 4px 2px 8px",flexShrink:0}}>
                                    <input
                                      type="number"
                                      min={1} max={999}
                                      value={h.points}
                                      onChange={e=>updateHabitPoints(k.id,h.id,e.target.value)}
                                      onClick={e=>e.stopPropagation()}
                                      onPointerDown={e=>e.stopPropagation()}
                                      style={{width:40,border:"none",background:"transparent",fontFamily:"inherit",fontWeight:800,fontSize:13,color:"#5B5BD6",outline:"none",textAlign:"center",padding:0}}
                                    />
                                    <span style={{fontSize:11,color:"#5B5BD6",fontWeight:700,paddingRight:4}}>pts</span>
                                  </div>
                              }
                              {!isGhost&&<button onClick={()=>removeHabit(k.id,h.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#FF6B6B",padding:0,fontSize:18,fontWeight:900,lineHeight:1,flexShrink:0}}>×</button>}
                            </div>
                          )}
                        />
                      </div>

                      {/* Rewards — sortable */}
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <div style={{fontWeight:800,fontSize:13,color:"#666"}}>🎁 Rewards ({k.rewards.length})</div>
                          <button className="hov" onClick={()=>{setAddRewardKid(k.id);setNrLabel("");setNrEmoji("🎁");setNrCost(50);}} style={{background:"#FFFBEB",border:"none",borderRadius:8,padding:"5px 12px",fontFamily:"inherit",fontWeight:700,fontSize:12,cursor:"pointer",color:"#D97706"}}>+ Add</button>
                        </div>
                        {k.rewards.length===0 && <div style={{textAlign:"center",color:"#ccc",fontSize:13,padding:"8px 0"}}>No rewards yet</div>}
                        {k.rewards.length>1 && (
                          <div style={{background:"#FFFBEB",borderRadius:10,padding:"6px 10px",marginBottom:6,fontSize:11,color:"#D97706",fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
                            <span style={{display:"flex",flexDirection:"column",gap:2}}>{[0,1,2].map(r=><span key={r} style={{display:"flex",gap:2}}>{[0,1].map(c=><span key={c} style={{width:3,height:3,borderRadius:"50%",background:"#D97706",display:"inline-block"}}/>)}</span>)}</span>
                            <span>Hold the dots to drag and reorder</span>
                          </div>
                        )}
                        <SortableList
                          items={k.rewards}
                          onReorder={newOrder=>reorderRewards(k.id,newOrder)}
                          dragEnabled={true}
                          renderItem={(r, idx, isGhost, onHandleDown)=>(
                            <div style={{background:"#FAFAFA",borderRadius:12,padding:"8px 10px",marginBottom:6,display:"flex",alignItems:"center",gap:6,border:"1.5px solid #F0F0F0"}}>
                              <DragHandle onPointerDown={onHandleDown||((e)=>e.preventDefault())}/>
                              <span style={{fontSize:18,flexShrink:0}}>{r.emoji}</span>
                              <span style={{flex:1,fontWeight:700,fontSize:13}}>{r.label}</span>
                              <span style={{color:"#D97706",fontWeight:800,fontSize:12,flexShrink:0}}>{r.cost}p</span>
                              {r.moneyValue>0&&<span style={{background:"#F0FFF4",color:"#047857",borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:800,flexShrink:0}}>💵${r.moneyValue.toFixed(2)}</span>}
                              {!isGhost&&<button className="hov" onClick={()=>{setMoneyModal({kidId:k.id,rewardId:r.id});setMoneyRate("0.10");}} style={{background:"#F0FFF4",border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",color:"#047857",fontWeight:700,fontSize:11,flexShrink:0}}>💰</button>}
                              {!isGhost&&<button onClick={()=>removeReward(k.id,r.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#FF6B6B",padding:0,fontSize:16,fontWeight:900,lineHeight:1,flexShrink:0}}>×</button>}
                            </div>
                          )}
                        />
                      </div>

                      {/* Recent transactions */}
                      {(k.transactions||[]).filter(t=>t.type==="fine").length>0&&(
                        <div style={{marginTop:12,borderTop:"1px solid #F5F5F5",paddingTop:10}}>
                          <div style={{fontSize:11,fontWeight:800,color:"#ccc",letterSpacing:1,marginBottom:6}}>RECENT FINES</div>
                          {[...(k.transactions||[])].filter(t=>t.type==="fine").reverse().slice(0,3).map(t=>(
                            <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                              <span style={{fontSize:14}}>⚠️</span>
                              <span style={{flex:1,fontSize:12,color:"#666"}}>{t.label.replace("Fine: ","")}</span>
                              <span style={{fontSize:12,fontWeight:800,color:"#FF6B6B"}}>{t.amount}pts</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* ════ PIN CHANGE ════ */}
      {changePinOpen&&(
        <Modal onClose={()=>setChangePinOpen(false)}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,marginBottom:18}}>🔐 Change PIN</div>
          {[["Current PIN",cpOld,setCpOld],["New PIN",cpNew,setCpNew],["Confirm New PIN",cpNew2,setCpNew2]].map(([label,val,set])=>(
            <div key={label}><label style={{fontSize:13,fontWeight:700,color:"#888",display:"block",marginBottom:4}}>{label}</label>
            <input type="password" maxLength={8} placeholder="••••" value={val} onChange={e=>{set(e.target.value);setCpErr("");}} style={inp}/></div>
          ))}
          {cpErr&&<div style={{color:"#FF6B6B",fontSize:13,fontWeight:700,marginBottom:10}}>❌ {cpErr}</div>}
          <div style={{display:"flex",gap:10}}><Btn onClick={()=>setChangePinOpen(false)} gradient="#F0F0F0" color="#888" style={{flex:1}}>Cancel</Btn><Btn onClick={savePin} gradient="linear-gradient(120deg,#1A1A2E,#3B3B5C)" style={{flex:1}}>Save 🔐</Btn></div>
        </Modal>
      )}

      {/* ════ FINE MODAL ════ */}
      {fineModal&&(
        <Modal onClose={()=>setFineModal(null)}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,marginBottom:6}}>⚠️ Add Fine</div>
          <div style={{color:"#aaa",fontSize:13,marginBottom:18}}>Deduct points with a reason</div>
          <label style={{fontSize:13,fontWeight:700,color:"#888",display:"block",marginBottom:4}}>Reason *</label>
          <input style={inp} placeholder="e.g. Didn't listen, broke a rule..." value={fineReason} onChange={e=>setFineReason(e.target.value)}/>
          <label style={{fontSize:13,fontWeight:700,color:"#888",display:"block",marginBottom:6}}>Points to deduct: <span style={{color:"#FF6B6B",fontSize:16}}>{fineAmount}</span></label>
          <input type="range" min={5} max={100} step={5} value={fineAmount} onChange={e=>setFineAmount(+e.target.value)} style={{width:"100%",marginBottom:8,accentColor:"#FF6B6B"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#ccc",marginBottom:20}}><span>5 pts</span><span>100 pts</span></div>
          <div style={{background:"#FFF0EE",borderRadius:12,padding:"10px 14px",marginBottom:16,fontSize:14,color:"#C94F4F",fontWeight:700}}>
            Will deduct <strong>{fineAmount} pts</strong>{fineReason?` for "${fineReason}"`:""}
          </div>
          <div style={{display:"flex",gap:10}}><Btn onClick={()=>setFineModal(null)} gradient="#F0F0F0" color="#888" style={{flex:1}}>Cancel</Btn><Btn onClick={()=>applyFine(fineModal)} gradient="linear-gradient(120deg,#FF6B6B,#FF8E53)" style={{flex:1}}>Apply Fine ⚠️</Btn></div>
        </Modal>
      )}

      {/* ════ BONUS MODAL ════ */}
      {bonusModal&&(
        <Modal onClose={()=>setBonusModal(null)}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,marginBottom:6}}>🌟 Extra Reward</div>
          <div style={{color:"#aaa",fontSize:13,marginBottom:18}}>Add bonus points with a reason</div>
          <label style={{fontSize:13,fontWeight:700,color:"#888",display:"block",marginBottom:4}}>Reason *</label>
          <input style={inp} placeholder="e.g. Helped a friend, extra kind..." value={bonusReason} onChange={e=>setBonusReason(e.target.value)}/>
          <label style={{fontSize:13,fontWeight:700,color:"#888",display:"block",marginBottom:6}}>Points to add: <span style={{color:"#10B981",fontSize:16}}>{bonusAmount}</span></label>
          <input type="range" min={5} max={100} step={5} value={bonusAmount} onChange={e=>setBonusAmount(+e.target.value)} style={{width:"100%",marginBottom:8,accentColor:"#10B981"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#ccc",marginBottom:20}}><span>5 pts</span><span>100 pts</span></div>
          <div style={{background:"#F0FFF4",borderRadius:12,padding:"10px 14px",marginBottom:16,fontSize:14,color:"#047857",fontWeight:700}}>
            Will add <strong>{bonusAmount} pts</strong>{bonusReason?` for "${bonusReason}"`:""}
          </div>
          <div style={{display:"flex",gap:10}}><Btn onClick={()=>setBonusModal(null)} gradient="#F0F0F0" color="#888" style={{flex:1}}>Cancel</Btn><Btn onClick={()=>applyBonus(bonusModal)} gradient="linear-gradient(120deg,#10B981,#059669)" style={{flex:1}}>Add Reward 🌟</Btn></div>
        </Modal>
      )}

      {/* ════ MONEY MODAL — per-reward override ════ */}
      {moneyModal&&(()=>{
        const k=kids.find(x=>x.id===moneyModal.kidId);
        const r=k?.rewards.find(x=>x.id===moneyModal.rewardId);
        if(!r) return null;
        const rate=parseFloat(moneyRate)||0;
        const total=(r.cost*rate).toFixed(2);
        return (
          <Modal onClose={()=>setMoneyModal(null)}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,marginBottom:6}}>💰 Override Reward Value</div>
            <div style={{color:"#aaa",fontSize:13,marginBottom:18}}>Set a custom money value for this specific reward</div>
            <div style={{display:"flex",alignItems:"center",gap:12,background:"#FAFAFA",borderRadius:14,padding:"12px 16px",marginBottom:18}}>
              <span style={{fontSize:28}}>{r.emoji}</span>
              <div><div style={{fontWeight:700}}>{r.label}</div><div style={{fontSize:13,color:"#aaa"}}>{r.cost} pts</div></div>
            </div>
            <label style={{fontSize:13,fontWeight:700,color:"#888",display:"block",marginBottom:4}}>Dollar rate per point ($)</label>
            <input style={inp} type="number" step="0.01" min="0" placeholder="0.10" value={moneyRate} onChange={e=>setMoneyRate(e.target.value)}/>
            <div style={{background:"#F0FFF4",borderRadius:12,padding:"12px 16px",marginBottom:20,textAlign:"center"}}>
              <div style={{fontSize:13,color:"#888",marginBottom:4}}>{r.cost} pts × ${rate.toFixed(3)}/pt</div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:28,color:"#047857"}}>💵 ${total}</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn onClick={()=>setMoneyModal(null)} gradient="#F0F0F0" color="#888" style={{flex:1}}>Cancel</Btn>
              <Btn onClick={()=>saveMoneyRate(moneyModal.kidId,moneyModal.rewardId)} gradient="linear-gradient(120deg,#10B981,#059669)" style={{flex:1}}>Save 💰</Btn>
            </div>
          </Modal>
        );
      })()}

      {/* ════ RATE MODAL — global pts→money rate for a kid ════ */}
      {rateModal&&(()=>{
        const k=kids.find(x=>x.id===rateModal);
        if(!k) return null;
        const rate=parseFloat(rateInput)||0;
        return (
          <Modal onClose={()=>setRateModal(null)}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,marginBottom:6}}>💵 Set Money Rate</div>
            <div style={{color:"#aaa",fontSize:13,marginBottom:18}}>How much is each point worth in real money for <strong>{k.name}</strong>?</div>

            {/* Kid preview */}
            <div style={{display:"flex",alignItems:"center",gap:12,background:"#FAFAFA",borderRadius:14,padding:"12px 16px",marginBottom:18}}>
              <KidAvatar kid={k} size={44}/>
              <div>
                <div style={{fontWeight:700,fontSize:15}}>{k.name}</div>
                <div style={{fontSize:13,color:"#888"}}>{k.points} pts total</div>
              </div>
            </div>

            <label style={{fontSize:13,fontWeight:700,color:"#888",display:"block",marginBottom:4}}>$ per point</label>
            <input style={inp} type="number" step="0.01" min="0" placeholder="e.g. 0.10" value={rateInput} onChange={e=>setRateInput(e.target.value)} autoFocus/>

            {/* Preset quick picks */}
            <div style={{fontSize:12,fontWeight:700,color:"#aaa",marginBottom:8}}>Quick picks:</div>
            <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
              {[["$0.05","0.05"],["$0.10","0.10"],["$0.25","0.25"],["$0.50","0.50"],["$1.00","1.00"]].map(([label,val])=>(
                <button key={val} onClick={()=>setRateInput(val)} style={{background:rateInput===val?"#10B981":"#F0F0F0",color:rateInput===val?"white":"#555",border:"none",borderRadius:8,padding:"6px 14px",fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.15s"}}>{label}</button>
              ))}
            </div>

            {/* Live preview for all rewards */}
            {rate>0 && (
              <div style={{background:"linear-gradient(135deg,#1A1A2E,#2D2D52)",borderRadius:16,padding:"16px",marginBottom:20,color:"white"}}>
                <div style={{fontSize:11,fontWeight:800,opacity:0.6,letterSpacing:1,marginBottom:10}}>PREVIEW</div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{fontSize:13,opacity:0.8}}>{k.name}'s balance</span>
                  <span style={{fontWeight:800,color:"#FFD700",fontSize:16}}>${(k.points*rate).toFixed(2)}</span>
                </div>
                <div style={{borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:10}}>
                  {k.rewards.slice(0,4).map(r=>(
                    <div key={r.id} style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13}}>
                      <span style={{opacity:0.8}}>{r.emoji} {r.label}</span>
                      <span style={{fontWeight:700,color:"#6BCB77"}}>${(r.cost*rate).toFixed(2)}</span>
                    </div>
                  ))}
                  {k.rewards.length>4&&<div style={{fontSize:11,opacity:0.5,marginTop:4}}>+{k.rewards.length-4} more rewards</div>}
                </div>
              </div>
            )}

            <div style={{background:"#FFF3CD",borderRadius:12,padding:"10px 14px",marginBottom:18,fontSize:13,color:"#856404"}}>
              ℹ️ This updates all rewards for {k.name} automatically. Use the 💰 button on individual rewards to override specific ones.
            </div>

            <div style={{display:"flex",gap:10}}>
              <Btn onClick={()=>setRateModal(null)} gradient="#F0F0F0" color="#888" style={{flex:1}}>Cancel</Btn>
              <Btn onClick={()=>saveKidMoneyRate(rateModal)} gradient="linear-gradient(120deg,#10B981,#059669)" style={{flex:1}}>Save Rate 💵</Btn>
            </div>
          </Modal>
        );
      })()}

      {/* ════ ADD KID ════ */}
      {addKidOpen&&(
        <Modal onClose={()=>setAddKidOpen(false)}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,marginBottom:20}}>➕ Add New Child</div>
          <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:18}}>
            <div><PhotoUploader currentPhoto={nkPhoto} onPhoto={setNkPhoto} size={82} accent={PALETTE[nkPalette].accent}/>{nkPhoto&&<button onClick={()=>setNkPhoto(null)} style={{background:"none",border:"none",color:"#FF6B6B",fontSize:11,fontWeight:700,cursor:"pointer",marginTop:4,padding:0}}>Remove</button>}</div>
            <div style={{flex:1}}><label style={{fontSize:13,fontWeight:700,color:"#888",display:"block",marginBottom:4}}>Child's Name *</label><input style={inp} placeholder="e.g. Mia" value={nkName} onChange={e=>setNkName(e.target.value)}/></div>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:"#888",marginBottom:8}}>Avatar</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16,maxHeight:100,overflowY:"auto"}}>
            {AVATARS.map(a=><button key={a} onClick={()=>setNkAvatar(a)} style={{fontSize:22,background:nkAvatar===a?"#F3F0FF":"#FAFAFA",border:`2px solid ${nkAvatar===a?PALETTE[nkPalette].accent:"#EEE"}`,borderRadius:10,padding:"5px 7px",cursor:"pointer"}}>{a}</button>)}
          </div>
          <div style={{fontSize:13,fontWeight:700,color:"#888",marginBottom:8}}>Theme Color</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:22}}>
            {PALETTE.map((p,i)=><button key={i} onClick={()=>setNkPalette(i)} style={{width:34,height:34,borderRadius:"50%",background:p.bg,border:nkPalette===i?"3px solid #1A1A2E":"3px solid transparent",cursor:"pointer",outline:"none"}}/>)}
          </div>
          <div style={{display:"flex",gap:10}}><Btn onClick={()=>setAddKidOpen(false)} gradient="#F0F0F0" color="#888" style={{flex:1}}>Cancel</Btn><Btn onClick={addKid} gradient="linear-gradient(120deg,#5B5BD6,#8B5CF6)" style={{flex:1}}>Add Child 🎉</Btn></div>
        </Modal>
      )}

      {/* ════ EDIT KID ════ */}
      {editKidId&&(()=>{
        const ek=kids.find(k=>k.id===editKidId); if(!ek) return null;
        return (
          <Modal onClose={()=>setEditKidId(null)}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,marginBottom:20}}>✏️ Edit {ek.name}</div>
            <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:18}}>
              <div><PhotoUploader currentPhoto={ekPhoto} onPhoto={setEkPhoto} size={82} accent={PALETTE[ekPalette].accent}/>{ekPhoto&&<button onClick={()=>setEkPhoto(null)} style={{background:"none",border:"none",color:"#FF6B6B",fontSize:11,fontWeight:700,cursor:"pointer",marginTop:4,padding:0}}>Remove</button>}</div>
              <div style={{flex:1}}><label style={{fontSize:13,fontWeight:700,color:"#888",display:"block",marginBottom:4}}>Name</label><input style={inp} value={ekName} onChange={e=>setEkName(e.target.value)}/></div>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:"#888",marginBottom:8}}>Avatar</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16,maxHeight:100,overflowY:"auto"}}>
              {AVATARS.map(a=><button key={a} onClick={()=>setEkAvatar(a)} style={{fontSize:22,background:ekAvatar===a?"#F3F0FF":"#FAFAFA",border:`2px solid ${ekAvatar===a?PALETTE[ekPalette].accent:"#EEE"}`,borderRadius:10,padding:"5px 7px",cursor:"pointer"}}>{a}</button>)}
            </div>
            <div style={{fontSize:13,fontWeight:700,color:"#888",marginBottom:8}}>Theme Color</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:22}}>
              {PALETTE.map((p,i)=><button key={i} onClick={()=>setEkPalette(i)} style={{width:34,height:34,borderRadius:"50%",background:p.bg,border:ekPalette===i?"3px solid #1A1A2E":"3px solid transparent",cursor:"pointer",outline:"none"}}/>)}
            </div>
            <div style={{display:"flex",gap:10}}><Btn onClick={()=>setEditKidId(null)} gradient="#F0F0F0" color="#888" style={{flex:1}}>Cancel</Btn><Btn onClick={saveEditKid} gradient="linear-gradient(120deg,#5B5BD6,#8B5CF6)" style={{flex:1}}>Save ✅</Btn></div>
          </Modal>
        );
      })()}

      {/* ════ ADD HABIT ════ */}
      {addHabitKid&&(
        <Modal onClose={()=>setAddHabitKid(null)} wide>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,marginBottom:18}}>🌱 Add Habit</div>
          <input style={inp} placeholder="Habit name (e.g. Drink water)" value={nhLabel} onChange={e=>setNhLabel(e.target.value)}/>
          <div style={{fontSize:13,fontWeight:700,color:"#888",marginBottom:8}}>Choose Emoji</div>
          <EmojiPicker groups={HABIT_EMOJI_GROUPS} value={nhEmoji} onChange={setNhEmoji} accent="#5B5BD6"/>
          <div style={{fontSize:13,fontWeight:700,color:"#888",margin:"14px 0 6px"}}>Points: <span style={{color:"#5B5BD6",fontSize:17,fontWeight:900}}>{nhPoints}</span></div>
          <input type="range" min={5} max={50} step={5} value={nhPoints} onChange={e=>setNhPoints(+e.target.value)} style={{width:"100%",marginBottom:22,accentColor:"#5B5BD6"}}/>
          <div style={{display:"flex",gap:10}}><Btn onClick={()=>setAddHabitKid(null)} gradient="#F0F0F0" color="#888" style={{flex:1}}>Cancel</Btn><Btn onClick={addHabit} gradient="linear-gradient(120deg,#10B981,#059669)" style={{flex:1}}>Add Habit ✅</Btn></div>
        </Modal>
      )}

      {/* ════ ADD REWARD ════ */}
      {addRewardKid&&(
        <Modal onClose={()=>setAddRewardKid(null)} wide>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,marginBottom:18}}>🎁 Add Reward</div>
          <input style={inp} placeholder="Reward name (e.g. Movie night)" value={nrLabel} onChange={e=>setNrLabel(e.target.value)}/>
          <div style={{fontSize:13,fontWeight:700,color:"#888",marginBottom:8}}>Choose Emoji</div>
          <EmojiPicker groups={REWARD_EMOJI_GROUPS} value={nrEmoji} onChange={setNrEmoji} accent="#F59E0B"/>
          <div style={{fontSize:13,fontWeight:700,color:"#888",margin:"14px 0 6px"}}>Cost: <span style={{color:"#D97706",fontSize:17,fontWeight:900}}>{nrCost} pts</span></div>
          <input type="range" min={10} max={500} step={10} value={nrCost} onChange={e=>setNrCost(+e.target.value)} style={{width:"100%",marginBottom:22,accentColor:"#F59E0B"}}/>
          <div style={{display:"flex",gap:10}}><Btn onClick={()=>setAddRewardKid(null)} gradient="#F0F0F0" color="#888" style={{flex:1}}>Cancel</Btn><Btn onClick={addReward} gradient="linear-gradient(120deg,#FFD93D,#FF922B)" style={{flex:1}}>Add Reward 🎉</Btn></div>
        </Modal>
      )}
    </div>
  );
}
