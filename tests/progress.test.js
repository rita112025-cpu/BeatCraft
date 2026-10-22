import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,loadProgress,saveProgress,recordResult,pattern} from '../progress.js';
const storage=()=>{let data=null;return {getItem:()=>data,setItem:(_,v)=>data=v}};
test('12 levels start at 70 BPM and end at 240 BPM',()=>{
 assert.equal(levels.length,12);assert.equal(levels[0].bpm,70);assert.equal(levels.at(-1).bpm,240);
});
test('a one-star result unlocks the next level and never lowers a personal best',()=>{
 const before=loadProgress(storage());const after=recordResult(before,0,1500);
 assert.equal(before[0].best,0);assert.equal(after[0].stars,2);assert.equal(after[1].locked,false);
 const retry=recordResult(after,0,50);assert.equal(retry[0].best,1500);assert.equal(retry[0].stars,2);
});
test('progress survives saving and reloading, including unlocks',()=>{
 const db=storage();saveProgress(recordResult(loadProgress(db),0,2500),db);
 const reloaded=loadProgress(db);assert.equal(reloaded[0].best,2500);assert.equal(reloaded[0].stars,3);assert.equal(reloaded[1].locked,false);
});
test('malformed and blocked storage do not prevent playing',()=>{
 for(const db of [{getItem:()=>'{bad'}, {getItem:()=>'{"id":1}'},{getItem:()=>{throw Error('blocked')}}])assert.equal(loadProgress(db).length,12);
 assert.equal(saveProgress(levels,{setItem:()=>{throw Error('quota')}}),false);
 const db={getItem:()=>JSON.stringify([{id:1,best:-9,stars:99}])};assert.equal(loadProgress(db)[0].stars,0);
});
test('every level can unlock the next level with a reachable score',()=>{
 let progress=loadProgress(storage());for(let i=0;i<12;i++){assert.equal(progress[i].locked,false);progress=recordResult(progress,i,500)}
});
test('patterns are deterministic and versus always gives each team one note',()=>{
 for(let level=1;level<=12;level++)for(let beat=0;beat<100;beat++){
 const lanes=pattern(level,beat);assert.deepEqual(lanes,pattern(level,beat));assert.equal(new Set(lanes).size,lanes.length);assert.ok(lanes.every(l=>l>=0&&l<4));
 const duel=pattern(level,beat,true);assert.equal(duel.filter(l=>l<2).length,1);assert.equal(duel.filter(l=>l>=2).length,1);
 }
});
