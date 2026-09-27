import "./globals.css";
import { getAppConfig } from "../lib/app-config";
export default async function RootLayout({children}:{children:React.ReactNode}){
 const cfg=await getAppConfig();
 const t=cfg.theme??{};
 return <html lang="ar" dir="rtl"><body style={{"--primary":t.primary??"#7c3aed","--accent":t.accent??"#ec4899","--app-bg":t.background??"#07070a","--card":t.card??"#111116","--radius":t.radius??"1.25rem"} as React.CSSProperties}>{children}</body></html>
}
export const metadata={title:"Voice Rooms",description:"منصة غرف صوتية مباشرة"};
