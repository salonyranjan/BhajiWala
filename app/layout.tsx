import "./globals.css";
import "./logo.css";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata={title:"Bhajiwala | Pav Bhaji, Full Power",description:"Food delivery, Pune.",manifest:"/manifest.webmanifest",icons:{icon:"/logo.svg",apple:"/logo.svg"},appleWebApp:{capable:true,title:"Bhajiwala",statusBarStyle:"default"}};
export const viewport: Viewport={themeColor:"#d74722"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
