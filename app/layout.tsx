import "./globals.css";
import { getAppConfig } from "../lib/app-config";

export default async function RootLayout({children}:{children:React.ReactNode}){
 const cfg=await getAppConfig();
 const t=cfg.theme??{};
 const cssVars={
  "--app-primary":t.primary??"#7c3aed",
  "--app-accent":t.accent??"#ec4899",
  "--app-bg":t.background??"#07070a",
  "--app-card":t.card??"#111116",
  "--app-text":t.text??"#f7f7f8",
  "--app-muted":t.muted??"#a1a1aa",
  "--app-border":t.border??"rgba(255,255,255,.09)",
  "--app-input":t.input??"rgba(255,255,255,.055)",
  "--app-success":t.success??"#22c55e",
  "--app-danger":t.danger??"#ef4444",
  "--app-radius":t.radius??"1.25rem",
  "--app-font":t.font??"Arial, Noto Sans Arabic, sans-serif"
 } as React.CSSProperties;
 return <html lang="ar" dir="rtl"><body style={cssVars}>{children}</body></html>
}
export const metadata={title:"Voice Rooms",description:"منصة غرف صوتية مباشرة"};
