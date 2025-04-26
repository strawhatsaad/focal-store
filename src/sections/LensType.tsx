import antiReflective from "@/assets/antiReflective.jpg";
import scratchResistant from "@/assets/scratch-resistant.webp";
import smudgeResistant from "@/assets/smudge-resistant.jpg";
import progressive from "@/assets/progressive.png";
import blueLight from "@/assets/blue-light.jpg";
import photochromatic from "@/assets/photochromatic.jpg";
import sunglasses from "@/assets/sunglasses.jpg";
import ArrowIcon from "@/assets/arrow-right.svg";
import LinkButton from "@/components/LinkButton";

export const LensType = () => {
  return (
    <section className="mt-16">
      <div className="container">
        <div className="flex flex-col items-center gap-y-4">
          <h2 className="font-black text-7xl tracking-tighter text-center bg-gradient-to-b from-black to-[#001E80] text-transparent bg-clip-text">
            Lens Type
          </h2>
          <p className="text-xl font-medium text-center">
            Match your high-end frame with the perfect lens
          </p>
        </div>
        <div className="mt-20">
          <div className="mx-auto flex flex-col justify-center items-center gap-10">
            <div className="grid grid-cols-3 gap-10 w-[1200px] min-h-[475px]">
              <div
                className="relative w-full h-[450px] rounded-3xl hover:h-[475px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${antiReflective.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -195px",
                }}
              >
                <div className="absolute flex justify-center items-center bottom-14 w-full">
                  <LinkButton
                    title="Anti-Reflective Lens"
                    sectionId="anti-reflective-btn"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-8 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
              <div
                className="relative w-full h-[450px] rounded-3xl hover:h-[475px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${scratchResistant.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -195px",
                }}
              >
                <div className="absolute flex justify-center items-center bottom-14 w-full">
                  <LinkButton
                    title="Scratch-Resistant Lens"
                    sectionId="scratch-resistant-btn"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-8 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
              <div
                className="relative w-full h-[450px] rounded-3xl hover:h-[475px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${smudgeResistant.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -55px",
                }}
              >
                <div className="absolute flex justify-center items-center bottom-14 w-full">
                  <LinkButton
                    title="Smudge-Resistant Lens"
                    sectionId="smudge-resistant-btn"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-8 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-10 w-[1200px] min-h-[325px]">
              <div
                className="relative w-full h-[300px] rounded-3xl hover:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${progressive.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -65px",
                }}
              >
                <div className="absolute flex justify-center items-center bottom-10 w-full">
                  <LinkButton
                    title="Progressive Lens"
                    sectionId="progressive-btn"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
              <div
                className="relative w-full h-[300px] rounded-3xl hover:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${blueLight.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -120px",
                }}
              >
                <div className="absolute flex justify-center items-center bottom-10 w-full">
                  <LinkButton
                    title="Blue Light Lens"
                    sectionId="blue-light-btn"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
              <div
                className="relative w-full h-[300px] rounded-3xl hover:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${photochromatic.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -45px",
                }}
              >
                <div className="absolute flex justify-center items-center bottom-10 w-full">
                  <LinkButton
                    title="Photochromatic Lens"
                    sectionId="photochromatic-btn"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
              <div
                className="relative w-full h-[300px] rounded-3xl hover:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${sunglasses.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -25px",
                }}
              >
                <div className="absolute flex justify-center items-center bottom-10 w-full">
                  <LinkButton
                    title="Sunglasses"
                    sectionId="sunglasses-btn"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center mt-8">
          <button className="btn btn-text gap-1 flex items-center hover:font-bold hover:scale-105 transition-all duration-[350ms]">
            <span className="font-semibold">
              Let&apos;s Fix The World&apos;s Vision Problem
            </span>
            <ArrowIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
