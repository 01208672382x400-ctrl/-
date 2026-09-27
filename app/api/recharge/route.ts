import { NextResponse } from "next/server";
import { createServerClient } from "../../../lib/supabase/server";
export async function POST(req:Request){
 const supabase=await createServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"يجب تسجيل الدخول"},{status:401});
 const b=await req.json().catch(()=>({}));const packageId=String(b.packageId||"");
 const {data:p,error}=await supabase.from("recharge_packages").select("id,coins,bonus,price_usd").eq("id",packageId).eq("enabled",true).single();
 if(error||!p)return NextResponse.json({error:"الباقة غير موجودة"},{status:404});
 const {data,error:e}=await supabase.from("recharge_orders").insert({user_id:user.id,package_id:p.id,amount_usd:p.price_usd,coins:p.coins,bonus:p.bonus}).select("id").single();
 if(e)return NextResponse.json({error:e.message},{status:400});return NextResponse.json({orderId:data.id});
}
