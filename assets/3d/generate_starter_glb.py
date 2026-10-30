#!/usr/bin/env python3
"""Create editable lightweight 3D *starter* assets using trimesh + numpy.
Run: python assets/3d/generate_starter_glb.py
The result is intentionally a topology/layout draft, NOT the final approved hero sculpture.
Chrome needs an environment map and lighting in Three.js to look reflective.
"""
from pathlib import Path
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

BASE=Path(__file__).resolve().parent
RNG=np.random.default_rng(20261030)

CHROME=PBRMaterial(name='Cool Polished Chrome', baseColorFactor=[215,227,245,255], metallicFactor=1.0, roughnessFactor=0.13, doubleSided=True)
STONE=PBRMaterial(name='Charcoal rock', baseColorFactor=[20,24,30,255], metallicFactor=0.03, roughnessFactor=0.91, doubleSided=True)

def rotation(axis, degrees):
    a=np.radians(degrees)
    x,y,z=np.array(axis,dtype=float)/np.linalg.norm(axis)
    c,s=np.cos(a),np.sin(a)
    return np.array([[c+x*x*(1-c), x*y*(1-c)-z*s, x*z*(1-c)+y*s],
                     [y*x*(1-c)+z*s, c+y*y*(1-c), y*z*(1-c)-x*s],
                     [z*x*(1-c)-y*s, z*y*(1-c)+x*s, c+z*z*(1-c)]])

def tube_loop(major=1.58, minor=1.05, thick=.19, tilt=0, phase=0, yaw=0):
    n,m=320,22
    t=np.linspace(0,2*np.pi,n,endpoint=False)
    p=np.column_stack([major*np.cos(t),minor*np.sin(t),.29*np.sin(3*t+phase)])
    R=rotation([1,1,0],tilt) @ rotation([0,1,0],yaw)
    p=p @ R.T
    tangent=np.roll(p,-1,axis=0)-np.roll(p,1,axis=0)
    tangent/=np.linalg.norm(tangent,axis=1)[:,None]
    world=np.array([0,0,1.0]); normal=np.cross(tangent,world)
    bad=np.linalg.norm(normal,axis=1)<.1
    normal[bad]=np.cross(tangent[bad],np.array([0,1,0.0]))
    normal/=np.linalg.norm(normal,axis=1)[:,None]
    binorm=np.cross(tangent,normal)
    ang=np.linspace(0,2*np.pi,m,endpoint=False)
    rad=thick*(1+.075*np.sin(4*t+phase))
    verts=(p[:,None,:]+rad[:,None,None]*(np.cos(ang)[None,:,None]*normal[:,None,:]+np.sin(ang)[None,:,None]*binorm[:,None,:])).reshape(-1,3)
    faces=[]
    for i in range(n):
        for j in range(m):
            a=i*m+j; b=i*m+(j+1)%m; c=((i+1)%n)*m+j; d=((i+1)%n)*m+(j+1)%m
            faces.extend([[a,c,b],[b,c,d]])
    mesh=trimesh.Trimesh(vertices=verts,faces=faces,process=False)
    mesh.visual=trimesh.visual.TextureVisuals(material=CHROME)
    return mesh

sculpt=trimesh.Scene()
for i,(tilt,phase,yaw,offset) in enumerate([(22,.0,10,[0,.08,0]),(-54,1.5,35,[.05,-.09,0]),(70,2.8,-18,[-.08,0,.02])]):
    sculpt.add_geometry(tube_loop(tilt=tilt,phase=phase,yaw=yaw),node_name=f'chrome_loop_{i+1}',transform=trimesh.transformations.translation_matrix(offset))
sculpt.export(BASE/'chrome_sculpture_STARTER.glb')

rocks=trimesh.Scene()
positions=[(-2.55,.6,-.5),(-1.95,1.7,-1.2),(2.3,1,-1.0),(2.8,-.95,-1.5),(-3,-1.3,-2.0),(.4,2.25,-2.4),(1.5,-2.05,-2.1),(-.9,-2.2,-3.0),(3.2,.1,-3.6)]
for i,pos in enumerate(positions):
    mesh=trimesh.creation.icosphere(subdivisions=1,radius=float(RNG.uniform(.18,.5)))
    mesh.vertices*=RNG.uniform(.80,1.24,size=(len(mesh.vertices),1))
    mesh.apply_transform(trimesh.transformations.rotation_matrix(float(RNG.uniform(-1.5,1.5)),RNG.normal(size=3)))
    mesh.visual=trimesh.visual.TextureVisuals(material=STONE)
    rocks.add_geometry(mesh,node_name=f'rock_{i+1}',transform=trimesh.transformations.translation_matrix(pos))
rocks.export(BASE/'floating_rocks_STARTER.glb')
for f in [BASE/'chrome_sculpture_STARTER.glb',BASE/'floating_rocks_STARTER.glb']:
    scene=trimesh.load(f,force='scene'); print(f.name, f.stat().st_size,'bytes',len(scene.geometry),'meshes')
