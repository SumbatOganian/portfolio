import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siPython, siDjango, siJavascript, siHtml5, siGit, siGithub } from 'simple-icons';
import '@fontsource-variable/roboto-flex/full.css';
import projects from '../data/projects.json';
import skills from '../data/skills.json';
import config from '../data/site-config.json';
import './style.css';
import {startupStep,startupFinished,visualStartupReady} from './startup';
import {PortraitJourney} from './PortraitJourney';
import {KineticText} from './KineticText';
import {ProjectPreview} from './ProjectPreview';
import {SiteHeader} from './SiteHeader';
import './art-direction-v4.css';
gsap.registerPlugin(ScrollTrigger);
startupStep('interface');
const icons = [siPython,siDjango,siJavascript,siHtml5,siGit];
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t)};
const targets={hero:0,projects:.39,skills:.84,contact:.98};
const projectStart = (mobile: boolean) => mobile ? .205 : targets.projects;
const projectStep = (mobile: boolean) => mobile ? .119 : .079;
type Section=keyof typeof targets;
function Arrow({down=false}:{down?:boolean}){return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={down?'M12 4v16m-6-6 6 6 6-6':'M5 19 19 5M5 5h14v14'} stroke="currentColor" strokeWidth="1.3"/></svg>}
function App(){
 const track=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const stageScroll = useRef<ScrollTrigger | null>(null);
 const motion=useRef({progress:0,pointerX:0,pointerY:0,mobile:false});
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [staticMode,setStaticMode]=useState(false);
 const [preview,setPreview]=useState<(typeof projects)[number]|null>(null);
 const [noGL,setNoGL]=useState(false);
 const flat = reduced || noGL || staticMode;
 const scrollTo=useCallback((section:Section,projectIndex?:number,instant=false)=>{
  if(section==='contact'){const contact=document.getElementById('contact')!;const top=contact.dataset.scrollTarget?Number(contact.dataset.scrollTarget):contact.getBoundingClientRect().top+window.scrollY;window.scrollTo({top,behavior:instant?'instant':'smooth'});return;}
  if(flat){document.getElementById(section==='projects'&&projectIndex!==undefined?`project-${projectIndex}`:section)?.scrollIntoView({behavior:instant?'instant':'smooth'});return;}
  const mobile = innerWidth < 1024;
  const p = section === 'projects'
   ? projectStart(mobile) + (projectIndex ?? 0) * projectStep(mobile)
   : targets[section];
  window.scrollTo({top:track.current!.offsetTop+p*(track.current!.offsetHeight-innerHeight),behavior:instant?'instant':'smooth'});
  if (instant) {
   ScrollTrigger.update();
   stageScroll.current?.getTween()?.progress(1);
  }
 }, [flat]);
 const selectProject = useCallback((index: number) => {
  scrollTo('projects', index, true);
  document.getElementById(`project-${index}`)?.focus({preventScroll: true});
 }, [scrollTo]);
 useEffect(() => {
  function onArrow(event: KeyboardEvent) {
   if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
   if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
       track.current?.inert || document.documentElement.hasAttribute('data-startup-loading')) return;
   if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return;

   let current: number;
   if (flat) {
    const cards = [...(stage.current?.querySelectorAll<HTMLElement>('.project-card') ?? [])];
    const visible = cards.map((card, index) => ({card, index, box: card.getBoundingClientRect()}))
     .filter(({box}) => box.bottom > 0 && box.top < innerHeight);
    const active = visible.find(({card}) => card.contains(document.activeElement)) ??
     visible.sort((a, b) => Math.abs(a.box.top + a.box.height / 2 - innerHeight / 2) -
      Math.abs(b.box.top + b.box.height / 2 - innerHeight / 2))[0];
    if (!active) return;
    current = active.index;
   } else {
    const {progress, mobile} = motion.current;
    if (progress < .14 || progress >= .79) return;
    current = Math.round(clamp((progress - projectStart(mobile)) / projectStep(mobile), 0, projects.length - 1));
   }

   event.preventDefault();
   const next = clamp(current + (event.key === 'ArrowRight' ? 1 : -1), 0, projects.length - 1);
   selectProject(next);
  }
  window.addEventListener('keydown', onArrow);
  return () => window.removeEventListener('keydown', onArrow);
 }, [flat, selectProject]);
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(q.matches);q.addEventListener('change',update);return()=>q.removeEventListener('change',update)},[]);
 useEffect(()=>{
  document.fonts.ready.then(()=>startupStep('fonts'));
  const timer=setTimeout(()=>{if(!startupFinished()){setNoGL(true);startupStep('fonts')}},15000);
  return()=>clearTimeout(timer);
 },[]);
 useEffect(()=>{
  if(reduced||noGL||staticMode||!canvas.current){const frame=requestAnimationFrame(visualStartupReady);return()=>cancelAnimationFrame(frame)};
  let disposed=false,cleanup:(()=>void)|undefined;
  import('./scene').then(({createScene})=>{if(disposed)return()=>{};startupStep('engine');return createScene(canvas.current!,motion.current,()=>{if(!disposed)setNoGL(true)},{onAssetReady:asset=>{if(!disposed)startupStep(asset)},onReady:()=>{if(!disposed)startupStep('frame')}})}).then(fn=>{if(disposed)fn();else cleanup=fn}).catch(()=>{if(!disposed)setNoGL(true)});
  return()=>{disposed=true;cleanup?.()};
 },[reduced,noGL,staticMode]);
 useEffect(()=>{
  if(reduced||noGL||staticMode){stage.current?.querySelectorAll<HTMLElement>('.hero,.hero > *,.hero .kinetic-char,.hero-caption,.gallery-title,.project-card,.skills,.skill,.contact,.chapter-nav,.stage-footer,.scene-curtain').forEach(el=>el.removeAttribute('style'));return;}
  const root=stage.current!;
  const hero=root.querySelector<HTMLElement>('.hero')!,gallery=root.querySelector<HTMLElement>('.gallery-title')!,skill=root.querySelector<HTMLElement>('.skills')!;
  const cards=[...root.querySelectorAll<HTMLElement>('.project-card')];
  const floatingSkills=[...root.querySelectorAll<HTMLElement>('.skill')];
  const liftRates=[.13,.21,.16,.24,.18],seeds=[1.2,3.7,5.8,2.6,4.9];
  let skillRange=0,skillEnd=0,skillsInView=true;
  function measureSkillTravel(){skillRange=track.current!.offsetHeight-innerHeight;skillEnd=track.current!.offsetTop+skillRange}
  measureSkillTravel();
  function floatSkills(time:number){
   const p=motion.current.progress;if(!skillsInView||document.hidden||p<.79)return;
   const lift=clamp((p-.84)/.16),presence=smooth((p-.81)/.04),mobile=innerWidth<1024;
   const travel=lift*.16*skillRange+Math.max(0,window.scrollY-skillEnd);
   floatingSkills.forEach((el,i)=>{
    const seed=seeds[i],bob=Math.sin(time*(.65+i*.09)+seed)*5*presence;
    const x=(Math.sin(seed+lift*2.2)*lift*(mobile?14:28)+Math.sin(time*.4+seed)*3)*presence;
    const angle=(Math.sin(seed+lift*1.7)*lift*8+Math.sin(time*.5+seed)*1.2)*presence;
    el.style.translate=`${x.toFixed(2)}px ${(-travel*liftRates[i]+bob).toFixed(2)}px`;
    el.style.rotate=`${angle.toFixed(2)}deg`;
   });
  }
  const heroLetters=[...hero.querySelectorAll<HTMLElement>('.kinetic-char')];
  const heroUI=[...hero.children].filter(el=>el.tagName!=='H1') as HTMLElement[];
  const curtain=root.querySelector<HTMLElement>('.scene-curtain')!;
  const progress=root.querySelector<HTMLElement>('.progress-fill')!,chapter=root.querySelector<HTMLElement>('.chapter-current')!;
  const sceneChrome=[root.querySelector<HTMLElement>('.chapter-nav')!,root.querySelector<HTMLElement>('.stage-footer')!];
  function visibility(el:HTMLElement,opacity:number){el.style.opacity=String(opacity);el.style.visibility=opacity<.005?'hidden':'visible';}
  function render(p:number){
   root.dataset.progress=p.toFixed(4);
   curtain.style.transform=`translateY(${(1-smooth((p-.86)/.12))*100}%)`;
   motion.current.progress=p;const mobile=innerWidth<1024;motion.current.mobile=mobile;
   const h=1-smooth((p-.075)/.10);visibility(hero,p<.27?1:0);hero.style.transform='none';hero.style.pointerEvents=p<.15?'auto':'none';heroUI.forEach(el=>el.style.opacity=String(h));root.querySelector<HTMLElement>('.hero-caption')!.style.opacity=String(h);
   heroLetters.forEach((el,i)=>{const f=smooth((p-.045-i*.0015)/.12);const seed=i*2.399;el.style.transform=`translate3d(${Math.sin(seed)*innerWidth*.60*f}px,${Math.cos(seed*1.7)*innerHeight*.65*f}px,0) rotate(${Math.sin(seed*.7)*f*145}deg) scale(${1+f*.35})`;el.style.opacity=String(Math.pow(1-f,1.5));el.style.filter=f>.01&&f<.99?`blur(${f*6}px)`:'none'});
   const gal=smooth((p-.14)/.055)*(1-smooth((p-.74)/.045));visibility(gallery,gal);
   cards.forEach((card,i)=>{
    let opacity=1,x=0,y=0,scale=1,rotate=0,z=4;
    if(mobile){
     const enter=clamp((p-(.14+i*.119))/.065),leave=clamp((p-(.14+(i+1)*.119))/.065);
     y=(1-enter)*(innerHeight*.95)-leave*22;scale=1-leave*.075;
     opacity=(enter>0?1:0)*(1-smooth((p-.755)/.035));
     card.style.setProperty('--shade',String(leave*.23));z=5+i;
    }else{
     const entry=smooth((p-(.16+i*.033))/.13),focus=clamp((p-projectStart(false))/projectStep(false),0,cards.length-1),d=i-focus;
     const gx=d*Math.min(innerWidth*.235,355),gy=Math.abs(d)*Math.abs(d)*27;
     x=mix(innerWidth*.21,gx,entry);y=mix(0,gy,entry);
     scale=mix(.10,Math.max(.47,1-Math.abs(d)*.16),entry);rotate=mix(-18,-d*9,entry);
     opacity=smooth((p-(.16+i*.033))/.045)*(1-smooth((p-.735)/.055));z=entry>.70?Math.round(15-Math.abs(d)):2;
     const exit=smooth((p-.735)/.065);y-=exit*170;scale*=1-exit*.45;
     card.style.setProperty('--shade',String(Math.min(.3,Math.abs(d)*.09)));
    }
    card.style.transform=`translate(-50%,-50%) translate3d(${x}px,${y}px,0) scale(${scale}) rotateY(${rotate}deg)`;card.style.zIndex=String(z);card.style.opacity=String(opacity);card.style.visibility='visible';card.style.pointerEvents=opacity>.05?'auto':'none';
   });
   // The black curtain rises first; the whole chapter then floats upward,
   // remaining opaque until normal document flow carries it off screen.
   const s=smooth((p-.79)/.045),drift=smooth((p-.91)/.09)*innerHeight*.16;
   visibility(skill,s);skill.style.transform=`translateY(${(1-s)*45-drift}px)`;
   sceneChrome.forEach(el=>el.style.transform=`translateY(${-drift}px)`);
   progress.style.transform=`scaleY(${p})`;chapter.textContent=p<.15?'01':p<.79?'02':'03';
   root.querySelectorAll<HTMLElement>('[data-nav]').forEach(el=>el.dataset.active=String(el.dataset.nav===(p<.15?'hero':p<.79?'projects':'skills')));
  }
  const trigger=ScrollTrigger.create({trigger:track.current,start:'top top',end:'bottom bottom',scrub:.55,animation:gsap.fromTo(motion.current,{progress:0},{progress:1,ease:'none',onUpdate:()=>render(motion.current.progress)}),onRefresh:()=>{measureSkillTravel();render(motion.current.progress)}});
  stageScroll.current = trigger;
  render(trigger.progress);
  const skillObserver=new IntersectionObserver(entries=>{skillsInView=entries[0].isIntersecting});skillObserver.observe(root);
  gsap.ticker.add(floatSkills);
  const pointer=(e:PointerEvent)=>{motion.current.pointerX=(e.clientX/innerWidth-.5)*2;motion.current.pointerY=(e.clientY/innerHeight-.5)*2};
  window.addEventListener('pointermove',pointer);
  return()=>{stageScroll.current=null;trigger.animation?.kill();trigger.kill();gsap.ticker.remove(floatSkills);skillObserver.disconnect();window.removeEventListener('pointermove',pointer)};
 },[reduced,noGL,staticMode]);
 return <div className={flat?'app flat':'app'}>
  <a className="skip-link" href="#project-0" onClick={e=>{e.preventDefault();scrollTo('projects',0,true);document.querySelector<HTMLAnchorElement>('#project-0 .card-site-arrow')?.focus({preventScroll:true})}}>Перейти к проектам</a>
  <SiteHeader onNavigate={scrollTo} reduceMotion={flat}/>
  <main ref={track} className="scroll-track"><div ref={stage} className="stage">
   <div className="ambient" aria-hidden="true"/><div className="scene-curtain" aria-hidden="true"/>{!flat&&<canvas ref={canvas} className="scene" aria-hidden="true"/>}
   <section id="hero" className="hero"><p className="eyebrow"><span className="status-dot"/>{config.roleLabel}</p><h1><KineticText text="ИДЕИ. КОД."/><KineticText text="РЕЗУЛЬТАТ."/></h1><p className="hero-description">{config.heroDescription}</p><a className="projects-cta" href="#projects" onClick={e=>{e.preventDefault();scrollTo('projects',0)}}><span>Смотреть проекты</span><Arrow/></a><span className="hero-social"><a href={config.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={siGithub.path}/></svg></a></span><div className="hero-scroll" aria-hidden="true"><i/><span>SCROLL</span></div></section>
   <div className="hero-caption" aria-hidden="true">DIGITAL<br/>MATTER<span>CODE INTO FORM</span></div>
   <div id="projects" className="gallery-title"><p className="eyebrow">02 / ИЗБРАННЫЕ РАБОТЫ</p><h2>Код обретает форму.</h2><span>05 РЕАЛЬНЫХ ПРОЕКТОВ <i>↗</i></span></div>
   <div className="gallery" aria-label="Проекты">{projects.map((p,i)=><article key={p.id} id={`project-${i}`} className="project-card" aria-label={p.name} tabIndex={-1}
    onFocus={event=>{if(!flat && event.target !== event.currentTarget) scrollTo('projects',i,true)}}
    onClick={event=>{if (!(event.target instanceof Element && event.target.closest('a, button'))) selectProject(i)}}><div className="card-surface"><div className="glass-sheen" aria-hidden="true"/></div><ProjectPreview reduceMotion={flat} project={p} active={preview?.id===p.id}/><div className="card-footer"><h3>{p.name}</h3></div><a className="card-site-arrow" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Открыть сайт ${p.name}`}><Arrow/></a><button className="preview-toggle" aria-label={`Preview ${p.name}`} aria-expanded={preview?.id===p.id} aria-controls={`inline-preview-${p.id}`} onClick={()=>setPreview(preview?.id===p.id?null:p)}>Preview <i aria-hidden="true"/></button></article>)}</div>
   <section id="skills" className="skills"><p className="eyebrow">03 / ИНСТРУМЕНТЫ</p><h2>Логика. Форма.<br/><span>Взаимодействие.</span></h2><div className="skill-orbit">{skills.filter(s=>s.show).map((s,i)=><div className={`skill skill-${i}`} key={s.id} tabIndex={0}><svg style={{fill:["#419dd6","#44b78b","#f7df1e","#e9673d","#f05032"][i]}} viewBox="0 0 24 24" aria-hidden="true"><path d={icons[i].path}/></svg><span>{s.name}</span></div>)}</div></section>
   <aside className="chapter-nav" aria-label="Этапы портфолио"><span className="chapter-current">01</span><div className="progress-track"><i className="progress-fill"/></div>{(['hero','projects','skills','contact'] as Section[]).map((s,i)=><button key={s} data-nav={s} onClick={()=>scrollTo(s)} aria-label={['Начало','Проекты','Навыки','Контакты'][i]}>{['Идеи','Проекты','Навыки','Контакты'][i]}</button>)}</aside>
   <footer className="stage-footer"><span>SUMBAT OGANIAN <i>—</i> PORTFOLIO</span><span className="scroll-hint">ЛИСТАЙТЕ, ЧТОБЫ ИССЛЕДОВАТЬ <Arrow down/></span>{!reduced&&!noGL&&<button className="motion-toggle" onClick={()=>{setStaticMode(!staticMode);window.scrollTo(0,0)}} aria-pressed={staticMode}>{staticMode?'Включить анимацию':'Без анимации'}</button>}</footer>
  </div></main>
  <PortraitJourney flat={flat}/>
 </div>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
