// Rendering only: no body position, size or velocity is changed here.
export class Camera {
 constructor(w,h){this.w=w;this.h=h;this.min=.9;this.max=1.8;this.reset();}
 reset(){this.scale=this.max;this.target=this.max;this.from=this.max;this.time=.5;this.x=this.w/2;this.y=this.h/2;}
 fit(bodies){if(!bodies.length)return;let reachX=1,reachY=1;for(const b of bodies){reachX=Math.max(reachX,Math.abs(b.bounds.min.x-this.x),Math.abs(b.bounds.max.x-this.x));reachY=Math.max(reachY,Math.abs(b.bounds.min.y-this.y),Math.abs(b.bounds.max.y-this.y));}const fit=Math.max(this.min,Math.min(this.max,(this.w-48)/(2*reachX),(this.h-100)/(2*reachY))); // central symmetric bounding box prevents panning jitter
 if(fit<this.target-.025){this.from=this.scale;this.target=fit;this.time=0;}}
 tick(dt){this.time=Math.min(.5,this.time+dt);const t=this.time/.5;this.scale=this.from+(this.target-this.from)*(t*t*(3-2*t));}
 apply(ctx){ctx.translate(this.w/2,this.h/2);ctx.scale(this.scale,this.scale);ctx.translate(-this.x,-this.y);}
 world(x,y){return{x:(x-this.w/2)/this.scale+this.x,y:(y-this.h/2)/this.scale+this.y};}
}
