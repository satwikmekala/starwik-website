// Full-screen passages between the home page and each world.
// Every branch obeys the same contract, which is what keeps the hand-off seamless:
//   · uT < uCoverAt  — the effect grows out of the planet, translucent over the home page
//   · uT ≥ uCoverAt  — fully opaque (this is when the route changes underneath)
//   · uReveal 0 → 1  — the effect opens onto the page that has just arrived
// Output is premultiplied alpha.

export const TRANSITION_VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

export const TRANSITION_FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;      // drawing buffer px
uniform float uScale;   // buffer px per css px
uniform int uKind;
uniform float uT;       // seconds since launch
uniform float uCoverAt;
uniform float uReveal;  // 0..1, eased in JS
uniform vec2 uO;        // planet centre, css px, y up
uniform float uR;       // planet disc radius, css px
uniform vec4 uKicks;    // music: beat times

#define PI 3.14159265
#define TAU 6.2831853

float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float h31(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
float hexD(vec2 g){g=abs(g);return max(dot(g,normalize(vec2(1.,1.732))),g.x);}
vec4 hexG(vec2 p){vec2 s=vec2(1.,1.732);vec2 hh=s*.5;vec2 a=mod(p,s)-hh;vec2 b=mod(p-hh,s)-hh;vec2 g=dot(a,a)<dot(b,b)?a:b;return vec4(g,p-g);}
float sat(float x){return clamp(x,0.,1.);}

void main(){
  vec2 fc=gl_FragCoord.xy/uScale;
  vec2 res=uRes/uScale;
  float diag=length(res);
  float m=min(res.x,res.y);
  vec2 d=fc-uO;
  float r=length(d);
  float ang=atan(d.y,d.x);
  vec3 c=vec3(0.); float a=0.;
  float rv=uReveal;

  // ── FREQUENCIES · the drop ─────────────────────────────────────────────
  if(uKind==0){
    float drop=uKicks.w;
    // the room darkens as the beat builds
    a=smoothstep(0.,drop,uT)*.6*smoothstep(uR*1.2,uR*2.4,r);
    // a shockwave on every kick, each one harder than the last
    for(int k=0;k<4;k++){
      float tk=k==0?uKicks.x:k==1?uKicks.y:k==2?uKicks.z:uKicks.w;
      float age=uT-tk;
      if(age>0.){
        float fk=float(k);
        float rad=uR*1.02+age*(.55+.35*fk)*diag;
        float w=4.+age*70.;
        float ring=exp(-pow((r-rad)/w,2.))*exp(-age*2.4)*(.35+.25*fk);
        c+=vec3(1.,.42,.13)*ring*1.5; a+=ring*.35;
      }
    }
    // record grooves spill out of the planet once the build kicks in
    float gro=smoothstep(uKicks.y,uKicks.z,uT);
    float groove=pow(.5+.5*sin(r*.42-uT*18.),6.);
    float sheen=pow(max(0.,cos(2.*(ang-uT*2.2))),6.);
    float spill=smoothstep(uR*.95,uR*1.5,r)*exp(-max(r-uR,0.)/(diag*.45));
    c+=vec3(.95,.36,.1)*(groove*.18+groove*sheen*.55)*gro*spill;
    a+=groove*.12*gro*spill;

    // the drop: a flash, then the screen floods with light and lasers
    float dt=uT-drop;
    if(dt>0.){
      float fR=mix(uR,diag*1.1,1.-pow(1.-sat(dt/(uCoverAt-drop)),2.));
      float inside=smoothstep(fR+24.,fR-24.,r);
      vec3 fill=mix(vec3(.03,.008,.006),vec3(.13,.035,.014),exp(-r/(diag*.32)));
      float rays=pow(.5+.5*sin(ang*13.+sin(ang*4.+uT*.7)*1.6+uT*.5),22.)
                +pow(.5+.5*sin(ang*21.-uT*.8),30.)*.7;
      rays*=exp(-r/(diag*.5))*(.3+.7*exp(-dt*1.3))*smoothstep(10.,90.,r);
      fill+=vec3(1.,.4,.12)*rays*.6;
      fill+=vec3(1.,.55,.25)*exp(-r/38.)*.5;                    // the source of the lasers
      fill+=vec3(.9,.32,.1)*groove*.05*exp(-r/(diag*.6));
      fill+=vec3(1.,.78,.55)*exp(-dt*5.)*exp(-r/(diag*.25))*1.3;
      float edge=exp(-pow((r-fR)/18.,2.))*(1.-sat(dt/.4));
      c=mix(c,fill,inside)+vec3(1.,.5,.2)*edge;
      a=mix(a,1.,inside);
      a=max(a,edge*.5);
    }
    // arrival: a rippling ring opens onto the club
    if(rv>0.){
      float hR=pow(rv,.85)*diag*1.12;
      hR+=sin(ang*7.+uT*6.)*9.*(1.-rv)*sat(hR/160.);       // the lip ripples like a speaker cone
      float hole=smoothstep(hR-36.,hR+36.,r);
      float lip=exp(-pow((r-hR)/16.,2.))*(1.-rv);
      c=c*hole+vec3(1.,.48,.16)*lip*1.4;
      a=a*hole+lip*.4;
    }
  }

  // ── ELSEWHERE · down through the clouds ───────────────────────────────
  else if(uKind==1){
    vec2 p=(fc-uO)/m;
    float fog=smoothstep(.35,uCoverAt,uT);
    // breaking through the cloud base: a ragged clearing from the centre
    float clearing=1.;
    if(rv>0.){
      float n=length(p)*.85+(fbm(vec3(p*3.,uT*.2))-.5)*.55;
      clearing=smoothstep(rv*1.55-.3,rv*1.55,n);
    }
    vec3 deep=vec3(.035,.026,.024);
    vec3 under=deep+vec3(.32,.17,.06)*exp(-length(p)*2.2)*.45;   // the glow of cities below
    c=under*fog*clearing; a=fog*clearing;

    float amount=smoothstep(.25,.75,uT)*(1.-smoothstep(0.,.85,rv))*(.35+.65*clearing);
    float base=uT*.55+rv*rv*1.2;               // the clouds rush past faster as we fall out
    float b4=base*4.;
    for(int j=0;j<4;j++){
      float fj=float(j);
      float k=floor(b4)-fj;                    // which cloud bank this is
      float z=fract(b4)/4.+fj*.25;             // 0 far → 1 at the lens
      float sc=mix(3.4,.5,z);
      vec2 uv=p*sc;
      vec3 sp=vec3(uv*1.25+k*13.1,k*3.7);
      float n=fbm(sp);
      float den=smoothstep(.43,.78,n);
      float lit=sat((n-fbm(sp+vec3(-.05,.06,0.)))*7.+.5);
      vec3 cc=mix(vec3(.13,.09,.1),vec3(1.,.74,.46),lit)*(.6+.5*z);
      float la=den*sin(z*PI)*amount*.9;
      c=c*(1.-la)+cc*la; a=a*(1.-la)+la;
    }
  }

  // ── THOUGHTS · ink in water ───────────────────────────────────────────
  else if(uKind==2){
    vec2 p=(fc-uO)/m;
    float R0=uR/m;
    float lp=length(p);
    // swirl the space, strongest near the planet, then let the currents carry it
    float sw=.9*exp(-lp*2.2)*uT;
    vec2 q=mat2(cos(sw),-sin(sw),sin(sw),cos(sw))*p;
    q+=.22*vec2(fbm(vec3(q*2.2,uT*.25)),fbm(vec3(q*2.2+5.2,-uT*.2)))-.11;
    float e=length(q)+(fbm(vec3(q*3.4,uT*.3))-.5)*.36;
    float br=R0*.92+pow(smoothstep(.2,uCoverAt,uT),1.5)*1.75;
    // the planet's own gas unravels: translucent at first, ink by the time it covers
    float inside=smoothstep(br+.05,br-.05,e)*mix(.35,1.,smoothstep(.15,.75,uT));

    float f=fbm(vec3(q*2.6,uT*.05));
    vec3 ink=mix(vec3(.022,.026,.11),vec3(.13,.17,.68),smoothstep(.34,.7,f));
    float wisp=smoothstep(.58,.8,fbm(vec3(q*5.2,-uT*.12)));
    ink=mix(ink,vec3(.8,.83,1.),wisp*.45);
    float vein=smoothstep(.02,0.,abs(fbm(vec3(q*3.,uT*.08))-.5))*.35;   // fine currents
    ink+=vec3(.45,.5,1.)*vein*.35;
    ink*=mix(1.,.6,smoothstep(.15,1.15,lp));
    float rim=exp(-pow((e-br)/.028,2.))*(1.-smoothstep(uCoverAt-.1,uCoverAt+.2,uT));
    // thoughts, glinting in the ink
    vec2 cell=floor(fc/22.);
    float hs=h21(cell);
    vec2 cf=fract(fc/22.)-.5-(vec2(h21(cell+3.1),h21(cell+7.7))-.5)*.6;
    float spark=step(.992,hs)*pow(.5+.5*sin(uT*3.+hs*60.),3.)*exp(-dot(cf,cf)*260.);
    vec3 col=ink+vec3(.75,.8,1.)*spark*.8;
    c=col*inside+vec3(.55,.6,1.)*rim*.5;
    a=inside+rim*.2;

    // arrival: the ink thins and clears, centre first
    if(rv>0.){
      float th=rv*1.95-.22;
      float nd=lp*.7+fbm(vec3(q*2.4,uT*.15))*.85;
      float vis=smoothstep(th,th+.13,nd);
      float glow=exp(-pow((nd-th-.05)/.035,2.))*(1.-rv);
      c=c*vis+vec3(.7,.75,1.)*glow*.7;
      a=a*vis+glow*.25;
    }
  }

  // ── THE MAKING · assembly ─────────────────────────────────────────────
  else {
    float S=clamp(m*.075,30.,56.);
    vec4 hx=hexG(fc/S);                       // the grid is fixed to the screen…
    vec2 g=hx.xy; vec2 id=hx.zw;
    float cd=length(id*S-uO);                 // …and builds outward from the planet
    float rnd=h21(id+.5);
    float hd=hexD(g);                         // .5 at the cell edge
    vec3 teal=vec3(.18,1.,.8);

    // cells come online in a wave from the planet: edges first, then plates
    float tb=.28+max(cd-uR*.8,0.)/(diag*.7)*.42+rnd*.07;
    float edgeT=smoothstep(tb,tb+.05,uT);
    float fillT=smoothstep(tb+.06,tb+.16,uT);
    float line=smoothstep(.43,.49,hd);
    vec3 plate=vec3(.016,.055,.055)*(.75+.5*rnd)+vec3(.02,.09,.08)*sat(.4-g.y*1.2-g.x*.4)*.6;
    float flash=exp(-max(uT-tb,0.)*7.)*step(tb,uT);
    // a scan line keeps checking the work while we wait
    float sy=fract(uT*.45)*(res.y+200.)-100.;
    float scan=exp(-pow((fc.y-sy)/30.,2.))*step(uCoverAt,uT);
    vec3 glow=teal*line*edgeT*(.55-.3*fillT+scan*.8)+teal*flash*(line+.25)*.7;

    float keep=1.;
    if(rv>0.){
      float tr=cd/(diag*1.1)*.55+rnd*.15;
      float k=smoothstep(tr,tr+.3,rv);
      float edgeR=.5*(1.-k);
      keep=smoothstep(edgeR+.012,edgeR-.012,hd);
      glow=glow*keep+teal*exp(-pow((hd-edgeR)/.025,2.))*k*(1.-k)*3.;
    }
    c=plate*fillT*keep+glow;
    a=fillT*keep+sat(length(glow))*.35;
  }

  a=clamp(a,0.,1.);
  gl_FragColor=vec4(min(c,vec3(a+.6)),a);
}`
