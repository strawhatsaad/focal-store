import blogImage1 from "@/assets/What it Takes to Create Quailty Eywear.png";
import blogImage2 from "@/assets/How to Buy Contacts Online.png";
import blogImage3 from "@/assets/How to Buy Glasses Online.png";
import blogImage4 from "@/assets/How to Measure Your PD.png";
import blogImage5 from "@/assets/How To Read a Prescription.png";
import blogImage6 from "@/assets/How We're Fixing The Blindness Problem.png";
import blogImage7 from "@/assets/How to use vision insurance.png";
import Image, { StaticImageData } from "next/image"; // Ensure StaticImageData is imported if you use it for type
import Link from "next/link";

interface BlogItem {
  image: StaticImageData; // Or string if you pass URLs
  title: string;
}

const blogData: BlogItem[] = [
  {
    image: blogImage1,
    title: "What it Takes to Create Quality Eyewear",
  },
  {
    image: blogImage2,
    title: "How to Buy Contacts Online",
  },
  {
    image: blogImage3,
    title: "How to Buy Glasses Online",
  },
  {
    image: blogImage4,
    title: "How to Measure Your PD",
  },
  {
    image: blogImage5,
    title: "How To Read a Prescription",
  },
  {
    image: blogImage6,
    title: "How We're Fixing The Blindness Problem",
  },
  {
    image: blogImage7,
    title: "How to use vision insurance",
  },
];

export const Blogs = () => {
  return (
    // Adjusted top margin for different screen sizes
    <section className="mt-16 sm:mt-20 md:mt-24">
      <div className="container mx-auto px-4">
        {" "}
        {/* Changed max-w-7xl to container for consistency */}
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 max-w-2xl text-center">
            {/* Adjusted text sizes */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-7xl font-black tracking-tighter bg-gradient-to-b from-black to-[#001E80] text-transparent bg-clip-text">
              We know a thing or two about eyes
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-medium">
              Eye-opening reads you&apos;ll actually want to see.
            </p>
          </div>

          {/* Responsive grid for blog items */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-5 md:gap-6 lg:gap-8 w-full mt-6 sm:mt-8">
            {blogData.map(({ image, title }, index) => (
              <Link
                key={index}
                href={"/"} // Update with actual blog link if available
                className="group flex flex-col items-center text-center"
              >
                <div className="w-full aspect-[4/3] sm:aspect-[3/2] md:aspect-square lg:aspect-[3/4] overflow-hidden rounded-lg mb-2 sm:mb-3 group-hover:-translate-y-1 transition-transform duration-300">
                  <Image
                    src={image}
                    alt={title}
                    layout="responsive" // Use responsive layout for better scaling
                    width={image.width} // Provide original width
                    height={image.height} // Provide original height
                    className="object-cover w-full h-full" // Ensure image covers its container
                  />
                </div>
                {/* Adjusted text sizes and line clamping for titles */}
                <p className="text-[10px] xs:text-xs sm:text-sm font-semibold tracking-tight group-hover:underline line-clamp-2 sm:line-clamp-3">
                  {title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
