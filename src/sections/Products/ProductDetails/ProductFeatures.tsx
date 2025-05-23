import FAQItem from "@/components/Products/ProductDetails/FAQItem";
import WhyBuyBox from "@/components/Products/ProductDetails/WhyBuyBox";
import { Check } from "lucide-react";
import { twMerge } from "tailwind-merge";
import frameWidth from "@/assets/Product-Images/ProductDetailsAssets/EyewearPDP-FrameWidth 1.png";
import Image from "next/image";
import technicalMeasurement1 from "@/assets/Product-Images/ProductDetailsAssets/EyewearPDP-TechnicalMeasurement.png";

export default function ProductFeatures({ product, selectedVariant }: any) {
  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      {/* <h2 className="text-5xl font-black tracking-tighter text-center">
        Product Features
      </h2> */}
      <div
        className={twMerge("", product.collection == "Eyewear" ? "hidden" : "")}
      >
        <FAQItem title="Why buy contacts at Focal Optical?" openFlag={false}>
          <WhyBuyBox />
        </FAQItem>
      </div>

      <div
        className={twMerge("", product.collection != "Eyewear" ? "hidden" : "")}
      >
        <FAQItem title="Why buy Eyewear at Focal Optical?" openFlag={false}>
          <WhyBuyBox />
        </FAQItem>
      </div>

      <div
        className={twMerge("", product.collection == "Eyewear" ? "hidden" : "")}
      >
        <FAQItem
          title="What kind of prescription do I need to order contacts?"
          openFlag={false}
        >
          <ul>
            <li className="flex items-center space-x-2 mb-2">
              <Check className="h-5 w-5 text-black" />
              <span className="text-gray-700">
                Your prescription must be up to date (i.e., unexpired) and
                signed by a doctor
              </span>
            </li>
            <li className="flex items-center space-x-2 mb-2">
              <Check className="h-5 w-5 text-black" />
              <span className="text-gray-700">
                Your prescription must include the brand name of the contact
                lenses you&apos;d like to order
              </span>
            </li>
            <li className="flex items-center space-x-2 mb-2">
              <Check className="h-5 w-5 text-black" />
              <span className="text-gray-700">
                Your prescription must be specific to contacts (a glasses
                prescription won&apos;t do!)
              </span>
            </li>
          </ul>
        </FAQItem>
      </div>

      <div
        className={twMerge("", product.collection == "Eyewear" ? "hidden" : "")}
      >
        <FAQItem title="Product Details" openFlag={true}>
          <div className="flex flex-col gap-y-8">
            <p className="font-medium">{product.description}</p>
            <ul className="space-y-10">
              <li className="flex items-center space-x-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  height="40"
                  viewBox="0 0 24 24"
                  width="40"
                >
                  <path
                    clipRule="evenodd"
                    d="M12.3435 7.1644C12.8843 7.89045 12.8728 8.24219 12.8664 8.31654C12.8082 8.36324 12.5221 8.56826 11.618 8.52219C10.6072 8.47069 9.25358 8.09583 7.84696 7.3442C6.44033 6.59256 5.37638 5.6756 4.77181 4.86396C4.231 4.13791 4.24247 3.78617 4.24893 3.71181C4.30715 3.66511 4.59319 3.4601 5.49735 3.50616C6.5081 3.55766 7.86172 3.93253 9.26835 4.68416C10.675 5.43579 11.7389 6.35275 12.3435 7.1644ZM11.0937 9.98273C9.90719 9.84621 8.51918 9.40412 7.14003 8.66717C5.68963 7.89215 4.50488 6.92773 3.73217 5.97045C3.65345 6.45055 3.60437 6.94169 3.61608 7.43989C3.6456 8.6959 4.07004 9.91092 5.52555 10.8665C6.82353 11.7187 8.09855 11.6449 9.31891 11.1035C9.94053 10.8278 10.5383 10.433 11.0937 9.98273ZM13.6872 9.57902C12.7314 10.6242 11.4308 11.8077 9.92717 12.4747C8.35069 13.174 6.51817 13.3127 4.70229 12.1204C2.75968 10.845 2.15531 9.1265 2.11649 7.47514C2.08724 6.23043 2.38636 4.97002 2.6119 4.01968C2.67057 3.77248 2.72425 3.54626 2.76589 3.34676C2.78751 3.24314 2.82955 3.14902 2.88693 3.06772C2.89738 3.04549 2.90842 3.02349 2.92005 3.00173C3.70298 1.53652 6.86171 1.69746 9.97528 3.36119C13.0888 5.02492 14.9782 7.56142 14.1953 9.02663C14.0772 9.24761 13.9051 9.4316 13.6872 9.57902Z"
                    fill="#676F78"
                    fillRule="evenodd"
                  />
                  <path
                    clipRule="evenodd"
                    d="M22.5884 14.8061C22.5912 14.8622 22.5868 14.9196 22.5745 14.9773C22.2918 16.2972 21.7529 17.9498 20.7574 19.275C19.7434 20.6247 18.2182 21.6721 16.0384 21.6057C13.7156 21.5349 12.2393 20.4185 11.3221 19.0984C10.4262 17.8089 10.0491 16.311 9.85078 15.3764C9.83727 15.3127 9.83353 15.2492 9.83861 15.1873C9.79645 13.6522 12.578 12.2612 16.0811 12.0729C19.6061 11.8835 22.5268 12.9835 22.6048 14.5299C22.6095 14.6225 22.6038 14.7147 22.5884 14.8061ZM20.0615 13.9482C20.8976 14.263 21.0678 14.5485 21.1003 14.6108C21.0742 14.6762 20.9336 14.9784 20.1338 15.3812C19.2396 15.8315 17.8855 16.1911 16.293 16.2767C14.7005 16.3623 13.3176 16.1498 12.383 15.7978C11.547 15.4829 11.3767 15.1975 11.3442 15.1352C11.3703 15.0697 11.5109 14.7675 12.3108 14.3647C13.2049 13.9145 14.559 13.5548 16.1515 13.4692C17.744 13.3836 19.1269 13.5962 20.0615 13.9482ZM20.4761 16.7788C19.3818 17.2573 17.9463 17.588 16.3634 17.673C14.6647 17.7643 13.1064 17.5562 11.9389 17.1429C12.1107 17.5484 12.3215 17.9527 12.583 18.329C13.2955 19.3546 14.3663 20.1549 16.1033 20.2078C17.6436 20.2547 18.729 19.5501 19.5324 18.4806C19.9166 17.9692 20.2272 17.3837 20.4761 16.7788Z"
                    fill="#676F78"
                    fillRule="evenodd"
                  />
                </svg>
                <div className="flex flex-col px-6">
                  <h4 className="font-bold tracking-tighter">Lens Type</h4>
                  <p className="font-medium">{product.type}</p>
                </div>
              </li>
              <li className="flex items-center space-x-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  height="40"
                  viewBox="0 0 24 24"
                  width="40"
                >
                  <path
                    clipRule="evenodd"
                    d="M6.30727 2.5H8.51339L12.0379 5.35045H6.30727V2.5ZM17.6937 5.35045H14.4233L10.8988 2.5H15.79L21.5005 7.43967V12.5593L18.4437 9.84611V6.10045C18.4437 5.68624 18.1079 5.35045 17.6937 5.35045ZM22.2505 1H8.78532H8.77301H5.55727C5.14306 1 4.80727 1.33579 4.80727 1.75V5.45627H1.75002C1.33581 5.45627 1.00002 5.79206 1.00002 6.20627V22.2486C1.00002 22.6628 1.33581 22.9986 1.75002 22.9986H17.5646C17.9788 22.9986 18.3146 22.6628 18.3146 22.2486V18.5423H22.2505C22.6647 18.5423 23.0005 18.2065 23.0005 17.7923V14.2381V14.2181V7.10437V7.08986V1.75C23.0005 1.33579 22.6647 1 22.2505 1ZM21.5005 2.5V5.45634L18.0828 2.5H21.5005ZM18.4437 11.8518L21.5005 14.5649V17.0423H18.4437V11.8518ZM2.50002 6.95627V21.4986H4.86865L4.74535 11.2649C4.74036 10.8507 5.07208 10.5109 5.48626 10.5059C5.90044 10.5009 6.24025 10.8326 6.24524 11.2468L6.36876 21.4986H13.1572L13.1449 15.2535C12.7595 15.4563 12.3207 15.5712 11.8539 15.5712C10.4307 15.5712 9.26878 14.5034 9.08054 13.1331C9.05456 13.0571 9.04046 12.9755 9.04046 12.8906V6.95627H2.50002ZM10.5405 10.2416C10.9313 10.0314 11.378 9.91205 11.8539 9.91205C13.4101 9.91205 14.6539 11.1887 14.6539 12.7416C14.6539 12.8406 14.6489 12.9384 14.639 13.0348L14.6406 13.0348L14.6572 21.4986H16.8146V6.95627H10.5405V10.2416ZM10.5539 12.7416C10.5539 11.997 11.1461 11.4121 11.8539 11.4121C12.5617 11.4121 13.1539 11.997 13.1539 12.7416C13.1539 13.4862 12.5617 14.0712 11.8539 14.0712C11.1461 14.0712 10.5539 13.4862 10.5539 12.7416Z"
                    fill="#676F78"
                    fillRule="evenodd"
                  />
                </svg>
                <div className="flex flex-col px-6">
                  <h4 className="font-bold tracking-tighter">Material</h4>
                  <p className="font-medium">{product.material}</p>
                </div>
              </li>
              <li className="flex items-center space-x-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  height="40"
                  viewBox="0 0 24 24"
                  width="40"
                >
                  <path
                    d="M21.8454 3.43621C21.8118 2.90977 21.375 2.5 20.8474 2.5H17.1426C16.6148 2.5 16.1779 2.9102 16.1446 3.43695L15.62 11.742H12.0701V8.07073C12.0701 7.90841 11.8869 7.8137 11.7545 7.90753L7.23567 11.1086V8.07035C7.23567 7.90811 7.05265 7.81338 6.92019 7.90706L1.4226 11.795C1.15756 11.9824 1 12.2868 1 12.6114V20.5C1 21.0523 1.44772 21.5 2 21.5H21.934C22.5114 21.5 22.9688 21.0124 22.932 20.4362L21.8454 3.43621ZM11.1592 20.0926H6.3482V17.5358H11.1592V20.0926ZM15.0828 20.0926H12.5605V17.1284C12.5605 16.5761 12.1128 16.1284 11.5605 16.1284H5.94692C5.39464 16.1284 4.94692 16.5761 4.94692 17.1284V20.0926H2.40127V12.821L5.8344 10.3815V13.4194C5.8344 13.5817 6.01756 13.6764 6.15001 13.5826L10.6688 10.3815V13.1494H15.5265L15.0828 20.0926ZM20.4544 3.90741L20.6178 6.11235H17.3949L17.535 3.90741H20.4544ZM16.4841 20.0926L17.3015 7.51975H20.6879L21.5053 20.0926H16.4841Z"
                    fill="#676F78"
                    stroke="#676F78"
                    strokeWidth="0.09"
                  />
                </svg>
                <div className="flex flex-col px-6">
                  <h4 className="font-bold tracking-tighter">Manufacturer</h4>
                  <p className="font-medium">{product.manufacturer}</p>
                </div>
              </li>
            </ul>
          </div>
        </FAQItem>
      </div>

      <div
        className={twMerge("", product.collection != "Eyewear" ? "hidden" : "")}
      >
        <FAQItem title="Width guide for:" openFlag={false}>
          <div className="flex flex-col gap-4">
            <span className="font-semibold tracking-tight">
              {product.name} in {selectedVariant}
            </span>
            <div className="border-[2px] border-gray-400/40 rounded-lg px-4 py-4 flex flex-col gap-4">
              <div className="flex flex-row gap-8">
                <div className="w-72 flex justify-center items-center">
                  <Image src={frameWidth} alt="" className="w-full" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold tracking-tight">Frame widths</h3>
                  <p className="font-medium tracking-tight">
                    Our widths are determined by the overall frame width. Choose
                    a width that best corresponds with your own face. (You
                    won&apos;t find this number on glasses.)
                  </p>
                </div>
              </div>
              <div className="bg-gray-200 px-4 py-2 rounded-lg">
                <p className="tracking-tight font-semibold text-black/60">
                  {product.frame_size}
                </p>
              </div>
              <div className="px-3">
                <p>{product.frame_width}</p>
              </div>
            </div>
            <div>
              {/* <FAQItem title="Other measurements" openFlag={false}>
                <div className="border-[2px] border-gray-400/40 rounded-lg px-4 py-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-4">
                      <div className="w-72 flex justify-center items-center">
                        <Image src={technicalMeasurement1} alt="" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <h3 className="font-bold tracking-tight">
                          Compare lens width-bridge-temple length with your
                          glasses
                        </h3>
                        <p className="font-medium tracking-tight">
                          For most glasses, these measurements are found on the
                          inside of the temple arm. If you have a pair you like,
                          compare it to these measurements.
                        </p>
                      </div>
                    </div>

                    <FAQItem
                      title="What do these measurements means?"
                      openFlag={false}
                    >
                      <div className="flex flex-row gap-8">
                        <div className="w-72 flex justify-center items-center">
                          <Image src={frameWidth} alt="" className="w-full" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-bold tracking-tight">
                            Frame widths
                          </h3>
                          <p className="font-medium tracking-tight">
                            Our widths are determined by the overall frame
                            width. Choose a width that best corresponds with
                            your own face. (You won&apos;t find this number on
                            glasses.)
                          </p>
                        </div>
                      </div>
                    </FAQItem>
                  </div>
                </div>
              </FAQItem> */}
            </div>
          </div>
        </FAQItem>
      </div>

      <div
        className={twMerge("", product.collection != "Eyewear" ? "hidden" : "")}
      >
        <FAQItem title="Product Details" openFlag={true}>
          <div className="flex flex-col gap-y-8">
            <p className="font-medium">{product.description}</p>
            <div className="max-w-3xl mx-auto space-y-8 p-4">
              {/* Prescription Type */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 font-semibold px-4 py-3">
                  Prescription type
                </div>
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 text-left text-sm font-medium">
                    <tr>
                      <th className="px-4 py-2 w-2/3">Type</th>
                      <th className="px-4 py-2 w-1/3">Starting price</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2">Single-vision</td>
                      <td className="px-4 py-2">
                        {addPrice(product.price, 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Progressives</td>
                      <td className="px-4 py-2">
                        {addPrice(product.price, 230)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Readers</td>
                      <td className="px-4 py-2">
                        {addPrice(product.price, 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Non-prescription</td>
                      <td className="px-4 py-2">
                        {addPrice(product.price, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Lens Type */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 font-semibold px-4 py-3">
                  Lens type
                </div>
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 text-left text-sm font-medium">
                    <tr>
                      <th className="px-4 py-2 w-2/3">Type</th>
                      <th className="px-4 py-2 w-1/3">Additional cost</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2">Classic</td>
                      <td className="px-4 py-2">Free</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Blue-light filtering</td>
                      <td className="px-4 py-2">+$50</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Anti-fatigue</td>
                      <td className="px-4 py-2">+$100</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Light-responsive</td>
                      <td className="px-4 py-2">+$125</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Lens Material */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 font-semibold px-4 py-3">
                  Lens material
                </div>
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 text-left text-sm font-medium">
                    <tr>
                      <th className="px-4 py-2 w-2/3">Material</th>
                      <th className="px-4 py-2 w-1/3">Additional cost</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2">Polycarbonate</td>
                      <td className="px-4 py-2">Free</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">1.67 high-index</td>
                      <td className="px-4 py-2">+$60</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </FAQItem>
      </div>
    </div>
  );
}

function addPrice(priceString: any, extra: any) {
  const base = parseFloat(priceString.replace("$", ""));
  const total = base + extra;
  return total % 1 === 0 ? `$${total}` : `$${total.toFixed(2)}`;
}
