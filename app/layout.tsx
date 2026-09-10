import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Two poems — Craig Smith',description:'Never A Different Tomorrow and The Full-Sized Edition. Two poems by Craig Smith, with shifting ASCII geographies.',authors:[{name:'Craig Smith'}]};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en-AU"><body>{children}</body></html>;}
