// Exercise the actual component's state transitions without a browser dependency.
import test from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';
register('./support/react-loader.js', import.meta.url);
const react = await import('./support/react-mock.js');
const handlers = {};
const stub = (name, value) => Object.defineProperty(globalThis, name, {value, configurable: true, writable: true});
stub('localStorage', {getItem: () => null, setItem() {}});
stub('location', {href: 'https://example.com/'});
stub('requestAnimationFrame', () => 0);
stub('cancelAnimationFrame', () => {});
stub('document', {hidden: false, createElement: () => ({}), head: {appendChild() {}, removeChild() {}}, addEventListener: (k, v) => handlers[k] = v, removeEventListener() {}});
stub('window', {addEventListener: (k, v) => handlers[k] = v, removeEventListener() {}});
const {App} = await import('../src/App.js');
function game(){
 react.reset();let root;
 function render(){root=react.render(App);return root}
 function nodes(node=root){if(node==null||node===false)return[];if(Array.isArray(node))return node.flatMap(n=>nodes(n));if(typeof node!=='object')return[];return[node,...nodes(node.props?.children??null)]}
 const text=node=>typeof node==='string'||typeof node==='number'?String(node):Array.isArray(node)?node.map(text).join(''):node&&typeof node==='object'?text(node.props?.children):'';
 function click(label){const node=nodes().find(n=>n.type==='button'&&text(n).includes(label));assert.ok(node,`button ${label} exists`);node.props.onClick();render()}
 render();return {render,nodes,text,click,handlers};
}
test('menu opens 12-level selection with practice and speed controls',t=>{
 t.mock.timers.enable({apis:['setTimeout','setInterval']});
 const g=game();g.click('開始遊戲');assert.equal(g.nodes().filter(n=>n.type==='button'&&g.text(n).startsWith('Lv')).length,12);assert.ok(g.nodes().some(n=>n.type==='select'));
 assert.equal(g.nodes().filter(n=>n.type==='button'&&n.props.disabled).length,11);
 const practice=g.nodes().find(n=>n.type==='input');practice.props.onChange({target:{checked:true}});g.render();assert.equal(g.nodes().filter(n=>n.props.disabled).length,0);
});
test('starting, pausing, resuming and leaving a game preserve the expected state',t=>{
 t.mock.timers.enable({apis:['setTimeout','setInterval']});
 const g=game();g.click('開始遊戲');g.click('Lv1');assert.ok(g.nodes().some(n=>n.props.role==='dialog'));assert.ok(g.text(g.render()).includes('準備好'));
 for(let i=0;i<3;i++){t.mock.timers.tick(1000);g.render()}
 assert.ok(!g.nodes().some(n=>n.props.role==='dialog'));
 g.click('暫停');assert.ok(g.text(g.render()).includes('遊戲已暫停'));g.click('繼續遊戲');assert.ok(g.text(g.render()).includes('準備好'));
 g.handlers.blur();g.render();g.click('返回選關');assert.ok(g.text(g.render()).includes('選擇關卡'));
});
