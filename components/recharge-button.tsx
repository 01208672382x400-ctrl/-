"use client";
import {useState} from "react";
export default function RechargeButton({packageId}:{packageId:string}){
 const [busy,setBusy]=useState(false);
 async function start(){
  setBusy(true);
  try{
   const r=await fetch("/api/recharge",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({packageId})});
   const j=await r.json();
   if(!r.ok) throw new Error(j.error||"تعذر إنشاء طلب الشحن");
   alert("تم إنشاء طلب الشحن: "+j.orderId+" — سيتم إضافة العملات بعد تأكيد الدفع.");
  }catch(e){alert(e instanceof Error?e.message:"حدث خطأ")}
  finally{setBusy(false)}
 }
 return <button className="btn-primary w-full mt-3" disabled={busy} onClick={start}>{busy?"جارٍ إنشاء الطلب...":"متابعة الشحن"}</button>
}