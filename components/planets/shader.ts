// Planet surfaces — one fragment shader, four worlds.
// Ported from the Claude Design "wikverse horizon" study, then extended:
//   · the view is driven by uCenter/uSize, so the same planet can be drawn
//     inside its own little canvas or flown into across the whole viewport
//   · Frequencies thumps at 120 BPM while hovered
//   · thoughts has a small moon drifting around it

export const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

export const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform vec2 uCenter;   // planet box centre, in drawing-buffer px (GL origin)
uniform float uSize;    // planet box edge, in drawing-buffer px
uniform float uTime;    // per-planet time (speeds up on hover)
uniform float uClock;   // wall clock seconds (for the beat)
uniform int uType;
uniform float uHover;
uniform float uSeed;
uniform float uRings;

#define PI 3.14159265
#define TAU 6.2831853

float h31(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
mat3 rotZ(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
float hexD(vec2 g){g=abs(g);return max(dot(g,normalize(vec2(1.,1.732))),g.x);}
vec4 hexG(vec2 p){vec2 s=vec2(1.,1.732);vec2 hh=s*.5;vec2 a=mod(p,s)-hh;vec2 b=mod(p-hh,s)-hh;vec2 g=dot(a,a)<dot(b,b)?a:b;return vec4(g,p-g);}

vec3 surf(vec3 q, float dif, float t, float kick, out vec3 emis, out float spec){
  emis=vec3(0.); spec=0.;
  float lon=atan(q.z,q.x); float lat=asin(clamp(q.y,-1.,1.));
  float night=smoothstep(0.15,-0.25,dif);
  if(uType==0){ // music: waveform bands
    float f=fbm(q*2.5+uSeed);
    float wave=sin(lon*5.+t*1.6)*0.06+sin(lon*11.-t*2.3)*0.03;
    float b=sin((q.y+wave+f*0.08)*26.);
    vec3 c=mix(vec3(.22,.035,.02),vec3(.85,.3,.07),smoothstep(-.6,.9,b)*(.5+.6*f));
    c=mix(c,vec3(.45,.08,.03),smoothstep(.55,.75,fbm(q*5.+t*.05))*.6);
    float pulse=.5+.5*sin(t*3.5+lon*3.+q.y*8.);
    emis=vec3(1.,.5,.18)*pow(max(b,0.),14.)*(.15+.85*pulse)*(.35+night*.9)*(1.+kick*1.6);
    spec=.15; return c;
  }
  if(uType==1){ // travel: amber world
    float n=fbm(q*1.9+uSeed*1.7);
    float land=smoothstep(.44,.47,n+fbm(q*5.)*.08-.04);
    float det=fbm(q*7.);
    vec3 ocean=mix(vec3(.02,.03,.06),vec3(.05,.07,.11),det);
    vec3 ground=mix(vec3(.42,.25,.07),vec3(.88,.62,.22),smoothstep(.3,.7,det));
    ground=mix(ground,vec3(.95,.85,.6),smoothstep(.8,.95,abs(q.y))*.8);
    vec3 c=mix(ocean,ground,land);
    float cl=smoothstep(.55,.78,fbm(q*3.2+vec3(t*.03,0.,t*.02)));
    c=mix(c,vec3(.95,.9,.8),cl*.55);
    float city=step(.86,h31(floor(q*70.)))*land*(1.-cl);
    emis=vec3(1.,.72,.3)*city*night*1.4;
    spec=(1.-land)*(1.-cl)*.22; return c;
  }
  if(uType==2){ // thoughts: swirling indigo gas
    vec3 w=q+vec3(fbm(q*2.+t*.04),fbm(q*2.+5.2),fbm(q*2.-t*.03))*.9;
    float f=fbm(vec3(w.x*1.4,w.y*5.5,w.z*1.4)+uSeed);
    vec3 c=mix(vec3(.03,.035,.2),vec3(.13,.17,.7),smoothstep(.3,.65,f));
    c=mix(c,vec3(.88,.9,1.),smoothstep(.62,.78,f));
    float sp=step(.986,h31(floor(q*55.)));
    emis=vec3(.7,.75,1.)*sp*(.5+.5*sin(t*2.+h31(floor(q*55.)+3.)*40.))*night*1.2;
    spec=.1; return c;
  }
  // building: hex plating
  vec2 uv=vec2(lon/TAU*30.,lat/PI*15.*1.15);
  vec4 g=hexG(uv); float e=hexD(g.xy); float r=h31(vec3(g.zw,7.));
  float scan=fract(lon/TAU+t*.04);
  float built=step(r,.55);
  vec3 c=mix(vec3(.015,.05,.055),vec3(.05,.22,.2)*(.7+.6*r),built);
  float edge=smoothstep(.43,.49,e);
  vec3 teal=vec3(.15,1.,.78);
  emis=teal*edge*(.10+.25*built);
  emis+=teal*step(.94,r)*(.4+.6*sin(t*2.+r*50.))*.8;
  emis+=teal*smoothstep(.02,0.,abs(scan-.5))*edge*1.5;
  emis*=(.45+night*.8);
  spec=built*.4; return c;
}

void main(){
  vec2 p=(gl_FragCoord.xy-uCenter)*2./uSize;
  float px=2./uSize;
  float t=uTime;
  // a kick drum at 120 BPM, only audible (visible) on hover
  float kick=uType==0?uHover*exp(-fract(uClock*2.)*5.5):0.;
  float R=.6; vec3 atm=vec3(.9,.7,.5);
  if(uType==0){R=.42;atm=vec3(1.,.42,.15);} if(uType==1){R=.5;atm=vec3(1.,.75,.35);}
  if(uType==2){R=.64;atm=vec3(.45,.5,1.);} if(uType==3){R=.53;atm=vec3(.2,1.,.8);}
  if(uRings<.5){R*=1.25; R=min(R,.7);}
  R*=1.+uHover*.03+kick*.012;
  vec3 L=normalize(vec3(-.55,.45,.7));
  float r2=dot(p,p); float d=sqrt(r2)/R;
  float sphA=1.-smoothstep(1.-1.5*px/R,1.,d);
  vec3 col=vec3(0.); float a=0.; float sz=-10.;
  if(d<1.){
    float z=sqrt(1.-d*d); vec3 n=vec3(p/R,z); sz=z*R;
    float spin=t*.12*(1.+uHover*1.5);
    vec3 q=rotY(-spin)*(rotX(-.28)*(rotZ(-.38)*n));
    float dif=dot(n,L);
    vec3 emis; float spec;
    vec3 alb=surf(q,dif,t,kick,emis,spec);
    float sh=smoothstep(-.12,.65,dif);
    vec3 c=alb*(sh*1.15+.025)+emis;
    vec3 hv=normalize(L+vec3(0.,0.,1.)); c+=pow(max(dot(n,hv),0.),70.)*spec*sh*vec3(1.,.95,.85);
    float fr=pow(1.-z,2.6); c+=atm*fr*(.12+.9*smoothstep(-.35,.5,dif))*(1.+kick*.8);
    c*=1.-pow(1.-z,6.)*.4*(1.-sh);
    col=c*sphA; a=sphA;
  }
  float lp=dot(normalize(p+1e-5),normalize(L.xy))*.5+.5;
  // the glow is exponential and never quite reaches zero, so fade it out before
  // the edge of the planet's box — otherwise the box shows as a faint square
  float fit=1.-smoothstep(.72,.98,length(p));
  float g=exp(-max(d-1.,0.)*(7.-uHover*2.-kick*1.5))*(1.-sphA)*(.12+.45*lp)*(.7+uHover*.6)*fit;
  if(d>=1.){col+=atm*g*.6; a=clamp(a+g*.6,0.,1.);}

  // thoughts: a small moon — a passing thought
  if(uType==2){
    float ang=uTime*.32+uSeed*2.1;
    vec3 mc=vec3(cos(ang)*.88,sin(ang)*.88*.24,sin(ang));
    mc.xy=mat2(.956,.292,-.292,.956)*mc.xy;
    float mr=.052;
    vec2 dm=p-mc.xy; float md=length(dm)/mr;
    float mA=1.-smoothstep(1.-1.5*px/mr,1.,md);
    if(md<1.){
      float mz=sqrt(1.-md*md); vec3 mn=vec3(dm/mr,mz);
      float mdif=dot(mn,L);
      float cr=fbm(mn*3.+uSeed*5.);
      vec3 mcol=mix(vec3(.5,.52,.66),vec3(.86,.87,.95),smoothstep(.35,.65,cr));
      mcol*=smoothstep(-.15,.6,mdif)*1.05+.02;
      mcol+=vec3(.45,.5,1.)*pow(1.-mz,3.)*.35;
      if(mc.z>0.){col=mcol*mA+col*(1.-mA);a=mA+a*(1.-mA);}
      else{col+=mcol*mA*(1.-sphA);a=clamp(a+mA*(1.-sphA),0.,1.);}
    }
    // faint halo so it reads at small sizes
    float mh=exp(-max(md-1.,0.)*3.)*(1.-mA)*.10*(mc.z>0.?1.:1.-sphA);
    col+=vec3(.6,.65,1.)*mh; a=clamp(a+mh,0.,1.);
  }

  if(uRings>.5 && (uType==0||uType==1||uType==3)){
    if(uType!=3){
      vec3 Nr=uType==0?rotZ(.38)*normalize(vec3(0.,.94,.33)):rotZ(-.25)*normalize(vec3(0.,.96,.28));
      float zr=-(p.x*Nr.x+p.y*Nr.y)/Nr.z;
      vec3 P=vec3(p,zr); float rr=length(P)/R;
      vec3 e1=normalize(cross(Nr,vec3(0.,0.,1.))); vec3 e2=cross(Nr,e1);
      float ang=atan(dot(P,e2),dot(P,e1));
      vec3 rc=vec3(0.); float ra=0.;
      float shad=(dot(P,L)<0. && length(P-dot(P,L)*L)<R)?.2:1.;
      if(uType==0){
        // the rings are a record — grooves, a sheen, and ripples riding outward
        float inr=smoothstep(1.32,1.36,rr)*(1.-smoothstep(2.02,2.06,rr));
        float gap=1.-.7*(smoothstep(.012,0.,abs(rr-1.58))+smoothstep(.012,0.,abs(rr-1.8))+smoothstep(.012,0.,abs(rr-1.94)));
        float gr=.5+.5*sin(rr*R*420.);
        float sheen=pow(max(0.,cos(2.*(ang-.9))),5.);
        float rip=pow(.5+.5*sin(rr*22.-t*3.2),8.);
        rc=(vec3(.045,.028,.026)+gr*.02+sheen*vec3(.9,.38,.14)*.55*gap+rip*vec3(1.,.4,.12)*(.18+kick*.5))*gap*shad;
        ra=inr*.95;
        rc*=ra;
      } else {
        // flight paths: a dashed orbit with eight waypoints sliding along it
        float rO=1.72;
        float line=smoothstep(.022,.0,abs(rr-rO))*step(.45,fract(ang/TAU*64.));
        float k=TAU/8.; float a0=ang-t*.18; float ci=floor(a0/k+.5); float na=ci*k+t*.18;
        vec3 np=rO*R*(cos(na)*e1+sin(na)*e2);
        float nd=length(p-np.xy);
        float node=smoothstep(.022,.008,nd); float halo=exp(-nd*40.)*.5;
        float lv=line*.35+node+halo;
        rc=vec3(1.,.75,.35)*lv*(.4+.6*shad); ra=clamp(lv,0.,1.);
      }
      bool front=(d>=1.)||(zr>sz);
      if(front){col=rc+col*(1.-ra);a=ra+a*(1.-ra);} else {col+=rc*(1.-a);a+=ra*(1.-a);}
    } else {
      // scaffolding: a wireframe shell, still being built
      float R2=R*1.14;
      if(r2<R2*R2){
        float zz=sqrt(R2*R2-r2);
        for(int s=0;s<2;s++){
          float zs=s==0?zz:-zz;
          if(s==1 && d<1.) continue;
          vec3 m=vec3(p,zs)/R2;
          vec3 q=rotY(t*.05)*(rotX(-.28)*(rotZ(-.38)*m));
          float lon=atan(q.z,q.x); float lat=asin(clamp(q.y,-1.,1.));
          float edgeLat=.15+.12*sin(lon*2.+t*.4);
          float present=smoothstep(edgeLat-.02,edgeLat+.02,lat)*(1.-smoothstep(1.2,1.3,lat));
          float ll=smoothstep(.06,0.,abs(fract(lon/TAU*20.+.5)-.5))+smoothstep(.06,0.,abs(fract(lat/PI*14.+.5)-.5));
          float front=smoothstep(.025,0.,abs(lat-edgeLat))*1.2;
          float v=(min(ll,1.)*present*.55+front)*(s==0?1.:.35);
          col+=vec3(.25,1.,.82)*v*.6; a=clamp(a+v*.6,0.,1.);
        }
      }
    }
  }
  gl_FragColor=vec4(col,a);
}`
