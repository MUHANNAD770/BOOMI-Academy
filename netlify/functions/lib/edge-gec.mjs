/* edge-gec.mjs — رمز Sec-MS-GEC (الإصدار 2) لخدمة نطق Microsoft Edge، منقول حرفيًا من edge-tts (drm.py) إلى JavaScript.
   نستعمل BigInt في كل العمليات لنطابق حساب الأعداد الصحيحة في Python تمامًا. مُتحقَّق منه بمقارنة مخرجاته مع Python. */
const M=0xFFFFFFFFn,TOKEN='6A5AA1D4EAFF4E9FB37E23D68491D6F4',WIN_EPOCH=11644473600;
const B=a=>a.map(x=>BigInt(x));
const INIT=B([0x6A09E667,0xBB67AE85,0x3C6EF372,0xA54FF53A,0x510E527F,0x9B05688C,0x1F83D9AB,0x5BE0CD19]);
const STATE=B([0xFD9FBEA2,0x91243CE7,0xBE499094,0xCD2E1E0A,0x6C006F49,0x04BD35AB,0xFEB0A7E4,0x03EFFBD2]);
const SCHED=B([0xEB24BF9E,0x1558691F,0xA0C09EE2,0x0CFA32BA,0xA622EE8C,0xD1DD9491,0xC0DD25A0,0xF9E70AB6,0xF0C31573,0x7058CE4E,0x7188E606,0x00E5AB33,0xD258B060,0x72766564]);
const RC=B([0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,
 0xE49B69C1,0xEFBE4786,0x0FC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x06CA6351,0x14292967,
 0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,
 0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2]);
const ADJ=0xC9DC06A7n,BLOCK=RC.slice(0,14).concat([ADJ],RC.slice(15)),S0ADJ=0x059C0B80n,S1ADJ=0x000B92C0n;
const CS=[[0xE82E91B1,0xB32700D0],[0x44DE24C6,0x88DFF51D],[0x3BEB65BC,0x29514038],[0xC89C5933,0xB328CBDF],[0x8D1EC211,0xD405B4D5],[0x314EF5D5,0x26E55F3C],[0xE92491B1,0x607801C6],
 [0xF0A5B9D5,0x82B2C1FB],[0x06064CF3,0xFA51A3DA],[0xDA79FA60,0x207CC464],[0xBED20560,0x3C3C74F3],[0x89F9C9F8,0xD2D14B61],[0x35FA38C6,0xBB04A2C1],[0xCB49E3C6,0xC5626167]].map(B);
const CSF=0x82893933n,CSA0=0xF2F90B1An,CSA1=0x0B1A0000n;
const m=x=>((x%(M+1n))+(M+1n))%(M+1n);
const rol16=v=>{v&=M;return((v<<16n)|(v>>16n))&M};
const sig0=v=>((v>>7n)^(v<<25n)^(v>>18n)^(v<<14n)^(v>>3n))&M;
const sig1=v=>((v>>17n)^(v<<15n)^(v>>19n)^(v<<13n)^(v>>10n))&M;
const rotr=(x,n)=>((x>>n)|(x<<(32n-n)))&M;
function rounds(state,w,first=0){let[a,b,c,d,e,f,g,h]=state;const K=first===14?BLOCK:RC;
 for(let i=first;i<64;i++){const t1=(h+(rotr(e,6n)^rotr(e,11n)^rotr(e,25n))+(g^(e&(f^g)))+K[i]+w[i])&M,t2=((rotr(a,2n)^rotr(a,13n)^rotr(a,22n))+((a&b)|(c&(a|b))))&M;
  h=g;g=f;f=e;e=(d+t1)&M;d=c;c=b;b=a;a=(t1+t2)&M}return[a,b,c,d,e,f,g,h]}
function expand(w,first=16){for(let i=first;i<64;i++){const x=w[i-2],y=w[i-15];w.push((sig1(x)+w[i-7]+sig0(y)+w[i-16])&M)}}
const be=(u8,o,n)=>{let v=0n;for(let i=0;i<n;i++)v=(v<<8n)|BigInt(u8[o+i]);return v};
function init(d7){const w=new Array(14).fill(0n);w.push(be(d7,0,3));w.push(be(d7,3,4));
 for(let i=16;i<30;i++){let v=SCHED[i-16];if(i-2>=14)v+=i===16?(sig1(w[i-2])^S1ADJ):sig1(w[i-2]);if(i-7>=14)v+=w[i-7];if(i-15>=14)v+=i===29?(sig0(w[i-15])^S0ADJ):sig0(w[i-15]);w.push(v&M)}
 w.push(m(sig1(w[28])+w[23]+sig0(w[15])+w[14]+ADJ-RC[14]));expand(w,31);const r=rounds(STATE,w,14);return INIT.map((x,i)=>(x+r[i])&M)}
function sha(data){const len=57+data.length,padLen=(((55-len)%64)+64)%64;const p=new Uint8Array(data.length-7+1+padLen+8);p.set(data.subarray(7),0);p[data.length-7]=0x80;
 const bits=BigInt(len*8);for(let i=0;i<8;i++)p[p.length-1-i]=Number((bits>>BigInt(8*i))&0xFFn);
 let st=init(data.subarray(0,7));for(let o=0;o<p.length;o+=64){const w=[];for(let i=0;i<16;i++)w.push(be(p,o+4*i,4));expand(w);const r=rounds(st,w);st=st.map((x,i)=>(x+r[i])&M)}
 const out=new Uint8Array(32);st.forEach((v,i)=>{for(let k=0;k<4;k++)out[4*i+k]=Number((v>>BigInt(24-8*k))&0xFFn)});return out}
const le32=(u8,o)=>BigInt(u8[o])|(BigInt(u8[o+1])<<8n)|(BigInt(u8[o+2])<<16n)|(BigInt(u8[o+3])<<24n);
function cs64(data,dg){let ka=le32(dg,0)|1n,kb=le32(dg,4)|1n;const fac=[(ka*CSF)&M,(kb*CSF)&M];
 const terms=CS.map(([c],i)=>(c*fac[i%2])&M),offs=CS.map(([,o])=>o);
 const raw=new Uint8Array(1+data.length);raw.set(data,1);const pl=raw.length+((4-raw.length%4)%4),pad=new Uint8Array(pl);pad.set(raw);
 const words=[];for(let i=0;i<pl;i+=4)words.push(le32(pad,i));if(words.length%2)words.push(0n);
 words.forEach((wd,i)=>{let t=wd*(i%2===0?ka:kb),of=rol16(wd)*(i%2===0?0xEF0569FBn:0xC31713DBn);if(i===0){t+=CSA0*fac[0];of+=CSA1}terms.push(t&M);offs.push(of&M)});
 let sa=0n,sl=0n,s=0n,acc=0n;
 for(let i=0;i<terms.length;i+=2){const x=terms[i],y=terms[i+1];let t=rol16((offs[i]+x)&M),q=(t*0x76F50F34n)&M;sa+=(rol16(q)*0xC3EFEA97n+q)&M;
  t=rol16((offs[i+1]+y)&M);q=(t*0x1881CE3Cn)&M;sl=(rol16(q)*0x35BD1EC9n+q)&M;sa=(sa+sl)&M;
  s=(s*ka+x)&M;s=(rol16(s)*0xCF98B111n)&M;s=(rol16(s)*0x87085B9Fn)&M;s=(rol16(s)*0x12CEB96Dn)&M;s=(rol16(s)*0x257E1D83n)&M;acc+=s;
  let u=(s*kb+y)&M;u=(rol16(u)*0xA27416F5n)&M;u=(rol16(u)*0xD38396FFn)&M;s=(rol16((rol16(u)*0x7C932B89n)&M)*0xBFA49F69n)&M;acc=(acc+s)&M}
 return[sl^s,sa^acc]}
const hex=u8=>[...u8].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
export function secMsGec(unix=Date.now()/1000){let t=unix+WIN_EPOCH;t-=t%300;t*=1e9/100;
 const data=new TextEncoder().encode(BigInt(Math.round(t)).toString()+TOKEN),dg=sha(data),[c0,c1]=cs64(data,dg);
 const cb=new Uint8Array(8);[c0,c1].forEach((v,j)=>{for(let k=0;k<4;k++)cb[4*j+k]=Number((v>>BigInt(8*k))&0xFFn)});return hex(cb)+'-'+hex(dg)}
export const TRUSTED_CLIENT_TOKEN=TOKEN;
