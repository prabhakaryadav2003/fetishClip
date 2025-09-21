import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <header className="border-b border-gray-200">
        <Navbar />
      </header>
      {children}
      <footer className="mt-auto">
        <Footer />
      </footer>
    </section>
  );
}
