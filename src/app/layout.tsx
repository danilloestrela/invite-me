import { Toaster } from "@/components/ui/toaster";
import ReactQueryProvider from "@/lib/providers/ReactQueryProviders";
import { Lily_Script_One, Poppins } from "next/font/google";
import "./globals.css";
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-poppins',
})

const lilyScript = Lily_Script_One({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-lily-script',
})



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${lilyScript.variable} antialiased bg-[url('/assets/bg.jpg')] bg-repeat`}
      >
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
