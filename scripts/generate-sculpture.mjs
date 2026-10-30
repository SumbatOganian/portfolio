// Original interlaced chrome ribbons and fractured basalt geometry.
import * as T from 'three';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import fs from 'node:fs/promises';
globalThis.FileReader=class {readAsArrayBuffer(blob){blob.arrayBuffer().then(b=>{this.result=b;this.onloadend?.();});}};
const scene=new T.Scene();
const chrome=new T.MeshStandardMaterial({color:0xe3e5e8,metalness:1,roughness:.085});
for(let k=0;k<3;k++){
 const pos=[],idx=[],n=380,m=28;
 const centers=[];
 for(let i=0;i<n;i++){
  const t=i/n*Math.PI*2;
  centers.push(new T.Vector3((1.23+.15*Math.sin(t*2+k))*Math.cos(t),1.9*Math.sin(t),.29*Math.sin(2*t+k*1.8)+.12*Math.cos(3*t)));
 }
 for(let i=0;i<n;i++){
  const t=i/n*Math.PI*2,center=centers[i];
  const tangent=centers[(i+1)%n].clone().sub(centers[(i+n-1)%n]).normalize();
  const normal=new T.Vector3(Math.cos(t),Math.sin(t),0).normalize();
  const binormal=new T.Vector3().crossVectors(tangent,normal).normalize();normal.crossVectors(binormal,tangent).normalize();
  const twist=.65*Math.sin(t+k*1.7)+.28*Math.sin(t*3),w=(k===0?.32:k===1?.26:.18)*(1+.5*Math.sin(t*2+k)),d=.085;
  for(let j=0;j<m;j++){
   const a=j/m*Math.PI*2;
   const u=Math.cos(a)*w,v=Math.sin(a)*d+.018*Math.sin(a*2+t*5+k*1.9);
   const p=center.clone().addScaledVector(normal,u*Math.cos(twist)-v*Math.sin(twist)).addScaledVector(binormal,u*Math.sin(twist)+v*Math.cos(twist));
   pos.push(p.x,p.y,p.z);
   const a0=i*m+j,b=i*m+(j+1)%m,c=((i+1)%n)*m+j,e=((i+1)%n)*m+(j+1)%m;idx.push(a0,b,c,b,e,c);
  }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 const mesh=new T.Mesh(g,chrome);mesh.rotation.set([.12,.9,-.7][k],[-.25,.9,-.9][k],[-.40,.62,1.0][k]);mesh.name=`sculptural_ribbon_${k+1}`;scene.add(mesh);
}
const core=new T.Mesh(new T.SphereGeometry(.29,48,32),chrome);core.position.set(0,.10,.14);core.name='mercury_core';scene.add(core);
await fs.mkdir('public/models',{recursive:true});
const glb=await new GLTFExporter().parseAsync(scene,{binary:true});await fs.writeFile('public/models/chrome_sculpture.glb',Buffer.from(glb));console.log('Sculpture:',glb.byteLength);
const rocks=new T.Scene();
const positions=[[-.8,2.25,-.5],[.6,2.8,-2.5],[3.6,1.65,-1.3],[3.15,-.4,.3],[-1.35,-1.45,-.3],[-2.5,-2.4,-3],[.7,-2.35,-1.8],[3.95,.45,-1.1],[-.4,2.5,-3.6],[3.3,-2.3,1.1],[-4.2,-3.15,1.5]];
const noise=(x,y,z)=>Math.sin(x*4.7+y*1.4)*Math.cos(y*5.2-z*2.5)*Math.sin(z*3.7+x*1.5);
for(let i=0;i<positions.length;i++){
 const foreground=i>8;
 let g=mergeVertices(new T.IcosahedronGeometry(1,foreground?18:12));const a=g.attributes.position;
 for(let j=0;j<a.count;j++){
  const x=a.getX(j),y=a.getY(j),z=a.getZ(j),seed=i*5.31;
  const f=1+.23*noise(x+seed,y,z)+.10*noise(x*2.8,y*2.8+seed,z*2.8)+.035*noise(x*7,y*7,z*7+seed);
  const fracture=foreground?.065*noise(x*11+seed,y*11,z*11):0;
  a.setXYZ(j,foreground?x*(f+fracture):Math.min(.86,x*f),y*(f+fracture),z*(f+fracture));
 }
 g.computeVertexNormals();
 const mesh=new T.Mesh(g,new T.MeshStandardMaterial({color:0x5c5d60,roughness:.83,metalness:.06}));mesh.position.fromArray(positions[i]);
 if(i===9){mesh.scale.set(3.7,1.4,1.7);mesh.rotation.set(.1,-.3,.55)}else if(i===10){mesh.scale.set(1.8,.7,1);mesh.rotation.set(.2,.5,-.2)}else{const s=[.38,.12,.21,.35,.31,.13,.2,.25,.1][i];mesh.scale.set(s*(1+i%3*.14),s,s*.8);mesh.rotation.set(i*.37,i*.71,i*.23)}
 mesh.name=`basalt_${i}`;rocks.add(mesh);
}
const rockGLB=await new GLTFExporter().parseAsync(rocks,{binary:true});await fs.writeFile('public/models/floating_rocks.glb',Buffer.from(rockGLB));console.log('Basalt:',rockGLB.byteLength);
