import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
export default async function Wallet(){
 const s=await createServerClient(); const {data:{user}}=await s.auth.getUser();
 if(!user)return <main className="p-8"><Link href="/auth" className="btn-primary">سجل الدخول</Link></main>;
 const [{data:p},{data:tx},{data:packages}]=await Promise.all([
  s.from("profiles").select("display_name,coins,diamonds,vip_level").eq("id",user.id).single(),
  s.from("wallet_transactions").select("id,kind,coins_delta,diamonds_delta,note,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(30),
  s.from("recharge_packages").select("*").eq("enabled",true).order("coins")
 ]);
 return <main className="min-h-screen p-4 md:p-8"><div className="max-w-5xl mx-auto space-y-6"><Link href="/" className="text-white/50">← الرئيسية</Link><h1 className="text-3xl font-black">محفظتي</h1>
 <div className="grid sm:grid-cols-3 gap-4"><div className="glass p-5"><div className="text-white/45">العملات</div><div className="text-3xl font-black mt-2">🪙 {p?.coins??0}</div></div><div className="glass p-5"><div className="text-white/45">الماس</div><div className="text-3xl font-black mt-2">💎 {p?.diamonds??0}</div></div><div className="glass p-5"><div className="text-white/45">VIP</div><div className="text-3xl font-black mt-2">⭐ {p?.vip_level??0}</div></div></div>
 <section><h2 className="text-xl font-bold mb-3">باقات الشحن</h2><div className="grid sm:grid-cols-3 gap-3">{(packages??[]).map((x:any)=><div className="glass p-5" key={x.id}><div className="text-2xl font-bold">🪙 {x.coins}</div><div className="text-white/45">+ {x.bonus} إضافية</div><div className="mt-4 font-bold">$ {x.price_usd}</div><button className="btn-ghost w-full mt-3" disabled>ربط بوابة الدفع مطلوب</button></div>)}</div></section>
 <section className="glass p-5"><h2 className="text-xl font-bold mb-4">آخر العمليات</h2><div className="space-y-2">{(tx??[]).map((t:any)=><div key={t.id} className="flex justify-between border-b border-white/5 py-2"><span>{t.note??t.kind}</span><span>🪙 {t.coins_delta} · 💎 {t.diamonds_delta}</span></div>)}</div></section></div></main>
}