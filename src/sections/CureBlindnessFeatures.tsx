import cureBlindnessImage1 from "@/assets/cure-blindness-image1.png";
import cureBlindnessImage2 from "@/assets/cure-blindness-image2.jpg";
import LinkButton from "@/components/LinkButton";
import Image from "next/image";

export const CureBlindnessFeatures = () => {
  return (
    <section className="mt-20">
      <div className="container">
        <div className="flex flex-row gap-10 min-h-[700px]">
          <div
            className="relative w-[1800px] h-[600px] rounded-3xl hover:h-[650px] transition-all duration-[350ms]"
            style={{
              backgroundImage: `url('${cureBlindnessImage1.src}')`,
              backgroundSize: "cover",
              backgroundPosition: "bottom 0px left -195px",
            }}
          >
            <div className="bg-gradient-to-b from-transparent to-black/80 absolute top-0 left-0 w-full h-full rounded-3xl" />
            <div className="absolute flex flex-col bottom-20 ml-5 rounded-3xl">
              <h2 className="text-[40px] text-white font-extrabold tracking-tight">
                Focused on Vision
              </h2>
              <p className="text-white text-2xl font-semibold">
                Subtext to be added later
              </p>
              <div className="flex gap-4 mt-4">
                <LinkButton
                  title="Contact Lenses"
                  sectionId="contact-lenses-btn"
                  containerStyles="bg-white text-black px-4 py-2 lg:px-8 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                />
                <LinkButton
                  title="Glasses"
                  sectionId="glasses-btn"
                  containerStyles="bg-white text-black px-4 py-2 lg:px-8 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                />
              </div>
            </div>
          </div>
          <div
            className="w-[1800px] rounded-3xl h-[600px] relative mt-12 hover:h-[650px] transition-all duration-[350ms]"
            style={{
              backgroundImage: `url('${cureBlindnessImage2.src}')`,
              backgroundSize: "cover",
              backgroundPosition: "bottom 20px left -135px",
            }}
          >
            <div className="bg-gradient-to-b from-transparent to-black/80 absolute top-0 left-0 w-full h-full rounded-3xl" />
            <div className="absolute flex flex-col bottom-20 ml-5 rounded-3xl">
              <h2 className="text-[40px] text-white font-extrabold tracking-tight">
                Focused on Vision
              </h2>
              <p className="text-white text-2xl font-semibold">
                Subtext to be added later
              </p>
              <div className="flex gap-4 mt-4">
                <LinkButton
                  title="Learn More"
                  sectionId="learn-more-btn"
                  containerStyles="bg-white text-black px-4 py-2 lg:px-8 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
