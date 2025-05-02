import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import avatar5 from "@/assets/avatar-5.png";
import avatar6 from "@/assets/avatar-6.png";
import avatar7 from "@/assets/avatar-7.png";
import avatar8 from "@/assets/avatar-8.png";
import avatar9 from "@/assets/avatar-9.png";
import TestimonialsColumn from "@/components/TestimonialsColumn";

export const testimonials = [
  {
    text: "The anti-reflective lens from Focal is a game-changer — no more annoying glare during night drives or Zoom calls!",
    imageSrc: avatar1.src,
    name: "Jamie Rivera",
    username: "@jamietechguru00",
  },
  {
    text: "I’ve dropped my glasses a dozen times and not a single scratch — Focal’s scratch-resistant lens really holds up! ",
    imageSrc: avatar2.src,
    name: "Josh Smith",
    username: "@jjsmith",
  },
  {
    text: "Smudges used to drive me crazy, but Focal’s smudge-resistant lens stays crystal clear all day. Love it!",
    imageSrc: avatar3.src,
    name: "Morgan Lee",
    username: "@morganleewhiz",
  },
  {
    text: "My eyes feel so much less strained now. The blue-light lens from Focal is perfect for long hours in front of a screen.",
    imageSrc: avatar4.src,
    name: "Casey Jordan",
    username: "@caseyj",
  },
  {
    text: "Focal’s photochromatic lens seamlessly adapts to light — it’s like having two pairs of glasses in one. Super convenient!",
    imageSrc: avatar5.src,
    name: "Taylor Kim",
    username: "@taylorkimm",
  },
  {
    text: "I was hesitant to try progressive lenses, but Focal nailed it. Sharp vision at every distance without the weird adjustment period.",
    imageSrc: avatar6.src,
    name: "Riley Smith",
    username: "@rileysmith1",
  },
  {
    text: "These are hands-down the most stylish and functional sunglasses I’ve ever owned. Focal doesn’t miss!",
    imageSrc: avatar7.src,
    name: "Jordan Patels",
    username: "@jpatelsdesign",
  },
  {
    text: "Focal’s attention to detail is unmatched. Every lens feels high-quality and purpose-built for modern life.",
    imageSrc: avatar8.src,
    name: "Sam Dawson",
    username: "@dawsontechtips",
  },
  {
    text: "I’ve tried other brands, but nothing compares to the clarity and comfort I get with Focal lenses. Totally worth it!",
    imageSrc: avatar9.src,
    name: "Casey Harper",
    username: "@casey09",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const Testimonials = () => {
  return (
    <section className="bg-white mt-20" id="testimonials">
      <div className="container">
        <div className="section-heading">
          <h1 className="section-title mt-5 text-center">
            What our customers say
          </h1>
          <p className="section-description mt-4 md:mt-5">
            Their words, not ours - honest feedback from our happy customers.
          </p>
        </div>
        <div className="flex justify-center gap-6 mt-20 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[738px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
};
