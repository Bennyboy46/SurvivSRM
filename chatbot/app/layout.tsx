import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SurvivSRM",
  description: "A bold, conversational companion for SRMIST to check attendance, marks, and timetable.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <footer className="madeby-footer" aria-label="Credits">
          <span>Made by </span>
          <a href="https://github.com/Bennyboy46" target="_blank" rel="noopener noreferrer">
            Bennyboy46
          </a>
        </footer>
      </body>
    </html>
  );
}
