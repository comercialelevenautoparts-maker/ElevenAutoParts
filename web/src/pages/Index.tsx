import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import ProductsSection from '@/components/home/ProductsSection';
import ExperienceSection from '@/components/home/ExperienceSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FAQSection from '@/components/home/FAQSection';
import SeamlessExperience from '@/components/home/SeamlessExperience';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProductsSection />
        <ExperienceSection />
        <TestimonialsSection />
        <FAQSection />
        <SeamlessExperience />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
