export const SYMBOLS=['🍓','🍋','🍇','🍉','🍒','🥝','🍍','🥕','🌽','🍄','🌵','🌻','🌷','🍀','🌲','🌈','⭐','🌙','☀️','❄️','🔥','💧','⚽','🏀','🎾','🎲','🎈','🎁','🎀','🔔','🎸','🎺','🚗','🚀','⛵','✈️','🏠','⏰','🔑','💎','🧲','👑','🦋','🐞','🐝','🐢','🐳','🐙','🦀','🐧','🐸','🦊','🐼','🐨','🐰','🐱'];
export const symbol=id=>SYMBOLS[id]??`◆${id+1}`;
export function assignPair(bodies,random=Math.random){const pool=Array.from({length:Math.max(SYMBOLS.length,bodies.length)},(_,i)=>i);for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}bodies.forEach((b,i)=>b.plugin.pattern=pool[i]);const a=Math.floor(random()*bodies.length);let b=Math.floor(random()*(bodies.length-1));if(b>=a)b++;bodies[b].plugin.pattern=bodies[a].plugin.pattern;return bodies[a].plugin.pattern;}
export class Game {
 constructor(){this.reset();}
 reset(){this.phase='ready';this.score=0;this.hearts=3;this.round=1;this.remaining=10;this.pair=null;this.reason='';}
 begin(){this.phase='spawning';}
 activate(bodies){this.pair=assignPair(bodies);this.remaining=10;this.phase='playing';}
 hit(pattern){if(this.phase!=='playing')return 'ignored';if(pattern===this.pair){this.score+=100;this.remaining=10;this.phase='feedback';return 'correct';}this.hearts--;if(this.hearts===0)this.end('生命耗尽');return 'wrong';}
 tick(dt){if(this.phase==='playing'){this.remaining=Math.max(0,this.remaining-dt);if(this.remaining===0)this.end('时间到了');}}
 end(reason){this.reason=reason;this.phase='over';}
}
