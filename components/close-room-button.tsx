"use client";
import {useState} from "react";
import {createClient} from "../lib/supabase/client";
const supabase=createClient();
export default function CloseRoomButton({roomId}:{roomId:string}){
 const [busy,setBusy]=useState(false);
 async function close(){
  if(!confirm("هل تريد إغلاق الغرفة؟"))return;
  setBusy(true);
  const {error}=await supabase.rpc("close_room",{p_room:roomId});
  if(error) alert(error.message); else location.href="/";
  setBusy(false);
 }
 return <button className="btn-ghost" disabled={busy} onClick={close}>{busy?"جارٍ الإغلاق...":"إغلاق الغرفة"}</button>;
}