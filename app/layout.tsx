import "./globals.css";
import "./logo.css";
export const metadata={title:"Bhajiwala | Pav Bhaji, Full Power",description:"Fresh pav bhaji delivery inside Shri Krishna Science Centre, Patna.",manifest:"/manifest.webmanifest",icons:{icon:"/logo.svg",apple:"/logo.svg"},appleWebApp:{capable:true,title:"Bhajiwala",statusBarStyle:"default"}};
export const viewport={themeColor:"#d74722"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
