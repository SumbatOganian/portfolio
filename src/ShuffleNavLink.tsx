import {useEffect,useRef,type AnchorHTMLAttributes} from 'react';

type Props=Omit<AnchorHTMLAttributes<HTMLAnchorElement>,'children'> & {label:string;reduceMotion?:boolean};
function shuffledSlots(length:number){
 const slots=Array.from({length},(_,i)=>i);
 for(let i=length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[slots[i],slots[j]]=[slots[j],slots[i]]}
 if(slots.every((slot,i)=>slot===i))slots.push(slots.shift()!);
 return slots;
}
export function ShuffleNavLink({label,reduceMotion=false,...props}:Props){
 const word=useRef<HTMLSpanElement>(null),animations=useRef<Animation[]>([]);
 useEffect(()=>()=>{animations.current.forEach(animation=>animation.cancel())},[]);
 const shuffle=()=>{
  if(reduceMotion||animations.current.some(animation=>animation.playState==='running'))return;
  const letters=[...word.current!.querySelectorAll<HTMLElement>('.nav-shuffle-char')];
  const x=letters.map(letter=>letter.offsetLeft),first=shuffledSlots(letters.length),second=shuffledSlots(letters.length);
  animations.current=letters.map((letter,i)=>letter.animate([
   {transform:'translateX(0)',offset:0},
   {transform:`translateX(${x[first[i]]-x[i]}px)`,offset:.30},
   {transform:`translateX(${x[second[i]]-x[i]}px)`,offset:.60},
   {transform:'translateX(0)',offset:1}
  ],{duration:220,easing:'cubic-bezier(.2,.6,.2,1)'}));
  animations.current.at(-1)!.onfinish=()=>{animations.current=[]};
 };
 return <a {...props} aria-label={label} onPointerEnter={event=>{if(event.pointerType!=='touch')shuffle()}} onFocus={event=>{if(event.currentTarget.matches(':focus-visible'))shuffle()}}><span className="nav-shuffle" ref={word} aria-hidden="true">{Array.from(label).map((letter,i)=><span className="nav-shuffle-char" key={i}>{letter}</span>)}</span></a>;
}
