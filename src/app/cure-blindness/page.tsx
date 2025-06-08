// src/app/cure-blindness/page.tsx
import React from 'react';
import { Users, Microscope, HandHeart, ShieldCheck, Globe } from 'lucide-react';
import cureBlindnessLogo from '@/assets/logo-header-light.png';
import cureBlindnessHero from "@/assets/CureBlindness/littlegirlinred-lg.jpg";
import surgeonPic from "@/assets/CureBlindness/homepage-hero-expanded-4.jpg";
import surgeonPic2 from "@/assets/CureBlindness/IMG20250508140546.jpg";
import mapImage from "@/assets/CureBlindness/MapChart_Map-2.png";
import Image from 'next/image';

// Stat Card Component
const StatCard = ({ value, label, sublabel }: { value: string, label: string, sublabel: string }) => (
    <div className="text-white text-center md:text-left">
        <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-yellow-300">{value}</p>
        <p className="mt-1 text-lg sm:text-xl lg:text-2xl font-semibold uppercase">{label}</p>
        <p className="text-sm sm:text-base lg:text-lg uppercase">{sublabel}</p>
    </div>
);

// Why We Help List Item Component
const WhyHelpItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start">
        <span className="flex-shrink-0 w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3"></span>
        <span className="text-gray-700">{children}</span>
    </li>
);

// How We Help Icon Component
const HowWeHelpIcon = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-gray-300 bg-gray-50 text-teal-700">
            {icon}
        </div>
        <p className="mt-3 text-sm font-semibold uppercase text-gray-600">{title}</p>
    </div>
);


const CureBlindnessPage = () => {
  return (
    <div className="bg-gray-100 font-sans">
      <main>
        {/* --- Hero Section --- */}
        <section className="relative bg-[#2c5b6b] text-white">
            <div className="absolute inset-0">
                <Image
                    src={cureBlindnessHero}
                    alt="Happy people with restored vision"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#2c5b6b]/95 via-[#2c5b6b]/35 to-transparent"></div>
            </div>
            <div className="relative container mx-auto px-4 sm:px-6 py-20 md:py-28 lg:py-32">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-4 mb-4">
                       <Image src={cureBlindnessLogo} alt="Cure Blindness Logo" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                        OVERCOMING THE MOUNTAIN OF GLOBAL BLINDNESS
                    </h1>
                </div>
            </div>
        </section>

        {/* --- Envisioning a World Section --- */}
        <section className="py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="lg:grid lg:grid-cols-3 lg:gap-12">
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2c5b6b] tracking-tight">ENVISIONING A WORLD WITHOUT AVOIDABLE BLINDNESS</h2>
                        <p className="mt-6 text-lg font-bold text-gray-800">
                            Globally, 43 million people are blind—80% of this burden is treatable or preventable.
                        </p>
                        <ul className="mt-6 space-y-4 text-gray-700 text-base sm:text-lg">
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-2 h-2 bg-gray-500 rounded-full mt-2.5 mr-4"></span>
                                <span><span className="font-bold">17 million people are blind due to untreated cataracts alone</span>, a condition that can be cured with a ten-minute surgery and under $25 in material costs.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-2 h-2 bg-gray-500 rounded-full mt-2.5 mr-4"></span>
                                <span>There are millions in the world who needlessly suffer from corneal blindness... For the 12.7 million people waiting for a corneal transplant, <span className="font-bold">only one cornea is available for every 70 needed.</span></span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-2 h-2 bg-gray-500 rounded-full mt-2.5 mr-4"></span>
                                <span>Due to a severe shortage of eye care providers and aging and growing populations, the global backlog of treatable blindness will only increase if effective solutions are not realized.</span>
                            </li>
                             <li className="flex items-start">
                                <span className="flex-shrink-0 w-2 h-2 bg-gray-500 rounded-full mt-2.5 mr-4"></span>
                                <span>Globally, Cure Blindness Project has over 65 implementing partners and a volunteer network of over 100 collaborators. Our 2023 acquisition of SightLife International... expands our reach and magnifies our impact further.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="mt-12 lg:mt-0 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#f68d2e]">
                            <h3 className="text-xl font-bold text-[#2c5b6b] uppercase">Our Vision</h3>
                            <p className="mt-2 text-gray-700">A world where no one is needlessly blind.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#f68d2e]">
                            <h3 className="text-xl font-bold text-[#2c5b6b] uppercase">Our Mission</h3>
                            <p className="mt-2 text-gray-700">We enable countries to cure avoidable blindness by developing high-quality, cost-effective eye care in underserved areas of the world.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Impact Section --- */}
        <section className="bg-[#42889e] py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center text-white mb-12">
                    <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">Impact Since The Beginning</h2>
                    <p className="mt-2 text-lg">Together with our supporters and partners:</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
                    <StatCard value="1.6 Million" label="Globally" sublabel="Surgeries Performed" />
                    <StatCard value="16.5 Million" label="Screenings" sublabel="and Basic Treatments" />
                    <StatCard value="20,100" label="Eye Care Professionals" sublabel="From 43 Countries Received Training" />
                    <StatCard value="50,000" label="Cases of" sublabel="Corneal Blindness Prevented" />
                    <StatCard value="200,000+" label="Corneas" sublabel="Provided Through Eye Bank Partners" />
                    <StatCard value="5" label="Eye Hospitals" sublabel="& Training Institutes Established" />
                </div>
            </div>
        </section>

        {/* --- Why & How We Help Section --- */}
        <section className="py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-start">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2c5b6b] tracking-tight">WHY WE HELP</h2>
                        <p className="mt-4 text-gray-700 sm:text-lg">For millions of people, blindness is treatable. Unfortunately, 90% of people suffering from vision loss live in low and middle-income countries where a solution isn&apos;t available. Without care, blindness dramatically affects individuals, their families and their communities.</p>
                        <ul className="mt-6 space-y-4 text-base sm:text-lg">
                            <WhyHelpItem>Blind children are more likely to die in childhood than children with good vision, especially in low-income countries.</WhyHelpItem>
                            <WhyHelpItem>Vision loss is linked to social exclusion more broadly, including the experience of negative attitudes, violence and bullying, sexual assault, and loneliness.</WhyHelpItem>
                            <WhyHelpItem>The restoration of sight helps break the cycle of poverty and inequity. Studies show that as many as 90% of blind individuals in poor communities cannot work. 55% of the world&apos;s blind are women - and 90% of women who are blind are living in poverty.</WhyHelpItem>
                             <WhyHelpItem>Sight helps people learn. Children can learn twice as much when they see clearly.</WhyHelpItem>
                        </ul>
                    </div>
                    <div className="mt-12 flex flex-col gap-y-4 lg:mt-0">
                         <Image src={surgeonPic} alt="Surgeons performing eye surgery" className="w-full h-auto rounded-lg" />
                         <Image src={surgeonPic2} alt="Surgeons performing eye surgery" className="w-full h-auto rounded-lg" />
                    </div>
                </div>

                <div className="mt-16 sm:mt-24">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-[#2c5b6b] tracking-tight">HOW WE HELP</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-center text-gray-700 sm:text-lg">Cure Blindness Project&apos;s approach to eye care is unique—it focuses on building local capacity, ensuring quality infrastructure and equipment are available, enabling quality patient care and aiding effective prevention. We provide training and equipment to healthcare professionals, who then go on to provide eye care services in their own communities. This action-based approach builds local leadership, empowers key actors, and develops sustainable practices from the ground up.</p>
                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
                        <HowWeHelpIcon icon={<Users size={48} />} title="Local Capacity" />
                        <HowWeHelpIcon icon={<Microscope size={48} />} title="Infrastructure & Equipment" />
                        <HowWeHelpIcon icon={<HandHeart size={48} />} title="Patient Care" />
                        <HowWeHelpIcon icon={<ShieldCheck size={48} />} title="Prevention" />
                    </div>
                </div>
            </div>
        </section>

        {/* --- Where We Started & Work Section --- */}
        <section className="bg-white py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-[#2c5b6b] tracking-tight">WHERE WE STARTED</h2>
                    <p className="mt-4 text-center text-gray-700 sm:text-lg">Founded in 1995 as the Himalayan Cataract Project, Cure Blindness Project is a global nonprofit organization driven to help people retain or regain their sight. We envision a world where no one is needlessly blind. To make that happen, we enable underserved communities to cure avoidable blindness by developing high-quality, cost-effective, sustainable eye care wherever they are. What began in the mountains of Nepal has grown today to millions of surgeries, screenings and treatments performed in over 30 countries-and we won&apos;t stop until everyone in the world with avoidable blindness can see.</p>
                </div>

                <div className="mt-16 sm:mt-20 lg:mt-24 p-8 sm:p-12 bg-gray-50 rounded-2xl shadow-inner border">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-[#2c5b6b] tracking-tight">WHERE WE WORK</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-center text-gray-700 sm:text-lg">Cure Blindness Project tackles avoidable blindness in over 30 countries in South Asia and sub-Saharan Africa with core country operations in Nepal, Bhutan, India, Ethiopia, and Ghana. Expansion initiatives are underway in countries including South Sudan, Tanzania, the Philippines, Eritrea, and Somaliland.</p>
                    <div className="mt-8">
                         <Image src={mapImage} alt="World map showing areas of operation for the Cure Blindness Project, highlighting regions in South Asia and sub-Saharan Africa." className="w-full h-auto" />
                    </div>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
};

export default CureBlindnessPage;
