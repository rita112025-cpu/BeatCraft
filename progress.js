// Independent game rules: safe storage, progression and repeatable beat patterns.
export const levels = [
  ["入門節拍",70,"#7CC8FF","單鍵起步，找找感覺"],
  ["輕快節奏",100,"#FFE14A","四軌輪替，跟上節拍"],
  ["狂歡派對",135,"#FF7D9D","雙鍵加入，派對開始"],
  ["魔王初現",160,"#FF6B6B","音符左右飄移，小心接招",true],
  ["星際穿越",180,"#B8A6FF","交錯雙鍵，穿越星空"],
  ["大師挑戰",200,"#FF9D5C","高速輪替，挑戰手速"],
  ["森林迴響",110,"#7BE38B","階梯旋律，重新找回節奏"],
  ["霓虹街道",145,"#FF7DCD","交替和弦，點亮夜色"],
  ["極光之舞",170,"#87E8DE","鏡像節拍，左右協調"],
  ["熔岩疾走",190,"#FF9D5C","雙鍵漂移，熱力全開",true],
  ["星河風暴",220,"#B8A6FF","密集和弦，穩住節拍"],
  ["終極節奏王",240,"#FF6B6B","最終魔王，突破極限",true]
].map(([name,bpm,color,desc,isDemon=false],i)=>({id:i+1,name,bpm,color,desc,isDemon,icon:isDemon?"🔥":"",duration:30,accent:"#1C2A4A",locked:i>0,stars:0,best:0}));
const key="beatcraft.progress.v3";
const integer=(v,max)=>Number.isSafeInteger(v)&&v>=0&&v<=max?v:0;
export function loadProgress(storage){
  try {
    storage ??= globalThis.localStorage;
    const saved=JSON.parse(storage.getItem(key)||"[]");
    if(!Array.isArray(saved))return levels.map(l=>({...l}));
    const result=levels.map(l=>{const item=saved.find(s=>s&&s.id===l.id)||{};return {...l,best:integer(item.best,10000000),stars:integer(item.stars,3)}});
    return unlock(result);
  } catch {return levels.map(l=>({...l}))}
}
export function saveProgress(progress,storage){
  try {storage ??= globalThis.localStorage;storage.setItem(key,JSON.stringify(progress.map(({id,best,stars})=>({id,best,stars}))));return true} catch {return false}
}
function unlock(progress){return progress.map((l,i)=>({...l,locked:i>0&&progress[i-1].stars<1}))}
export function recordResult(progress,index,score){
  const stars=score>2200?3:score>1200?2:score>400?1:0;
  return unlock(progress.map((l,i)=>i===index?{...l,best:Math.max(l.best,score),stars:Math.max(l.stars,stars)}:{...l}));
}
export function pattern(level,beat,duel=false){
  // Both teams receive one note per beat in versus mode.
  if(duel)return [beat%2,2+beat%2];
  const lane=(beat+(level%3))%4;
  if(level<=2||level===7)return [lane];
  if(level===9)return beat%2?[1,2]:[0,3];
  if(beat% (level>=10?2:4)===0)return [lane,(lane+2)%4];
  return [lane];
}
