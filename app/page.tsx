import { BestSellersSection } from "@/components/home/best-sellers-section";
import { CategorySection } from "@/components/home/category-section";
import { ExclusiveSection } from "@/components/home/exclusive-section";
import { FeaturedCollectionsSection } from "@/components/home/featured-collections-section";
import { GemstoneSection } from "@/components/home/gemstone-section";
import { HeroSection } from "@/components/home/hero-section";
import { NewArrivalsSection } from "@/components/home/new-arrivals-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { WhyChooseUsSection } from "@/components/home/why-choose-us-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <BestSellersSection />
      <GemstoneSection />
      <NewArrivalsSection />
      <FeaturedCollectionsSection />
      <ExclusiveSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
