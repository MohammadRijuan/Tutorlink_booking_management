import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Tutorlink | Tuition Management',
  description: 'Premium tuition booking management dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
