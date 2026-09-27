import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "../../../lib/supabase/server";
import RoomLive from "../../../components/room-live";
import CloseRoomButton from "../../../components/close-room-button";
export default async function RoomPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const s=await createServerClient(); const {data:{user}}=await s.auth.getUser();
 const [{data:room},{data:seats}]=await Promise.all([
  s.from("rooms").select("id,name,title,type,country,max_seats,is_active,host_id,public_profiles(display_name,avatar_url)").eq("id",id).single(),
  s.from("room_seats").select("*").eq("room_id",id).order("seat_no")
 ]);
 if(!room||!room.is_active)return notFound();
 return <main className="min-h-screen"><header className="border-b border-white/10"><div className="max-w-6xl mx-auto p-4 flex justify-between items-center"><div><div className="flex items-center justify-between"><Link href="/" className="text-white/50">← الرئيسية</Link>{user?.id===room.host_id && <CloseRoomButton roomId={room.id}/>}</div><h1 className="text-2xl font-black mt-1">{room.title}</h1><p className="text-white/45 text-sm">{room.name} · المضيف {room.public_profiles?.display_name??"مستخدم"}</p></div><span className="badge">LIVE</span></div></header><div className="max-w-6xl mx-auto p-4 md:p-8"><RoomLive roomId={id} initialSeats={(seats??[]) as any}/></div></main>
}