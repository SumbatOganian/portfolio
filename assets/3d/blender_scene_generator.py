"""Blender 4.x/5.x: run in Scripting (or: blender -b -P blender_scene_generator.py).
Creates TWO real .glb assets near this script. Generated geometry is a starting point
and requires a deliberate artistic pass to reach the approved reference.
"""
import bpy, math, random
from mathutils import Vector
from pathlib import Path

random.seed(30)
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)

def material(name, base=(.72,.79,.88,1), metal=1.0, rough=.13):
    mat=bpy.data.materials.new(name); mat.use_nodes=True
    node=mat.node_tree.nodes.get('Principled BSDF')
    node.inputs['Base Color'].default_value=base
    node.inputs['Metallic'].default_value=metal
    node.inputs['Roughness'].default_value=rough
    return mat
chrome=material('MirrorChrome',(.72,.80,.89,1),1.0,.12)
rockmat=material('CharcoalStone',(.035,.042,.05,1),.02,.91)

def loop(name, rx, ry, angle_x, angle_y, phase):
    cv=bpy.data.curves.new(name=name,type='CURVE'); cv.dimensions='3D'
    cv.resolution_u=24; cv.bevel_depth=.18; cv.bevel_resolution=5
    spline=cv.splines.new('BEZIER'); count=12
    spline.bezier_points.add(count-1)
    for i,p in enumerate(spline.bezier_points):
        t=2*math.pi*i/count
        p.co=(rx*math.cos(t),ry*math.sin(t),.30*math.sin(3*t+phase))
        p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    spline.use_cyclic_u=True
    o=bpy.data.objects.new(name,cv); bpy.context.collection.objects.link(o)
    o.rotation_euler=(math.radians(angle_x),math.radians(angle_y),0)
    o.data.materials.append(chrome)
    return o

sculpt=[loop('ChromeRibbon_01',1.65,1.10,22,10,0),loop('ChromeRibbon_02',1.53,1.1,-56,28,1.5),loop('ChromeRibbon_03',1.6,1.06,68,-20,2.8)]

rocks=[]
coords=[(-2.6,.7,-.4),(-1.9,1.6,-1.0),(2.2,.9,-1.1),(2.7,-.9,-1.7),(-3,-1.35,-2.0),(.4,2.2,-2.5),(1.5,-2.0,-2.3),(-.9,-2.3,-2.9),(3.1,.1,-3.4)]
for i,coord in enumerate(coords):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=random.uniform(.18,.5),location=coord)
    obj=bpy.context.object;obj.name=f'ParallaxRock_{i+1:02d}'
    for vert in obj.data.vertices:
        vert.co*=random.uniform(.78,1.22)
    obj.data.materials.append(rockmat)
    rocks.append(obj)

def export(objects,name):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    path=Path(__file__).resolve().parent/name
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True)
    print('exported',path)

export(sculpt,'chrome_sculpture_blender.glb')
export(rocks,'floating_rocks_blender.glb')
