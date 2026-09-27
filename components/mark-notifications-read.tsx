"use client";
import {useState} from "react";
import {createClient} from "../lib/supabase/client";

const supabase=createClient();

export default function MarkNotificationsRead({ids}:{ids:string[]}){
 const [busy,setBusy]=useState(false);
 if(!ids.length)return null;
 async function mark(){
  setBusy(true);
  const {error}=await supabase.from("notifications").update({read_at:new Date().toISOString()}).in("id",ids);
  if(error)alert(error.message); else location.reload();
  setBusy(false);
 }
 return <button className="btn-ghost" disabled={busy} onClick={mark}>{busy?"جارٍ التحديث...":"تحديد الكل كمقروء"}</button>;
}