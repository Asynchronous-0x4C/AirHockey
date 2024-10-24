import p5 from "p5";
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