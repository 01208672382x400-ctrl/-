import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createServerClient } from "../../../lib/supabase/server";
export async function POST(req:Request){
 const supabase=await createServerClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"يجب تسجيل الدخول"},{status:401});
 const body=await req.json().catch(()=>({})); const roomId=String(body.roomId||"");
 if(!roomId)return NextResponse.json({error:"roomId مطلوب"},{status:400});
 const {data:room}=await supabase.from("rooms").select("id,is_active").eq("id",roomId).single();
 if(!room?.is_active)return NextResponse.json({error:"الغرفة غير متاحة"},{status:404});
 const url=process.env.LIVEKIT_URL, key=process.env.LIVEKIT_API_KEY, secret=process.env.LIVEKIT_API_SECRET;
 if(!url||!key||!secret)return NextResponse.json({error:"LiveKit غير مضبوط بعد"},{status:503});
 const token=new AccessToken(key,secret,{identity:user.id,name:user.user_metadata?.display_name??user.email??user.id,ttl:"2h"});
 token.addGrant({roomJoin:true,room:roomId});
 return NextResponse.json({url,token:await token.toJwt()});
}
