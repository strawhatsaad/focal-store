import LinkButton from "@/components/LinkButton";
import Image from "next/image";
import MenuIcon from "@/assets/menu.svg";
import Logo from "@/assets/navBarLogo.png";
import { HeartIcon, SearchIcon, ShoppingCartIcon } from "lucide-react";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="sticky top-0 backdrop-blur-sm z-20 bg-white">
      <div className="flex justify-center items-center py-1 bg-white text-black text-sm gap-3">
        <p className="text-black lg:mt-5 lg:-mb-6 font-extrabold tracking-normal cursor-default hidden md:block hover:scale-110 transition-all duration-[350ms]">
          First Order? Save 20% + free shipping 🎉
        </p>
      </div>
      <div className="py-5 lg:pb-1">
        <div className="container">
          <div className="flex items-center justify-between">
            <Link href={"/"}>
              <Image
                src={Logo}
                alt="Focal Logo"
                height={180}
                width={180}
                className="hover:scale-110 transition-all duration-[350ms]"
              />
            </Link>
            <MenuIcon className="h-5 w-5 md:hidden" />
            <nav className="hidden md:flex gap-6 text-black/60 items-center">
              <LinkButton
                title="Contact Lenses"
                sectionId="contact-lenses-btn"
                containerStyles="hover:font-bold hover:scale-110 transition-all duration-[350ms]"
              />
              <LinkButton
                title="Eyewear"
                sectionId="eyewear-btn"
                containerStyles="hover:font-bold hover:scale-110 transition-all duration-[350ms]"
              />
              <LinkButton
                title="Sunglasses"
                sectionId="sunglasses-btn"
                containerStyles="hover:font-bold hover:scale-110 transition-all duration-[350ms]"
              />
              <LinkButton
                title="Eyehealth"
                sectionId="eyehealth-btn"
                containerStyles="hover:font-bold hover:scale-110 transition-all duration-[350ms]"
              />
              <LinkButton
                title="Learning Center"
                sectionId="learning-center-btn"
                containerStyles="hover:font-bold hover:scale-110 transition-all duration-[350ms]"
              />
              <LinkButton
                title="Sign in"
                sectionId="sing-in-btn"
                containerStyles="bg-black text-white px-4 py-2 lg:px-8 lg:py-2 rounded-full font-medium inline-flex align-items justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-[350ms]"
              />
              <SearchIcon
                strokeWidth={3}
                color="#000000"
                size={32}
                className="hover:scale-125 transition-all duration-[350ms]"
              />
              <HeartIcon
                strokeWidth={3}
                color="#000000"
                size={32}
                className="hover:scale-125 transition-all duration-[350ms]"
              />
              <ShoppingCartIcon
                strokeWidth={3}
                color="#000000"
                size={32}
                className="hover:scale-125 transition-all duration-[350ms]"
              />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
