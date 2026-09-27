"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [name,setName]=useState(""); const [busy,setBusy]=useState(false); const [msg,setMsg]=useState("");
  async function submit(e:React.FormEvent){
    e.preventDefault(); setBusy(true); setMsg("");
    const result=mode==="login"
      ? await supabase.auth.signInWithPassword({email,password})
      : await supabase.auth.signUp({email,password,options:{data:{display_name:name||"مستخدم جديد"}}});
    if(result.error) setMsg(result.error.message);
    else { setMsg(mode==="signup" ? "تم إنشاء الحساب. تحقق من بريدك إذا كان التحقق مفعلاً." : "تم الدخول."); if(mode==="login") location.href="/"; }
    setBusy(false);
  }
  return <main className="min-h-screen grid place-items-center p-5">
    <form onSubmit={submit} className="glass w-full max-w-md p-7 space-y-4">
      <div><div className="text-3xl font-black">🎙️ Voice Rooms</div><p className="text-white/55 mt-2">الغرف الصوتية في مكان واحد</p></div>
      {mode==="signup" && <input className="field" placeholder="الاسم" value={name} onChange={e=>setName(e.target.value)} required/>}
      <input className="field" type="email" placeholder="البريد الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)} required/>
      <input className="field" type="password" placeholder="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required/>
      {msg && <div className="rounded-xl bg-white/5 p-3 text-sm">{msg}</div>}
      <button className="btn-primary w-full" disabled={busy}>{busy?"جاري التنفيذ...":mode==="login"?"دخول":"إنشاء حساب"}</button>
      <button type="button" className="btn-ghost w-full" onClick={()=>setMode(mode==="login"?"signup":"login")}>{mode==="login"?"ليس لديك حساب؟ إنشاء حساب":"لديك حساب؟ تسجيل الدخول"}</button>
    </form>
  </main>
}
