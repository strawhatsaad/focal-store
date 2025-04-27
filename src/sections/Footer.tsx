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
      <div className="flex flex-row justify-center md:gap-16 lg:gap-24 items-start px-10 py-5 text-white mx-auto">
        <div className="flex flex-col gap-8 md:max-w-lg lg:max-w-md items-start">
          <Link href={"/"}>
            <Image
              src={Logo}
              alt="Focal Logo"
              height={180}
              width={180}
              className="hover:scale-110 transition-all duration-[350ms]"
            />
          </Link>
          <h2 className="font-bold md:text-xl lg:text-2xl">
            Your happiness, backed by our Gajillion Percent Promise
          </h2>
          <button className="btn btn-text gap-1 p-0 flex items-center hover:font-bold hover:scale-105 transition-all duration-[350ms]">
            <span className="font-semibold text-white">Learn More</span>
            <ArrowIcon className="h-5 w-5 text-white" />
          </button>
          <div className="flex gap-4">
            <InstagramIcon
              style={{ color: "white", width: "50", height: "50px" }}
            />
            <Facebook style={{ color: "white", width: "50", height: "50px" }} />
            <Youtube style={{ color: "white", width: "50", height: "50px" }} />
          </div>
          <p className="font-medium text-white/30">We Accept</p>
          <div className="flex gap-4 -mt-2">
            <Image src={visaIcon} alt="Visa" />
            <Image src={mastercardIcon} alt="Mastercard" />
            <Image src={discoverIcon} alt="Discover" />
            <Image src={americanExpressIcon} alt="American Express" />
            <Image src={paypalIcon} alt="PayPal" />
            <Image src={fsaHsaIcon} alt="FSA/HSA" />
          </div>
        </div>
        <div className="flex flex-col gap-16 justify-start">
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
          <div className="grid grid-cols-4 gap-8">
            <div className="flex flex-col md:gap-3 lg:gap-6 md:text-sm lg:text-xl">
              <h3 className="font-bold">About us</h3>
              <p>Our Story</p>
              <p>Community</p>
              <p>Careers</p>
            </div>
            <div className="flex flex-col md:gap-3 lg:gap-6 md:text-sm lg:text-xl">
              <h3 className="font-bold">Help</h3>
              <p>How to order</p>
              <p>How to read your perscription</p>
              <p>Returns & exchanges</p>
              <p>Best-price guarantee</p>
              <p>FAQs</p>
              <p>Contact us</p>
            </div>
            <div className="flex flex-col md:gap-3 lg:gap-6 md:text-sm lg:text-xl">
              <h3 className="font-bold">My Account</h3>
              <p>Order Status</p>
              <p>Reorder</p>
              <p>Upload Prescription</p>
              <p>My prescription</p>
              <p>My subscriptions</p>
            </div>
            <div className="flex flex-col md:gap-3 lg:gap-6 md:text-sm lg:text-xl">
              <h3 className="font-bold">Resources</h3>
              <p>Eyewear</p>
              <p>Sunglasses</p>
              <p>Contact Lenses</p>
              <p>Offers & coupons</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
