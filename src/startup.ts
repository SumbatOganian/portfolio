const stages=['interface','fonts','engine','sculpture','rocks','albedo','height','environment','frame'] as const;
export type StartupStage=typeof stages[number];
const done=new Set<StartupStage>();let finished=false;
export function startupFinished(){return finished}
export function startupStep(stage:StartupStage){
 if(finished)return;done.add(stage);
 const progress=Math.round(done.size/stages.length*100),loader=document.getElementById('site-loader');
 loader?.style.setProperty('--load',String(progress/100));
 const number=document.getElementById('load-percent');if(number)number.textContent=String(progress).padStart(2,'0');
 document.getElementById('load-progress')?.setAttribute('aria-valuenow',String(progress));
 if(done.size!==stages.length)return;
 finished=true;document.documentElement.removeAttribute('data-startup-loading');
 const root=document.getElementById('root');if(root){root.inert=false;root.setAttribute('aria-busy','false')}
 loader?.setAttribute('data-ready','true');
 const status=document.getElementById('load-status');if(status)status.textContent='Сайт готов';
 setTimeout(()=>loader?.remove(),550);
}
export function visualStartupReady(){(['engine','sculpture','rocks','albedo','height','environment','frame'] as StartupStage[]).forEach(startupStep)}
