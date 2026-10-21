#!/usr/bin/env python3
"""Side-by-side: TT Norms Pro as rendered in the product (screenshot crops) vs open candidates.
Output: ds/fidelity/font-comparison.png (evidence for D-021). Candidates rendered at the
same pixel size (2x) and weight as the crop they sit next to."""
import os, sample
from PIL import Image, ImageDraw, ImageFont
DS=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F=os.path.join(DS,'tools','font-candidates')
cands=['Figtree','DMSans','PlusJakartaSans','Outfit','Urbanist','RedditSans']
# (label, HS, crop box 2x, text, px size 2x, weight)
rows=[('Page title 24/600','HS-22',(1100,360,1420,430),'Details',48,600),
      ('Sidebar 16/500','HS-22',(95,470,420,535),'Getting started',32,500),
      ('Sub-nav 16/600','HS-22',(625,838,900,888),'Knowledge Hub',32,600),
      ('Body 16/400','HS-22',(1100,705,1760,760),'Add key details guests need',32,400),
      ('Onboarding H1 24/600','HS-01',(1140,430,1900,490),'How many properties do you manage?',48,600)]
def render(font,text,size,wght,w,h):
    im=Image.new('RGB',(w,h),'white'); d=ImageDraw.Draw(im)
    f=ImageFont.truetype(os.path.join(F,font+'.ttf'),size)
    try: f.set_variation_by_axes([wght] if font!='DMSans' else [14,wght])
    except Exception as e: pass
    asc,desc=f.getmetrics(); d.text((4,(h-(asc+desc))//2),text,font=f,fill=(25,27,31)); return im
colw=[0]*1
W=780; H=0
tiles=[]
for label,hs,box,text,size,wght in rows:
    crop=sample.load(hs).crop(box); cw,ch=crop.size
    line=[('TT Norms Pro (product, '+hs+')',crop)]+[(c,render(c,text,size,wght,max(cw,700),ch)) for c in cands]
    tiles.append((label,line))
cols=len(tiles[0][1]); cellw=760; 
sheet_h=sum(max(t.size[1] for _,t in line)+30 for _,line in tiles)*1+40
sheet=Image.new('RGB',(cellw*2+30, (len(tiles))*((cols+1)//2)*80+200),'white')
d=ImageDraw.Draw(sheet); y=10
for label,line in tiles:
    d.text((10,y),label,fill=(225,41,90)); y+=16
    for i,(name,t) in enumerate(line):
        x=10+(i%2)*(cellw+10)
        if i%2==0 and i>0: y+=t.size[1]+18
        d.text((x,y),name,fill=(110,110,110)); sheet.paste(t.crop((0,0,min(t.size[0],cellw),t.size[1])),(x,y+12))
    y+=line[-1][1].size[1]+30
sheet=sheet.crop((0,0,sheet.size[0],y+10)); sheet.save(os.path.join(DS,'fidelity','font-comparison.png')); print(sheet.size)
