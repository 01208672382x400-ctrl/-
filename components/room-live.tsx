"use client";
import { useEffect,useMemo,useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Room,RoomEvent,Track,createLocalTracks } from "livekit-client";
const supabase=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type Seat={room_id:string;seat_no:number;user_id:string|null;is_muted:boolean;locked:boolean;joined_at:string|null};
export default function RoomLive({roomId,initialSeats}:{roomId:string;initialSeats:Seat[]}){
 const [seats,setSeats]=useState(initialSeats),[me,setMe]=useState<string|null>(null),[message,setMessage]=useState(""),[messages,setMessages]=useState<any[]>([]);
 const [lk,setLk]=useState<Room|null>(null);
 const mySeat=useMemo(()=>seats.find(s=>s.user_id===me),[seats,me]);
 useEffect(()=>{supabase.auth.getUser().then(({data})=>setMe(data.user?.id??null)); const ch=supabase.channel("room-"+roomId).on("postgres_changes",{event:"*",schema:"public",table:"room_seats",filter:"room_id=eq."+roomId},p=>{if(p.eventType==="DELETE")return;setSeats(x=>{const n=p.new as Seat;return x.some(s=>s.seat_no===n.seat_no)?x.map(s=>s.seat_no===n.seat_no?n:s):[...x,n]})}).on("postgres_changes",{event:"INSERT",schema:"public",table:"room_messages",filter:"room_id=eq."+roomId},p=>setMessages(x=>[...x,p.new])).subscribe(); supabase.from("room_messages").select("id,message,created_at,user_id,profiles(display_name,avatar_url)").eq("room_id",roomId).order("created_at",{ascending:true}).limit(100).then(({data})=>setMessages(data??[])); return()=>{supabase.removeChannel(ch)}},[roomId]);
 async function join(n:number){const {error}=await supabase.rpc("join_room_seat",{p_room:roomId,p_seat:n});if(error)alert(error.message);}
 async function leave(){const {error}=await supabase.rpc("leave_room_seat",{p_room:roomId});if(error)alert(error.message);}
 async function send(){if(!message.trim()||!me)return;const {error}=await supabase.from("room_messages").insert({room_id:roomId,user_id:me,message:message.trim()});if(error)alert(error.message);else setMessage("");}
 async function connectVoice(){if(!me){alert("يجب تسجيل الدخول");return}if(!mySeat){alert("اجلس على مقعد أولاً ثم ادخل الصوت");return}const r=await fetch("/api/livekit/token",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({roomId})});const j=await r.json();if(!r.ok){alert(j.error||"تعذر الاتصال");return}const room=new Room();try{await room.connect(j.url,j.token);const tracks=await createLocalTracks({audio:true,video:false});for(const track of tracks){await room.localParticipant.publishTrack(track)}setLk(room);room.on(RoomEvent.TrackSubscribed,(track)=>{if(track.kind===Track.Kind.Audio){const el=track.attach();el.autoplay=true;document.body.appendChild(el)}})}catch(e){await room.disconnect();alert(e instanceof Error?e.message:"تعذر تشغيل الميكروفون")}}
 async function disconnect(){if(lk){for(const pub of lk.localParticipant.trackPublications.values()) pub.track?.stop();await lk.disconnect()}setLk(null)}
 return <div className="space-y-5">
  <section className="glass p-4"><div className="flex gap-2 flex-wrap">{seats.map(s=><div key={s.seat_no} className="seat"><div className="text-2xl">{s.user_id?"🎙️":"💺"}</div><div className="text-xs">مقعد {s.seat_no}</div>{s.user_id?<button onClick={s.user_id===me?leave:undefined} className="text-xs text-white/55">{s.user_id===me?"اترك":"مشغول"}</button>:<button onClick={()=>join(s.seat_no)} className="text-xs text-violet-300">اجلس</button>}</div>)}</div></section>
  <section className="grid md:grid-cols-[1.5fr_1fr] gap-4">
   <div className="glass p-4"><div className="flex justify-between mb-3"><b>المحادثة</b><div className="flex gap-2">{lk?<button className="btn-ghost" onClick={disconnect}>قطع الصوت</button>:<button className="btn-primary" onClick={connectVoice}>🎤 دخول الصوت</button>}</div></div><div className="h-80 overflow-auto space-y-2">{messages.map(m=><div key={m.id} className="rounded-xl bg-white/5 p-3"><b>{m.profiles?.display_name??"مستخدم"}</b><div>{m.message}</div></div>)}</div><div className="flex gap-2 mt-3"><input className="field" value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="اكتب رسالة..."/><button className="btn-primary" onClick={send}>إرسال</button></div></div>
   <div className="glass p-4"><b>المقاعد</b><p className="text-white/55 text-sm mt-2">اضغط «اجلس» للانضمام للمايك.</p></div>
  </section>
 </div>
}
