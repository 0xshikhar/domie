import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
