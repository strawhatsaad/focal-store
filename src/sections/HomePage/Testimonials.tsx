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
    text: "Ordering my contact lenses from Focal was incredibly easy — just a few clicks and they arrived within days!",
    imageSrc: avatar1.src,
    name: "Jamie Rivera",
  },
  {
    text: "I’m impressed by the wide variety of contact lenses Focal offers. I finally found the perfect fit for my eyes.",
    imageSrc: avatar2.src,
    name: "Josh Smith",
  },
  {
    text: "Focal made it possible for me to get high-quality lenses at a price I can actually afford. Total game-changer!",
    imageSrc: avatar3.src,
    name: "Morgan Lee",
  },
  {
    text: "Thanks to Focal’s clear and comfortable lenses, I can go about my day without even noticing I’m wearing them.",
    imageSrc: avatar4.src,
    name: "Casey Jordan",
  },
  {
    text: "I love that Focal supports people with vision needs — their affordable lenses helped me see clearly without breaking the bank.",
    imageSrc: avatar5.src,
    name: "Taylor Kim",
  },
  {
    text: "As someone new to contacts, I appreciated how simple Focal’s process was. Their support even helped me choose the right type!",
    imageSrc: avatar6.src,
    name: "Riley Smith",
  },
  {
    text: "Switching to Focal’s contact lenses was the best decision I made. No irritation, no dryness — just all-day comfort.",
    imageSrc: avatar7.src,
    name: "Jordan Patels",
  },
  {
    text: "Focal’s lens subscription plan saves me time and money. I never have to worry about running out!",
    imageSrc: avatar8.src,
    name: "Sam Dawson",
  },
  {
    text: "Vision is so important, and Focal makes it accessible. I can see better, work better, and feel better — all thanks to their lenses.",
    imageSrc: avatar9.src,
    name: "Jim Harper",
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
