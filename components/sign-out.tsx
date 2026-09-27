"use client";
import { createBrowserClient } from "@supabase/ssr";
export default function SignOut(){const s=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);return <button className="btn-ghost" onClick={async()=>{await s.auth.signOut();location.href="/"}}>خروج</button>}
