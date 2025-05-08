import { Blogs } from "@/sections/HomePage/Blogs";
import { ContactLenses } from "@/sections/HomePage/ContactLenses";
import { CureBlindnessDetails } from "@/sections/HomePage/CureBlindnessDetails";
import { CureBlindnessFeatures } from "@/sections/HomePage/CureBlindnessFeatures";
import { CureBlindnessVideo } from "@/sections/HomePage/CureBlindnessVideo";
import { FAQ } from "@/sections/HomePage/FAQ";
import { Footer } from "@/sections/HomePage/Footer";
import { Header } from "@/sections/HomePage/Header";
import { Headline } from "@/sections/HomePage/Headline";
import { Hero } from "@/sections/HomePage/Hero";
import { LensType } from "@/sections/HomePage/LensType";
import { Testimonials } from "@/sections/HomePage/Testimonials";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Headline />
      <ContactLenses />
      <CureBlindnessFeatures />
      <CureBlindnessDetails />
      <CureBlindnessVideo />
      <Blogs />
      <LensType />
      <Testimonials />
      <FAQ />
    </main>
  );
}
