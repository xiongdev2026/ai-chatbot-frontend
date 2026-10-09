import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastContainer } from "react-toastify";

const Phetsarath = localFont({
  src: "../fonts/Phetsarath_OT.ttf",
  variable: "--Phetsarath_OT",
});

export const metadata: Metadata = {
  title: "AI Chatbot",
  description: "A simple AI chatbot built with Next.js and Google Gemini API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${Phetsarath.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </body>
    </html>
  );
}
