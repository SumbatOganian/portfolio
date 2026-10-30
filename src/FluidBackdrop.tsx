import {useEffect,useRef} from 'react';
// Fit actual glyph ink inside the canvas: font em boxes clip large capitals.
function paintGlyph(ctx:CanvasRenderingContext2D,glyph:string,w:number,h:number){
 ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.font='300 215px "Roboto Flex Variable"';
 let metrics=ctx.measureText(glyph);
 const padding=8;
 const size=215*Math.min(1,(h-padding*2)/(metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent));
 ctx.font=`300 ${size}px "Roboto Flex Variable"`;metrics=ctx.measureText(glyph);
 ctx.fillText(glyph,w/2,(h+metrics.actualBoundingBoxAscent-metrics.actualBoundingBoxDescent)/2,w-4);
}
// A continuously domain-warped colour field, drawn live without a video or a loop endpoint.
export function FluidBackdrop({still=false,glyph}:{still?:boolean,glyph?:string}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const canvas=ref.current!,ctx=canvas.getContext('2d');if(!ctx)return;
  if(still){if(!glyph)return;let alive=true;const paint=()=>{if(!alive)return;canvas.width=120;canvas.height=160;const gradient=ctx.createLinearGradient(0,0,120,160);gradient.addColorStop(0,'#c65e66');gradient.addColorStop(1,'#6d68bf');ctx.fillStyle=gradient;paintGlyph(ctx,glyph,120,160)};paint();document.fonts.ready.then(paint);return()=>{alive=false}}
  const w=glyph?120:160,h=glyph?160:100;canvas.width=w;canvas.height=h;const frame=ctx.createImageData(w,h),pixels=frame.data;let active=true,alive=true,raf=0,last=0;
  const observer=new IntersectionObserver(entries=>{active=entries[0].isIntersecting});observer.observe(canvas);
  function draw(ms:number){if(!alive)return;raf=requestAnimationFrame(draw);if(!active||document.hidden||ms-last<33)return;last=ms;const t=ms*.001;
   for(let y=0;y<h;y++){const ny=y/h*2-1;for(let x=0;x<w;x++){const nx=x/w*2-1;
    const qx=nx+.44*Math.sin(ny*2.6+t*.61)+.22*Math.cos(nx*3.4-t*.39);
    const qy=ny+.38*Math.sin(nx*2.7-t*.53)+.18*Math.cos(ny*3.7+t*.47);
    const a=.5+.5*Math.sin(qx*2.9+qy*1.8+t*.57),b=.5+.5*Math.sin(qy*3.1-qx*2.0-t*.67),c=.5+.5*Math.cos(qx*1.7+qy*2.3+t*.42);
    const i=(y*w+x)*4;pixels[i]=36+155*a+19*c;pixels[i+1]=28+40*a+27*b;pixels[i+2]=48+111*b+28*(1-a)*c;pixels[i+3]=255;
   }}ctx!.putImageData(frame,0,0);
   if(glyph){ctx!.globalCompositeOperation='destination-in';ctx!.fillStyle='#fff';paintGlyph(ctx!,glyph,w,h);ctx!.globalCompositeOperation='source-over';}
  }
  raf=requestAnimationFrame(draw);return()=>{alive=false;cancelAnimationFrame(raf);observer.disconnect()};
 },[still,glyph]);
 if(glyph)return <canvas ref={ref} className="initial-glyph-canvas" aria-hidden="true"/>;
 return <div className="fluid-backdrop" aria-hidden="true"><canvas ref={ref}/><div className="fluid-shade"/><div className="fluid-noise"/></div>;
}
