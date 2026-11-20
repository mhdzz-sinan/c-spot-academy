import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'C-Spot Academy | Industrial 3D CAD & Product Engineering Workshops',
    template: '%s | C-Spot Academy',
  },
  description:
    'Hands-on SolidWorks 3D CAD, GD&T, and Mechanical Product Design bootcamps led by practicing product engineers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-500/20 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
