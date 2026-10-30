import {assetUrl} from './assetUrl';
import {useEffect,useRef,useState} from 'react';
import type projects from '../data/projects.json';
import './preview.css';
type Project=(typeof projects)[number];
export function ProjectPreview({project,reduceMotion=false,active=false}:{project:Project,reduceMotion?:boolean,active?:boolean}){
 const screen=useRef<HTMLDivElement>(null),image=useRef<HTMLImageElement>(null),animation=useRef<Animation|null>(null);
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[playing,setPlaying]=useState(active&&!reduceMotion);const playingRef=useRef(playing);
 useEffect(()=>{if(!active||!ready||!image.current||!screen.current)return;const img=image.current,viewport=screen.current;
  const start=()=>{const distance=Math.max(0,img.offsetHeight-viewport.clientHeight);animation.current?.cancel();animation.current=img.animate([{transform:'translateY(0)',offset:0},{transform:'translateY(0)',offset:.05,easing:'ease-in-out'},{transform:`translateY(-${distance}px)`,offset:.95},{transform:`translateY(-${distance}px)`,offset:1}],{duration:Math.max(14000,Math.min(35000,distance*9)),iterations:Infinity,direction:'alternate',easing:'linear'});if(!playingRef.current)animation.current.pause()};start();const observer=new ResizeObserver(start);observer.observe(viewport);observer.observe(img);return()=>{observer.disconnect();animation.current?.cancel()};
 },[ready,active]);
 useEffect(()=>{setPlaying(active&&!reduceMotion)},[active,reduceMotion]);
 useEffect(()=>{playingRef.current=playing;if(playing)animation.current?.play();else animation.current?.pause()},[playing]);
 return <div id={`inline-preview-${project.id}`} className={`inline-preview ${active?'is-playing':'is-idle'}`} aria-label={`Preview ${project.name}`}><div className="inline-browser-bar"><i/><i/><i/><span>{new URL(project.url).hostname}</span></div><div ref={screen} className={`inline-screen ${reduceMotion?'inline-manual':''}`}><img className="inline-poster" src={assetUrl(project.desktopPreview)} alt={`Первый экран сайта ${project.name}`} loading="lazy" hidden={active&&ready&&!failed}/>{active&&!ready&&!failed&&<span className="inline-loading">Загрузка…</span>}{active&&(failed?<span className="inline-loading">Превью недоступно</span>:<img className="inline-scroll-image" ref={image} src={assetUrl(`/project-scrolls/${project.id}.webp`)} width="1440" alt={`Полная страница сайта ${project.name}`} onLoad={()=>setReady(true)} onError={()=>setFailed(true)}/>)}</div>{active&&<button className="inline-pause" disabled={!ready} onClick={()=>setPlaying(!playing)} aria-label={playing?'Приостановить Preview':'Продолжить Preview'} aria-pressed={playing}>{playing?'Ⅱ':'▷'}</button>}</div>;
}
