import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Poster App',
  description: 'Convierte cualquier enlace en publicaciones optimizadas para Instagram y Substack Notes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-900 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );

  
}
