import {
  TagIcon,
  TruckIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    icon: TagIcon,
    title: "20% off your first contacts order",
    description: "No promo code needed!",
  },
  {
    icon: TruckIcon,
    title: "Free shipping and no hidden fees",
    description: "We do expedited shipping, too",
  },
  {
    icon: DevicePhoneMobileIcon,
    title: "Renew your prescription from home",
    description: "Our Virtual Vision Test app makes it easy on an iPhone",
  },
  {
    icon: CreditCardIcon,
    title: "Buy an annual supply, get a $50 eyewear credit",
    description: "Good to use on any glasses or sunglasses",
  },
  {
    icon: CurrencyDollarIcon,
    title: "FSA, HSA, and insurance accepted",
    description: "Save an average of $115 when you use insurance",
  },
];

export default function WhyBuyBox() {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
      <ul className="space-y-4">
        {features.map((item, idx) => (
          <li key={idx} className="flex items-start space-x-4">
            <item.icon className="h-6 w-6 text-black mt-1" />
            <div>
              <p className="font-medium text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
