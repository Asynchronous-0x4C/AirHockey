import p5, { Vector } from "p5";
import { Main, Start, State, StateManager } from "./classes";
import { Controller } from "./controller";
import { Arcade } from "./arcade";

export let state:StateManager;
export let states:Map<string,State>=new Map();
export let controller:Controller;
export let mousePress=false;
export let keyPress=false;
export let loop:boolean=true;

export const sketch=(p:p5)=>{
  p.setup=()=>{
    p.createCanvas(innerWidth,innerHeight,"p2d");
    p.frameRate(60);
    p.textFont("Noto Sans JP");
    controller=new Controller(p);
    states.set("start",new Start(p));
    states.set("game",new Main(p));
    states.set("arcade",new Arcade(p));
    state=new StateManager(states.get("start")!);
  }
  p.draw=()=>{
    if(!loop)return;
    state.display();
    state.update();
    controller.update();
    controller.display();
    keyPress=mousePress=false;
  }
  p.mousePressed=()=>{
    mousePress=true;
  }
  p.keyPressed=()=>{
    keyPress=true;
    controller.pressed(p.keyCode);
  }
  p.keyReleased=()=>{
    controller.released(p.keyCode);
  }
}

export function setLoop(l:boolean){
  loop=l;
}

export function length(x:number,y:number){
  return Math.sqrt(x*x+y*y);
}

export function roundRectDist(p:Vector,x:number,y:number,radius:number) {
  const dx=Math.abs(p.x)-x;
  const dy=Math.abs(p.y)-y;
  return Math.min(Math.max(dx, dy), 0.0) + length(Math.max(dx,0.0),Math.max(dy,0.0))- radius;
}

export function roundRectReaction(p:Vector,x:number,y:number,radius:number){
  let delta=1e-5;
  let d=roundRectDist(p,x,y,radius);
  if(d<=0){
    const dx=roundRectDist(p.copy().add(delta,0),x,y,radius)-roundRectDist(p.copy().add(-delta,0),x,y,radius);
    const dy=roundRectDist(p.copy().add(0,delta),x,y,radius)-roundRectDist(p.copy().add(0,-delta),x,y,radius);
    const n=new Vector(dx,dy).normalize();
    return {hit:true,normal:n.mult(-d)};
  }else{
    return {hit:false,normal:new Vector(0,0)};
  }
}