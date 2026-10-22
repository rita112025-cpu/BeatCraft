// Exercise the actual component's state transitions without a browser dependency.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as rules from '../progress.js';
function game(){
 const state=[],effects=[],refs=[],handlers={},timers=new Map();let cursor=0,root,id=0;
 const I={useState(initial){const k=cursor++;if(!(k in state))state[k]=typeof initial==='function'?initial():initial;return[state[k],v=>state[k]=typeof v==='function'?v(state[k]):v]},useRef(initial){const k=cursor++;return refs[k]??=( {current:initial})},useCallback(fn){cursor++;return fn},useEffect(fn,deps){const k=cursor++,old=effects[k];if(!old||deps.some((v,i)=>v!==old.deps[i])){old?.cleanup?.();effects[k]={deps,fn}}}};
 const h=(type,props)=>({type,props});
 const context={...rules,I,h,E:h,Ot:['blue','yellow','pink','green'],Ko:['D','F','J','K'],Ut:86,console,Math,Date,Set,localStorage:{getItem:()=>null,setItem(){}},navigator:{},location:{href:'https://example.com/'},requestAnimationFrame:()=>++id,cancelAnimationFrame(){},setTimeout(fn){timers.set(++id,fn);return id},clearTimeout(k){timers.delete(k)},setInterval:()=>++id,clearInterval(){},document:{hidden:false,createElement:()=>({}),head:{appendChild(){},removeChild(){}},addEventListener:(k,v)=>handlers[k]=v,removeEventListener(){}},window:{addEventListener:(k,v)=>handlers[k]=v,removeEventListener(){},setInterval:()=>++id,clearInterval(){}}};
 vm.createContext(context);let source=readFileSync(new URL('../game.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');source=source.slice(0,source.lastIndexOf('Jc.createRoot'))+'\nthis.App=Xo';vm.runInContext(source,context);
 function render(){cursor=0;root=context.App();for(const e of effects)if(e?.fn){const fn=e.fn;e.fn=null;e.cleanup=fn()}return root}
 function nodes(node=root){if(node==null||node===false)return[];if(Array.isArray(node))return node.flatMap(n=>nodes(n));if(typeof node!=='object')return[];return[node,...nodes(node.props?.children??null)]}
 const text=node=>typeof node==='string'||typeof node==='number'?String(node):Array.isArray(node)?node.map(text).join(''):node&&typeof node==='object'?text(node.props?.children):'';
 function click(label){const node=nodes().find(n=>n.type==='button'&&text(n).includes(label));assert.ok(node,`button ${label} exists`);node.props.onClick();render()}
 render();return {render,nodes,text,click,state,handlers,timers};
}
test('menu opens 12-level selection with practice and speed controls',()=>{
 const g=game();g.click('開始遊戲');assert.equal(g.nodes().filter(n=>n.type==='button'&&g.text(n).startsWith('Lv')).length,12);assert.ok(g.nodes().some(n=>n.type==='select'));
 assert.equal(g.nodes().filter(n=>n.type==='button'&&n.props.disabled).length,11);
 const practice=g.nodes().find(n=>n.type==='input');practice.props.onChange({target:{checked:true}});g.render();assert.equal(g.nodes().filter(n=>n.props.disabled).length,0);
});
test('starting, pausing, resuming and leaving a game preserve the expected state',()=>{
 const g=game();g.click('開始遊戲');g.click('Lv1');assert.ok(g.nodes().some(n=>n.props.role==='dialog'));assert.ok(g.text(g.render()).includes('準備好'));
 for(let i=0;i<3;i++){const tasks=[...g.timers.values()];g.timers.clear();tasks.forEach(fn=>fn());g.render()}
 assert.ok(!g.nodes().some(n=>n.props.role==='dialog'));
 g.click('暫停');assert.ok(g.text(g.render()).includes('遊戲已暫停'));g.click('繼續遊戲');assert.ok(g.text(g.render()).includes('準備好'));
 g.handlers.blur();g.render();g.click('返回選關');assert.ok(g.text(g.render()).includes('選擇關卡'));
});
