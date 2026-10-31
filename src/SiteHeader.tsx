import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {ShuffleNavLink} from './ShuffleNavLink';
import './header.css';
type Section='hero'|'projects'|'skills'|'contact';
export function SiteHeader({onNavigate,reduceMotion}:{onNavigate:(section:Section)=>void;reduceMotion:boolean}){
 const [open,setOpen]=useState(false);
 const header=useRef<HTMLElement>(null),panel=useRef<HTMLElement>(null),toggle=useRef<HTMLButtonElement>(null);
 const gesture=useRef({y:0,time:0,distance:0,active:false});
 const navigate=(section:Section)=>{setOpen(false);onNavigate(section)};
 useEffect(()=>{const query=matchMedia('(max-width:1023px)');const close=()=>{if(!query.matches)setOpen(false)};query.addEventListener('change',close);return()=>query.removeEventListener('change',close)},[]);
 useEffect(()=>{
  if(!open)return;
  const previousFocus=document.activeElement as HTMLElement|null;
  const siblings=Array.from(header.current!.parentElement!.children).filter(el=>el!==header.current) as HTMLElement[];
  const previousInert=siblings.map(el=>el.inert);siblings.forEach(el=>{el.inert=true});
  const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  const focusFrame=requestAnimationFrame(()=>{panel.current?.querySelector<HTMLAnchorElement>('a')?.focus({preventScroll:true})});
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();setOpen(false)}
   if(event.key==='Tab'){
    const controls=[toggle.current!,...panel.current!.querySelectorAll<HTMLAnchorElement>('a')];
    const index=controls.indexOf(document.activeElement as HTMLButtonElement);
    if(event.shiftKey&&index<=0){event.preventDefault();controls.at(-1)!.focus()}
    else if(!event.shiftKey&&(index===controls.length-1||index<0)){event.preventDefault();controls[0].focus()}
   }
  };
  document.addEventListener('keydown',key);
  return()=>{cancelAnimationFrame(focusFrame);siblings.forEach((el,i)=>{el.inert=previousInert[i]});document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previousFocus?.focus({preventScroll:true});panel.current?.style.removeProperty('--sheet-drag');panel.current?.removeAttribute('data-dragging')};
 },[open]);
 const dragStart=(event:PointerEvent<HTMLElement>)=>{if(!open||event.button!==0)return;gesture.current={y:event.clientY,time:performance.now(),distance:0,active:true}};
 const dragMove=(event:PointerEvent<HTMLElement>)=>{
  const g=gesture.current;if(!g.active)return;g.distance=Math.max(0,event.clientY-g.y);
  if(g.distance>8){event.currentTarget.setPointerCapture(event.pointerId);event.currentTarget.dataset.dragging='true';event.currentTarget.style.setProperty('--sheet-drag',`${g.distance}px`)}
 };
 const dragEnd=()=>{const g=gesture.current;if(!g.active)return;g.active=false;panel.current?.removeAttribute('data-dragging');panel.current?.style.removeProperty('--sheet-drag');if(g.distance>80||(g.distance>30&&g.distance/Math.max(1,performance.now()-g.time)>.5))setOpen(false)};
 const links=(mobile=false)=>(['projects','skills','contact'] as const).map((section,i)=><ShuffleNavLink key={section} tabIndex={mobile?0:undefined} href={`#${section}`} label={['Проекты','Навыки','Контакты'][i]} reduceMotion={reduceMotion} onClick={event=>{event.preventDefault();if(mobile&&event.detail>0&&gesture.current.distance>8)return;navigate(section)}}/>);
 return <header ref={header} className={`site-header${open?' menu-is-open':''}`}>
  <a className="monogram" href="#hero" aria-label="В начало" onClick={event=>{event.preventDefault();navigate('hero')}}>SO</a>
  <nav className="navigation" aria-label="Основная навигация">{links()}</nav>
  <button ref={toggle} className="menu-toggle" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open?'Закрыть меню':'Открыть меню'}><span/><span/></button>
  <div className="menu-backdrop" aria-hidden="true" onClick={()=>setOpen(false)}/>
  <nav ref={panel} id="mobile-menu" className="mobile-menu" aria-label="Мобильная навигация" onTransitionEnd={event=>{if(open&&event.target===event.currentTarget&&event.propertyName==='transform'&&document.activeElement===document.body)event.currentTarget.querySelector<HTMLAnchorElement>('a')?.focus({preventScroll:true})}} inert={!open} onPointerDown={dragStart} onPointerMove={dragMove} onPointerUp={dragEnd} onPointerCancel={()=>{gesture.current.active=false;panel.current?.removeAttribute('data-dragging');panel.current?.style.removeProperty('--sheet-drag')}}>
   <div className="menu-grip" aria-hidden="true"/><div className="mobile-menu-links">{links(true)}</div>
  </nav>
 </header>;
}
