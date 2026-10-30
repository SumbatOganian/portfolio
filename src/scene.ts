import {assetUrl} from './assetUrl';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
type Motion={progress:number,pointerX:number,pointerY:number,mobile:boolean};
const clamp=(v:number)=>Math.min(1,Math.max(0,v));
const smooth=(v:number)=>{v=clamp(v);return v*v*(3-2*v)};
export async function createScene(canvas:HTMLCanvasElement,motion:Motion,fail:()=>void){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<1024?1.25:1.6));renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,innerWidth/innerHeight,.1,80);camera.position.set(0,0,10.6);
 const studio=new T.Scene();studio.background=new T.Color('#090b0d');
 function panel(x:number,y:number,z:number,w:number,h:number,color:number,intensity:number){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(intensity),side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);studio.add(m)}
 panel(-4,3,2,1.1,9,0xf0f2f5,7);panel(4,2,1,.7,8,0xffffff,9);panel(0,5,-2,8,1,0xffffff,7);panel(1,-4,3,6,.55,0xd6dce5,4);panel(-2,0,-5,.8,8,0xffffff,6);
 panel(3,0,-4,2.2,5,0xb5bdc9,2.5);panel(-3,-2,2,3.8,.5,0xe7dcd1,1.8);panel(0,1,5,.18,5,0xffffff,4);
 const pmrem=new T.PMREMGenerator(renderer);let env=pmrem.fromScene(studio,.025);scene.environment=env.texture;pmrem.dispose();studio.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(o.material as T.Material).dispose()}});
 scene.add(new T.AmbientLight(0xcbd1da,.22));const key=new T.DirectionalLight(0xe6ebf1,3.8);key.position.set(-3,6,4);scene.add(key);const rim=new T.DirectionalLight(0xf1f1ec,4.2);rim.position.set(4,4,-2);scene.add(rim);const fill=new T.DirectionalLight(0x899bb4,.6);fill.position.set(1,-2,4);scene.add(fill);
 const loader=new GLTFLoader(),textureLoader=new T.TextureLoader();
 const [sculpture,rocks,albedo,height,hdr]=await Promise.all([loader.loadAsync(assetUrl('/models/chrome_sculpture.glb')),loader.loadAsync(assetUrl('/models/floating_rocks.glb')),textureLoader.loadAsync(assetUrl('/textures/basalt-albedo.webp')),textureLoader.loadAsync(assetUrl('/textures/basalt-height.png')),new HDRLoader().loadAsync(assetUrl('/environment/studio_small_09_1k.hdr'))]).catch(e=>{renderer.dispose();env.dispose();throw e});
 const hdrPMREM=new T.PMREMGenerator(renderer);const photoEnvironment=hdrPMREM.fromEquirectangular(hdr);hdrPMREM.dispose();hdr.dispose();env.dispose();env=photoEnvironment;scene.environment=env.texture;scene.environmentRotation.set(0,1.35,0);
 albedo.colorSpace=T.SRGBColorSpace;[albedo,height].forEach(t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1.6,1.6);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())});
 const object=sculpture.scene,stones=rocks.scene;scene.add(object,stones);
 object.traverse(o=>{if(o instanceof T.Mesh){const m=o.material as T.MeshStandardMaterial;m.envMapIntensity=.95;m.roughness=.105;m.metalness=1;}});
 const rockSource=stones.children[0];const extraPositions=[[-4.1,1.6,1,.40],[-3.7,-1.6,2,.48],[-1.5,2.5,-1,.19],[1.3,2.7,-.5,.19],[2.8,2.35,-.8,.28],[3.9,1.1,.5,.32],[.3,-2.6,.5,.25],[-.7,.3,-3,.14],[2.7,-1.9,-2,.2],[-2.6,-2.3,-1,.3],[-4.3,-3.1,3,.75],[4.4,2.9,1,.43]];
 extraPositions.forEach(([x,y,z,scale],i)=>{const rock=rockSource.clone();rock.position.set(x,y,z);rock.scale.set(scale,scale*(.75+i%3*.13),scale*.83);rock.rotation.set(i*.51,i*.73,i*.19);stones.add(rock)});
 const rockBases=new Map<T.Object3D,T.Vector3>();stones.children.forEach(o=>{rockBases.set(o,o.position.clone());o.traverse(c=>{if(c instanceof T.Mesh){const m=c.material as T.MeshStandardMaterial;m.color.set('#5d6064');m.map=albedo;m.bumpMap=height;m.bumpScale=.15;m.roughness=.73;m.metalness=.07;m.envMapIntensity=.45;}})});
 // Fine orbital filaments are true curves, placed around the chrome volume.
 const orbits=new T.Group();object.add(orbits);
 for(let i=0;i<2;i++){const points=[];for(let j=0;j<=220;j++){const a=j/220*Math.PI*2;points.push(new T.Vector3(Math.cos(a)*(i?2.6:2.9),Math.sin(a)*.72,0))}const g=new T.BufferGeometry().setFromPoints(points);const line=new T.Line(g,new T.LineBasicMaterial({color:i?0x7f8a99:0xc4c8cd,transparent:true,opacity:i?.3:.55}));line.rotation.set(i?.9:.45,i?-.6:.1,i?-.28:.33);orbits.add(line)}
 // A localized translucent light plume behind the installation; no star field.
 const hazeMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float uTime;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}void main(){vec2 p=vUv;float n=0.,a=.5;vec2 q=p*7.;for(int i=0;i<5;i++){n+=noise(q)*a;q=q*2.03+2.1;a*=.5;}float beam=exp(-pow((p.x-.60-p.y*.11)*12.,2.))*smoothstep(.05,.85,p.y);float edge=smoothstep(0.,.2,p.x)*smoothstep(1.,.8,p.x);float alpha=beam*(.04+n*.30)*edge;gl_FragColor=vec4(vec3(.67,.72,.78),alpha);}`});
 const haze=new T.Mesh(new T.PlaneGeometry(18,15),hazeMaterial);haze.position.set(0,0,-6);scene.add(haze);
 // Small angular shards provide depth along the beam instead of luminous particles.
 const fragments=new T.Group(),fragmentGeometry=new T.IcosahedronGeometry(1,0),fragmentMaterial=new T.MeshStandardMaterial({color:0x292b2e,roughness:.7,map:albedo});
 for(let i=0;i<26;i++){const mesh=new T.Mesh(fragmentGeometry,fragmentMaterial);const t=i*2.399;mesh.position.set(1.6+Math.sin(t)*(1.5+(i%4)*.3),Math.cos(t*1.3)*3.3,-.8-(i%5)*.6);mesh.scale.setScalar(.018+(i%4)*.014);mesh.rotation.set(t,t*.7,t*.3);fragments.add(mesh)}scene.add(fragments);
 let inView=true;const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting});observer.observe(canvas);
 let raf=0,visible=true,alive=true,px=0,py=0,last=0;
 const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()};resize();
 const contextLost=(e:Event)=>{e.preventDefault();fail()};canvas.addEventListener('webglcontextlost',contextLost);
 const visibility=()=>{visible=!document.hidden};document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',resize);
 function draw(time:number){if(!alive)return;raf=requestAnimationFrame(draw);if(!visible||!inView)return;
  const dt=Math.min((time-last)/1000,.05);last=time;px=T.MathUtils.damp(px,motion.pointerX,4,dt);py=T.MathUtils.damp(py,motion.pointerY,4,dt);
  const p=motion.progress,mobile=innerWidth<1024,retreat=smooth((p-.13)/.26),close=0;
  object.position.set(mobile?.35:1.90*(1-retreat)+.3*close,mobile?-1.42+1.2*smooth(p/.18):.05,-retreat*3);
  const scale=mobile?.68:1.19;object.scale.setScalar(scale*(1-retreat*.38+close*.12));object.rotation.set(.04+py*.06+p*.65,-.13+px*.11+p*1.45,-.13+p*.33);
  object.visible=p<.77;stones.scale.setScalar(mobile?.76:1.14);
  stones.children.forEach((o,i)=>{const b=rockBases.get(o)!;o.position.set(b.x+px*(i>8?.055:.035)*(i%3+1),b.y+py*.04-p*(i%3+1)*.11,b.z);o.rotation.x+=dt*.003*(i%2?1:-1);if(mobile&&i===0)o.position.set(-2.5,.3,-1);if(mobile&&i===9)o.position.set(4.2,-4.0,-.5);if(mobile&&i===10)o.position.set(-3.8,-3.7,.3)});
  orbits.rotation.y=px*.03;fragments.position.set(px*.035,py*.025-p*.4,0);hazeMaterial.uniforms.uTime.value=time*.001;
  renderer.render(scene,camera);
 }
 raf=requestAnimationFrame(draw);
 return()=>{observer.disconnect();alive=false;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line){o.geometry.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m.dispose())}});albedo.dispose();height.dispose();env.dispose();renderer.dispose()};
}
