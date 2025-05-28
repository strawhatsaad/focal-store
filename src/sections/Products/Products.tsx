// File: src/sections/Products/Products.tsx
import Link from "next/link";
import Image from "next/image"; // Using Next/Image for potential optimization

const ProductsSection = ({
  products,
  heading,
}: {
  products: any[];
  heading: string;
}) => {
  const productData = products;
  return (
    <div className="bg-white" id="products">
      {/* Removed mx-auto and max-w from here, parent will control width */}
      <div className="w-full px-0 py-8 sm:py-12">
        {" "}
        {/* Adjusted padding for section */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-8 sm:mb-10 md:mb-12">
          {heading}
        </h2>
        {/* Responsive grid for products */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
          {productData.map((product: any) => (
            <Link
              key={product.id || product.name}
              href={product.href}
              className="group block"
            >
              <div className="w-full aspect-[4/3] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                {product.imageSrc ? (
                  <Image
                    alt={product.imageAlt || product.name || "Product Image"}
                    src={product.imageSrc}
                    width={300} // Provide aspect ratio, layout="responsive" will handle size
                    height={225} // Example 4:3 aspect ratio
                    layout="responsive"
                    className="object-contain w-full h-full group-hover:opacity-90 transition-opacity duration-300"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://placehold.co/300x225/F7F4EE/333333?text=No+Image")
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-xs text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <h3 className="mt-3 text-xs sm:text-sm font-medium text-gray-800 group-hover:text-black truncate">
                {product.name}
              </h3>
              <p className="mt-1 text-sm sm:text-base font-semibold text-gray-900">
                {product.price}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ProductsSection;
