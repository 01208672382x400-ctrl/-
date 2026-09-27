"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
const supabase=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export default function CreateRoomForm(){
 const [open,setOpen]=useState(false),[name,setName]=useState(""),[title,setTitle]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function create(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");const {data,error}=await supabase.rpc("create_room",{p_name:name,p_title:title,p_type:"voice",p_privacy:"public",p_country:"EG",p_max_seats:8});if(error)setError(error.message);else if(data?.id)location.href="/room/"+data.id;setBusy(false);}
 return <>{!open?<button className="btn-primary" onClick={()=>setOpen(true)}>＋ إنشاء غرفة</button>:<form onSubmit={create} className="glass p-5 space-y-3"><input className="field" placeholder="اسم الغرفة" value={name} onChange={e=>setName(e.target.value)} required/><input className="field" placeholder="عنوان الغرفة" value={title} onChange={e=>setTitle(e.target.value)} required/><button className="btn-primary w-full" disabled={busy}>{busy?"جاري الإنشاء...":"إنشاء"}</button>{error&&<p className="text-red-300 text-sm">{error}</p>}</form>}</>
}
