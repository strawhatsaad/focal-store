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
    <section className="mt-6 md:mt-16">
      <div className="container">
        <div className="flex flex-col items-center md:gap-y-2 lg:gap-y-4">
          <h2 className="font-black text-3xl md:text-4xl lg:text-7xl tracking-tighter text-center bg-gradient-to-b from-black to-[#001E80] text-transparent bg-clip-text">
            Lens Types
          </h2>
          <p className="text-sm md:text-lg lg:text-xl font-medium text-center md:tracking-tighter lg:tracking-normal">
            Match your high-end frame with the perfect lens
          </p>
        </div>
        <div className="mt-8 md:mt-14 lg:mt-20">
          <div className="mx-auto flex flex-col justify-center items-center gap-4 md:gap-4 lg:gap-10">
            <div className="hidden md:grid md:grid-cols-3 md:gap-6 lg:gap-10 w-[375px] md:w-[750px] lg:w-[1200px] md:min-h-[350px] lg:min-h-[450px]">
              <div
                className="relative w-full md:h-[325px] lg:h-[450px] rounded-3xl hover:md:h-[350px] hover:lg:h-[475px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${antiReflective.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -195px",
                }}
              >
                <div className="absolute flex justify-center items-center md:bottom-8 lg:bottom-14 w-full">
                  <LinkButton
                    title="Anti-Reflective Lens"
                    sectionId="anti-reflective-btn"
                    textStyles="md:text-sm lg:text-lg"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-8 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
              <div
                className="relative w-full md:h-[325px] lg:h-[450px] rounded-3xl hover:md:h-[350px] hover:lg:h-[475px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${scratchResistant.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -195px",
                }}
              >
                <div className="absolute flex justify-center items-center md:bottom-8 lg:bottom-14 w-full">
                  <LinkButton
                    title="Scratch-Resistant Lens"
                    sectionId="scratch-resistant-btn"
                    textStyles="md:text-sm lg:text-lg"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-8 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
              <div
                className="relative w-full md:h-[325px] lg:h-[450px] rounded-3xl hover:md:h-[350px] hover:lg:h-[475px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${smudgeResistant.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -55px",
                }}
              >
                <div className="absolute flex justify-center items-center md:bottom-8 lg:bottom-14 w-full">
                  <LinkButton
                    title="Smudge-Resistant Lens"
                    sectionId="smudge-resistant-btn"
                    textStyles="md:text-sm lg:text-lg"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-8 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
            </div>
            <div className="hidden md:grid md:grid-cols-4 gap-10 md:w-[750px] lg:w-[1200px] md:min-h-[225px] lg:min-h-[325px]">
              <div
                className="relative w-full md:h-[200px] lg:h-[300px] rounded-3xl hover:md:h-[225px] hover:lg:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${progressive.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -65px",
                }}
              >
                <div className="absolute flex justify-center items-center md:bottom-6 lg:bottom-10 w-full">
                  <LinkButton
                    title="Progressive Lens"
                    sectionId="progressive-btn"
                    textStyles="md:text-xs lg:text-lg"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
              <div
                className="relative w-full md:h-[200px] lg:h-[300px] rounded-3xl hover:md:h-[225px] hover:lg:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${blueLight.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -120px",
                }}
              >
                <div className="absolute flex justify-center items-center md:bottom-6 lg:bottom-10 w-full">
                  <LinkButton
                    title="Blue Light Lens"
                    sectionId="blue-light-btn"
                    textStyles="md:text-xs lg:text-lg"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
              <div
                className="relative w-full md:h-[200px] lg:h-[300px] rounded-3xl hover:md:h-[225px] hover:lg:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${photochromatic.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -45px",
                }}
              >
                <div className="absolute flex justify-center items-center md:bottom-6 lg:bottom-10 w-full">
                  <LinkButton
                    title="Photochromic Lens"
                    sectionId="photochromatic-btn"
                    textStyles="md:text-xs lg:text-lg"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
              <div
                className="relative w-full md:h-[200px] lg:h-[300px] rounded-3xl hover:md:h-[225px] hover:lg:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${sunglasses.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -25px",
                }}
              >
                <div className="absolute flex justify-center items-center md:bottom-6 lg:bottom-10 w-full">
                  <LinkButton
                    title="Sunglasses"
                    sectionId="sunglasses-btn"
                    textStyles="md:text-xs lg:text-lg"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
            </div>

            {/* Mobile */}

            {/* Row 1 */}
            <div className="grid grid-cols-2 md:hidden gap-4 justify-center items-baseline w-[375px] min-h-[200px]">
              <div
                className="relative w-full h-[200px] md:h-[200px] lg:h-[300px] rounded-3xl hover:md:h-[225px] hover:lg:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${antiReflective.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -65px",
                }}
              >
                <div className="absolute flex justify-center items-center bottom-4 w-full">
                  <LinkButton
                    title="Anti-Reflective Lens"
                    sectionId="anti-reflective-btn"
                    textStyles="text-xs"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
              <div
                className="relative w-full h-[200px] md:h-[200px] lg:h-[300px] rounded-3xl hover:md:h-[225px] hover:lg:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${scratchResistant.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -65px",
                }}
              >
                <div className="absolute flex justify-center items-center bottom-4 w-full">
                  <LinkButton
                    title="Scratch Resistant Lens"
                    sectionId="scratch-resistant-btn"
                    textStyles="text-xs"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 md:hidden gap-4 justify-center items-baseline w-[375px] min-h-[200px]">
              <div
                className="relative w-full h-[200px] md:h-[200px] lg:h-[300px] rounded-3xl hover:md:h-[225px] hover:lg:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${progressive.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -65px",
                }}
              >
                <div className="absolute flex justify-center items-center bottom-4 w-full">
                  <LinkButton
                    title="Progressive Lens"
                    sectionId="progressive-btn"
                    textStyles="text-xs"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
              <div
                className="relative w-full h-[200px] md:h-[200px] lg:h-[300px] rounded-3xl hover:md:h-[225px] hover:lg:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${blueLight.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -110px",
                }}
              >
                <div className="absolute flex justify-center items-center bottom-4 w-full">
                  <LinkButton
                    title="Blue Light Lens"
                    sectionId="blue-light-btn"
                    textStyles="text-xs"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 md:hidden gap-4 justify-center items-baseline w-[375px] min-h-[200px]">
              <div
                className="relative w-full h-[200px] md:h-[200px] lg:h-[300px] rounded-3xl hover:md:h-[225px] hover:lg:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${photochromatic.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -65px",
                }}
              >
                <div className="absolute flex justify-center items-center bottom-4 w-full">
                  <LinkButton
                    title="Photochromatic Lens"
                    sectionId="photochromatic-btn"
                    textStyles="text-xs"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
              <div
                className="relative w-full h-[200px] md:h-[200px] lg:h-[300px] rounded-3xl hover:md:h-[225px] hover:lg:h-[325px] transition-all duration-[350ms]"
                style={{
                  backgroundImage: `url('${sunglasses.src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom 0px left -20px",
                }}
              >
                <div className="absolute flex justify-center items-center bottom-4 w-full">
                  <LinkButton
                    title="Sunglasses"
                    sectionId="sunglasses-btn"
                    textStyles="text-xs"
                    containerStyles="bg-white text-black px-4 py-2 lg:px-6 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center mt-8">
          <button className="btn btn-text gap-1 flex items-center hover:font-bold hover:scale-105 transition-all duration-[350ms]">
            <span className="font-semibold">View All Lens Types</span>
            <ArrowIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
