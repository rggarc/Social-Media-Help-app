import './globals.css';

export const metadata = {
  title: 'Social Poster App',
  description: 'Generador de contenido para redes sociales',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
