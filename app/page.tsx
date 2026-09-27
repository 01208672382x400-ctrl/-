import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getAppConfig } from "@/lib/app-config";
import CreateRoomForm from "@/components/create-room-form";
import SignOut from "@/components/sign-out";
export default async function Home(){
 const supabase=await createServerClient();
 const [{data:rooms},{data:{user}}]=await Promise.all([
  supabase.from("rooms").select("id,name,title,type,country,max_seats,is_active,host_id,profiles(display_name,avatar_url)").eq("is_active",true).order("created_at",{ascending:false}).limit(50),
  supabase.auth.getUser()
 ]);
 const cfg=await getAppConfig();
 return <main className="min-h-screen"><header className="sticky top-0 z-10 border-b border-white/10 bg-black/60 backdrop-blur"><div className="max-w-6xl mx-auto p-4 flex items-center justify-between"><div><div className="text-2xl font-black">{cfg.theme.appName??"🎙️ Voice Rooms"}</div><div className="text-xs text-white/45">الغرف الصوتية</div></div><div className="flex gap-2">{user?<><Link className="btn-ghost" href="/wallet">محفظتي</Link><CreateRoomForm/><SignOut/></>:<Link className="btn-primary" href="/auth">دخول</Link>}</div></div></header>
 <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8"><section className="glass p-7 md:p-10"><div className="max-w-2xl"><div className="text-sm text-violet-300 mb-2">🎧 LIVE AUDIO</div><h1 className="text-4xl md:text-6xl font-black">{cfg.home.heroTitle??"الغرف الصوتية"}</h1><p className="text-white/60 mt-4 text-lg">{cfg.home.heroSubtitle??"ادخل غرفة وتحدث مع الآخرين مباشرة"}</p></div></section>
 <section><div className="mb-4"><h2 className="text-2xl font-bold">الغرف النشطة</h2><p className="text-white/45 text-sm">اختر غرفة وابدأ الاستماع أو المشاركة</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{(rooms??[]).map((r:any)=><Link href={"/room/"+r.id} key={r.id} className="glass p-5 hover:translate-y-[-2px] transition"><div className="flex justify-between"><span className="badge">مباشر</span><span className="text-white/40">🎙️ {r.max_seats}</span></div><h3 className="text-xl font-bold mt-6">{r.title}</h3><p className="text-white/45 mt-1">{r.name}</p><p className="text-sm text-white/55 mt-4">المضيف: {r.profiles?.display_name??"مستخدم"}</p></Link>)}{!rooms?.length&&<div className="glass p-8 text-white/55">لا توجد غرف الآن. أنشئ أول غرفة.</div>}</div></section></div></main>
}