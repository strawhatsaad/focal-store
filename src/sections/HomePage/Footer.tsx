import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/NavBarFocalLogo 1.png";
import ArrowIcon from "@/assets/arrow-right.svg";
import {
  Facebook,
  InstagramIcon,
  MessageSquareIcon,
  PhoneCall,
  Youtube,
} from "lucide-react";
import visaIcon from "@/assets/visa.png";
import mastercardIcon from "@/assets/mastercard.png";
import discoverIcon from "@/assets/discover.png";
import paypalIcon from "@/assets/paypal.png";
import americanExpressIcon from "@/assets/american-express.png";
import fsaHsaIcon from "@/assets/fsahsa.png";

export const Footer = () => {
  return (
    <footer className="bg-black py-10">
      <div className="flex flex-col md:flex-row justify-center md:gap-16 lg:gap-24 items-start px-10 py-5 text-white mx-auto">
        <div className="flex flex-col gap-8 md:max-w-lg lg:max-w-md items-start">
          <div className="flex flex-col items-center md:items-start md:flex-col gap-5 md:gap-5">
            <Link href={"/"}>
              <Image
                src={Logo}
                alt="Focal Logo"
                height={180}
                width={180}
                className="hover:scale-110 transition-all duration-[350ms]"
              />
            </Link>
            <h2 className="font-bold text-sm text-center md:text-start md:text-xl lg:text-2xl">
              Your happiness, backed by our Gajillion Percent Promise
            </h2>
          </div>
          <button className="hidden btn btn-text gap-1 p-0 md:flex items-center hover:font-bold hover:scale-105 transition-all duration-[350ms]">
            <span className="font-semibold text-white">Learn More</span>
            <ArrowIcon className="h-5 w-5 text-white" />
          </button>
          <div className="flex w-full justify-center md:justify-start gap-4">
            <InstagramIcon className="w-[70px] h-[70px] md:w-[50px] md:h-[50px] text-white" />
            <Facebook className="w-[70px] h-[70px] md:w-[50px] md:h-[50px] text-white" />
            <Youtube className="w-[70px] h-[70px] md:w-[50px] md:h-[50px] text-white" />
          </div>
          <p className="font-medium text-white/30">We Accept</p>
          <div className="flex gap-3 md:gap-4 -mt-5 md:-mt-2">
            <Image src={visaIcon} alt="Visa" />
            <Image src={mastercardIcon} alt="Mastercard" />
            <Image src={discoverIcon} alt="Discover" />
            <Image src={americanExpressIcon} alt="American Express" />
            <Image src={paypalIcon} alt="PayPal" />
            <Image src={fsaHsaIcon} alt="FSA/HSA" />
          </div>
        </div>
        <div className="flex flex-col mt-10 md:mt-0 gap-16 justify-start">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-bold md:text-2xl lg:text-3xl">
                We&apos;re here to help.
              </h2>
              <p className="font-medium md:text-sm lg:text-[16px]">
                Real people with real answers in real time, 24/7.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex gap-2">
                <PhoneCall />
                <span>+1-123-456-7890</span>
              </div>
              <div className="flex gap-2">
                <MessageSquareIcon />
                <span>Chat with us</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="flex flex-col gap-1.5 md:gap-3 lg:gap-6 md:text-sm lg:text-xl">
              <h3 className="font-bold text-sm md:text-lg">About us</h3>
              <p className="text-xs md:text-sm">Our Story</p>
              <p className="text-xs md:text-sm">Community</p>
              <p className="text-xs md:text-sm">Careers</p>
            </div>
            <div className="flex flex-col gap-1.5 md:gap-3 lg:gap-6 md:text-sm lg:text-xl">
              <h3 className="font-bold text-sm md:text-lg">Help</h3>
              <p className="text-xs md:text-sm">How to order</p>
              <p className="text-xs md:text-sm">
                How to read your perscription
              </p>
              <p className="text-xs md:text-sm">Returns & exchanges</p>
              <p className="text-xs md:text-sm">Best-price guarantee</p>
              <p className="text-xs md:text-sm">FAQs</p>
              <p className="text-xs md:text-sm">Contact us</p>
            </div>
            <div className="flex flex-col gap-1.5 md:gap-3 lg:gap-6 md:text-sm lg:text-xl">
              <h3 className="font-bold text-sm md:text-lg">My Account</h3>
              <p className="text-xs md:text-sm">Order Status</p>
              <p className="text-xs md:text-sm">Reorder</p>
              <p className="text-xs md:text-sm">Upload Prescription</p>
              <p className="text-xs md:text-sm">My prescription</p>
              <p className="text-xs md:text-sm">My subscriptions</p>
            </div>
            <div className="flex flex-col gap-1.5 md:gap-3 lg:gap-6 md:text-sm lg:text-xl">
              <h3 className="font-bold text-sm md:text-lg">Resources</h3>
              <p className="text-xs md:text-sm">Eyewear</p>
              <p className="text-xs md:text-sm">Sunglasses</p>
              <p className="text-xs md:text-sm">Contact Lenses</p>
              <p className="text-xs md:text-sm">Offers & coupons</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
