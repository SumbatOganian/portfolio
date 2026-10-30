import {assetUrl} from './assetUrl';
import {Fragment,useEffect,useRef} from 'react';
import gsap from 'gsap';import {ScrollTrigger} from 'gsap/ScrollTrigger';
import config from '../data/site-config.json';
import {ScrollTypeText} from './ScrollTypeText';
import {SocialLinks} from './SocialLinks';import {FluidBackdrop} from './FluidBackdrop';
import './portrait.css';
const storyLines=[['Меня вдохновляет то, как технологии','меняют привычные вещи.'],['Я постоянно учусь —','и превращаю любопытство в код.'],['Хочу создавать продукты,','которые делают чью-то жизнь лучше.']];
const clamp=(v:number)=>Math.max(0,Math.min(1,v));const ease=(v:number)=>{v=clamp(v);return v*v*(3-2*v)};
function LetterWords({text}:{text:string}){return <>{text.split(' ').map((word,i)=><Fragment key={i}><span className="scramble-word">{Array.from(word).map((char,j)=><span className="scramble-char" key={j}>{char}</span>)}</span>{' '}</Fragment>)}</>}
function permutation(n:number,seed:number){const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){seed=(seed*1664525+1013904223)>>>0;const j=seed%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
export function PortraitJourney({flat}:{flat:boolean}){
 const track=useRef<HTMLElement>(null),stage=useRef<HTMLDivElement>(null),rail=useRef<HTMLDivElement>(null),finale=useRef<HTMLElement>(null),signature=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{let alive=true;const fit=()=>{const el=signature.current;if(!el)return;el.style.fontSize='100px';const natural=[...el.children].reduce((sum,child)=>sum+child.getBoundingClientRect().width,0)+10;el.style.fontSize=`${100*(el.parentElement!.clientWidth-2)/natural}px`};fit();document.fonts.ready.then(()=>{if(alive)fit()});window.addEventListener('resize',fit);return()=>{alive=false;window.removeEventListener('resize',fit)}},[]);
 useEffect(()=>{
  const root=stage.current!;
  if(flat){root.querySelectorAll<HTMLElement>('[data-animate],.scramble-char,.about-type-char').forEach(el=>el.removeAttribute('style'));rail.current!.style.removeProperty('transform');finale.current!.inert=false;delete finale.current!.dataset.scrollTarget;delete root.dataset.pan;return;}
  const photo=root.querySelector<HTMLElement>('.portrait-frame')!,image=root.querySelector<HTMLImageElement>('.portrait-frame .portrait-subject')!,text=root.querySelector<HTMLElement>('.personal-intro')!,about=root.querySelector<HTMLElement>('.portrait-about')!;
  const typingLetters=[...about.querySelectorAll<HTMLElement>('.about-type-char')],caret=about.querySelector<HTMLElement>('.about-caret')!,colour=root.querySelector<HTMLElement>('.portrait-colour-underlay')!,negative=root.querySelector<HTMLElement>('.portrait-negative-layer')!;
  const greyWeights=typingLetters.map(()=>100);
  const cursor={p:0};let alive=true,arrival=0,shown=-1;
  function typeAbout(count:number){
   if(count===shown)return;
   if(shown<0)typingLetters.forEach((letter,i)=>letter.style.opacity=i<count?'1':'0');
   else for(let i=Math.min(shown,count);i<Math.max(shown,count);i++)typingLetters[i].style.opacity=i<count?'1':'0';
   shown=count;about.dataset.typed=String(count);about.dataset.total=String(typingLetters.length);
   const letter=typingLetters[Math.max(0,count-1)],range=document.createRange();
   range.setStart(letter.firstChild!,count?letter.textContent!.length:0);range.collapse(true);
   let rect=range.getBoundingClientRect();if(!rect.height)rect=(typingLetters[Math.min(count,typingLetters.length-1)]).getBoundingClientRect();
   const box=about.getBoundingClientRect(),height=Math.max(12,rect.height*.8);
   caret.style.left=`${rect.left-box.left+1}px`;caret.style.top=`${rect.top-box.top+(rect.height-height)/2}px`;caret.style.height=`${height}px`;
  }
  let chars:Array<{el:HTMLElement,a:number,b:number,order:number,seed:number}>=[];
  function measure(){
   shown=-1;chars=[];let order=0;
   root.querySelectorAll<HTMLElement>('[data-sentence]').forEach((sentence,si)=>{
    const members:Array<{el:HTMLElement,a:number,b:number,order:number,seed:number}>=[];
    sentence.querySelectorAll<HTMLElement>('.scramble-word').forEach((word,wi)=>{const letters=[...word.querySelectorAll<HTMLElement>('.scramble-char')],a=permutation(letters.length,si*917+wi*73+5),b=permutation(letters.length,si*471+wi*133+93);letters.forEach((el,i)=>members.push({el,a:letters[a[i]].offsetLeft-el.offsetLeft,b:letters[b[i]].offsetLeft-el.offsetLeft,order:0,seed:(si*31+wi*17+i*11)}))});
    members.forEach((c,i)=>c.order=order+members.length-1-i);order+=members.length;chars.push(...members);
   });render(cursor.p);
  }
  function render(progress:number){
   root.dataset.progress=progress.toFixed(4);
   // Keep the original approach distance, type after the photo settles, then travel right.
   const p=clamp(progress/.6),pan=ease((progress-.85)/.15);
   root.dataset.pan=pan.toFixed(4);
   rail.current!.style.transform=`translate3d(${-root.clientWidth*pan}px,0,0)`;
   finale.current!.inert=pan<.995;
   finale.current!.dataset.scrollTarget=String(track.current!.offsetTop+track.current!.offsetHeight-root.clientHeight);
   const assemble=arrival;root.dataset.arrival=arrival.toFixed(4);
   chars.forEach(c=>{
    const k=clamp(assemble*2);const x=assemble<.5?c.a+(c.b-c.a)*ease(k):c.b*(1-ease((assemble-.5)*2));
    const f=ease((p-.025-c.order*.00105)/.145),seed=c.seed;
    const dx=Math.sin(seed*1.91)*innerWidth*.28*f+Math.cos(seed*.37)*innerWidth*.16*f*f;
    const dy=-(innerHeight*(.17+.27*(Math.sin(seed*.63)*.5+.5)))*f+Math.sin(f*3+seed)*35*f;
    c.el.style.transform=`translate3d(${x+dx}px,${dy}px,0) rotate(${Math.sin(seed)*f*32}deg) scale(${1+f*.25})`;
    c.el.style.opacity=String(Math.pow(1-f,1.65));c.el.style.filter=f>.01&&f<.99?`blur(${f*7}px)`:'none';
   });
   const zoom=ease(p/.72),mobile=innerWidth<700;
   photo.style.width=`${(mobile?innerWidth*.70:Math.min(innerWidth*.39,590))*(1-zoom)+innerWidth*zoom}px`;
   photo.style.height=`${innerHeight*(.72*(1-zoom)+zoom)}px`;
   photo.style.transform=`translate(-50%,-50%) translateZ(${Math.sin(zoom*Math.PI)*35}px) rotateX(${-Math.sin(zoom*Math.PI)*14}deg) rotateY(${-Math.sin(zoom*Math.PI)*4}deg) rotateZ(${-5*(1-zoom)}deg)`;
   photo.style.filter=`brightness(${.24+.76*ease(p/.50)})`;
   image.style.objectPosition=`${50-zoom*(mobile?15:0)}% ${35-zoom*20}%`;
   image.style.transform='none';
   text.style.visibility=p>.43?'hidden':'visible';
   const aboutReveal=ease((progress-.435)/.02);about.style.opacity=String(aboutReveal);about.style.visibility=aboutReveal<.005?'hidden':'visible';
   const typed=clamp((progress-.46)/.33);
   typeAbout(Math.floor(typed*typingLetters.length));
   // Reveal only the visible right gutter, so colour arrives throughout typing
   // rather than finishing early behind the opaque central photograph.
   const width=root.clientWidth,height=root.clientHeight,aspect=image.naturalWidth/image.naturalHeight||Number(image.getAttribute('width'))/Number(image.getAttribute('height'));
   const subjectWidth=mobile?Math.max(width,height*aspect):Math.min(width,height*aspect);
   const gutter=Math.max(0,(width-subjectWidth)/2),band=gutter>1?gutter:width/2;
   const inset=typed>=1?0:100*(1-band*typed/(width/2));
   colour.style.clipPath=`inset(0 0 0 ${inset.toFixed(4)}%)`;
   colour.dataset.reveal=typed.toFixed(4);
   // Grey the typed story backwards while the column is still passing through view.
   const textExitEnd=Math.max(.14,Math.min(.55,(about.offsetLeft+about.offsetWidth)/width*.55));
   const textExit=clamp(pan/textExitEnd);
   typingLetters.forEach((letter,i)=>{
    const order=(typingLetters.length-1-i)/(typingLetters.length-1);
    const weight=Math.round((1-ease((textExit*1.16-order)/.16))*1000)/10;
    if(weight!==greyWeights[i]){letter.style.setProperty('--type-ink-weight',`${weight}%`);greyWeights[i]=weight}
   });
   about.dataset.exiting=String(pan>.001);
   // A soft negative advances only through the trailing part of the actual photo.
   const visibleSubject=Math.min(width,subjectWidth),rightEdge=Math.min(width,(width+subjectWidth)/2);
   const negativeWidth=visibleSubject*.65*ease(pan/.45),feather=Math.max(24,visibleSubject*.12);
   negative.style.setProperty('--negative-clear',`${rightEdge-negativeWidth}px`);
   negative.style.setProperty('--negative-full',`${rightEdge-negativeWidth+feather}px`);
   negative.style.visibility=pan>.001?'visible':'hidden';
   negative.dataset.band=negativeWidth.toFixed(2);
  }
  const incoming=ScrollTrigger.create({trigger:track.current,start:'top 80%',end:'top top',onUpdate:self=>{arrival=self.progress;render(cursor.p)},onRefresh:self=>{arrival=self.progress;render(cursor.p)}});
  const tween=gsap.to(cursor,{p:1,ease:'none',onUpdate:()=>render(cursor.p)});const st=ScrollTrigger.create({trigger:track.current,start:'top top',end:'bottom bottom',scrub:.6,animation:tween,onRefresh:measure});
  measure();document.fonts.ready.then(()=>{if(alive){measure();ScrollTrigger.refresh()}});const resize=()=>measure();window.addEventListener('resize',resize);
  return()=>{alive=false;incoming.kill();st.kill();tween.kill();window.removeEventListener('resize',resize)};
 },[flat]);
 return <><section ref={track} id="person" className={`portrait-journey ${flat?'journey-static':''}`} aria-label="Человек за кодом"><div ref={stage} className="journey-stage"><div ref={rail} className="journey-rail"><div className="portrait-panel">
  <figure className="portrait-frame" data-animate><img className="portrait-defocused" src={assetUrl('/portrait/sumbat-original.webp')} alt="" aria-hidden="true"/><div className="portrait-colour-underlay" aria-hidden="true" data-animate><FluidBackdrop still={flat}/></div><picture><source media="(max-width:699px)" srcSet={assetUrl('/portrait/sumbat-original.webp')}/><img className="portrait-subject" src={assetUrl('/portrait/sumbat-chest.webp')} alt="Сумбат Оганян, портрет у окна" width="1400" height="1380" loading="lazy"/></picture><picture className="portrait-negative-layer" aria-hidden="true" data-animate><source media="(max-width:699px)" srcSet={assetUrl('/portrait/sumbat-original.webp')}/><img className="portrait-negative" src={assetUrl('/portrait/sumbat-chest.webp')} alt="" width="1400" height="1380" loading="lazy"/></picture></figure>
  <section className="portrait-about" aria-labelledby="about-title" data-animate><p className="about-label">{config.about.label}</p><h2 id="about-title"><ScrollTypeText text={config.about.title}/></h2><div className="about-body">{config.about.paragraphs.map(paragraph=><p key={paragraph}><ScrollTypeText text={paragraph}/></p>)}</div><span className="about-caret" aria-hidden="true"/></section>
  <div className="personal-intro" data-animate><h2 className="personal-title" data-sentence aria-label="ВСЕГДА В ДВИЖЕНИИ"><span aria-hidden="true"><LetterWords text="ВСЕГДА В ДВИЖЕНИИ"/></span></h2><div className="personal-copy">{storyLines.map((lines,i)=><p className={`stair-sentence stair-${i}`} data-sentence aria-label={lines.join(' ')} key={i}><span aria-hidden="true">{lines.map((line,j)=><span className={`stair-line line-${j}`} key={line}><LetterWords text={line}/></span>)}</span></p>)}</div></div>
 </div><footer ref={finale} id="contact" role="contentinfo" inert={!flat} className={`contact-finale ${flat?'finale-static':''}`}><FluidBackdrop still={flat}/><div className="final-bottom"><h2 ref={signature} className="signature" aria-label="Sumbat Oganian"><span>Sumbat</span><span>Oganian</span></h2><div className="final-links"><SocialLinks/><button className="back-to-start" onClick={()=>window.scrollTo({top:0,behavior:flat?'instant':'smooth'})} aria-label="Вернуться в начало"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 40V8M9 23 24 8l15 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div></div></footer></div></div></section></>;
}
