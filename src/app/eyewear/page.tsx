// src/app/pages/eyewear/page.tsx
"use client";

import Hero from "@/sections/Products/Hero";
import ProductsSection from "@/sections/Products/Products";
import FilterSidebar from "@/components/Filters/FilterSidebar";
import React, { useState, useEffect, useMemo } from "react";
import { storeFront } from "../../../utils";
import {
  Loader2,
  Filter,
  Search,
  X as XIcon,
  Glasses,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext"; // Import useCart
import Link from "next/link";

interface ProductImage {
  url: string;
  altText?: string | null;
}

interface Price {
  amount: string;
  currencyCode: string;
}

interface MetafieldNode {
  key: string;
  value: string;
  namespace?: string;
  type?: string;
}

interface ProductNode {
  id: string;
  title: string;
  handle: string;
  tags: string[]; // Added tags
  featuredImage: ProductImage;
  priceRange: {
    minVariantPrice: Price;
  };
  searchFiltersMetafield: MetafieldNode | null; // Using consistent key for search filters
}

interface ProductEdge {
  node: ProductNode;
}

interface MappedProduct {
  id: string;
  name: string;
  href: string;
  price: string;
  imageSrc: string;
  imageAlt: string | null;
  eyewearFilters?: string[];
  tags?: string[]; // Added tags
}

const SHAPE_OPTIONS = [
  "Square",
  "Rectangle",
  "Round",
  "Oval",
  "Cat-eye",
  "Geometric",
  "Aviator",
].sort();
const FRAME_WIDTH_OPTIONS = [
  "Extra narrow",
  "Narrow",
  "Medium",
  "Wide",
  "Extra wide",
].sort();
const MATERIAL_OPTIONS = ["Metal", "Acetate", "Mixed", "Nylon"].sort();
const PRESCRIPTION_OPTIONS = [
  "Good for progressives",
  "Good for strong Rx",
  "Good for readers",
].sort();
const GENDER_OPTIONS = ["Men's", "Women's"].sort();
const FEATURES_OPTIONS = [
  "Lightweight",
  "Semi-rimless",
  "Adjustable nose pads",
  "Rimless",
].sort();
const NOSE_BRIDGE_OPTIONS = ["Standard bridge", "Low Bridge Fit"].sort();

const EyewearPage = () => {
  const { isFirstTimeCustomer } = useCart(); // Get status from cart context
  const [allProducts, setAllProducts] = useState<MappedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<MappedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilters, setActiveFilters] = useState<
    Record<string, string | null>
  >({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const variables = { handle: "Eyewear" };
        const result = await storeFront(productQueryForEyewear, variables);

        if (result.data?.collectionByHandle?.products?.edges) {
          const fetchedProducts =
            result.data.collectionByHandle.products.edges.map(
              ({ node }: ProductEdge) => {
                const searchFiltersValue = node.searchFiltersMetafield?.value;
                let parsedEyewearFilters: string[] = [];

                if (searchFiltersValue) {
                  try {
                    const jsonArray = JSON.parse(searchFiltersValue);
                    if (Array.isArray(jsonArray)) {
                      parsedEyewearFilters = jsonArray.map((s) =>
                        String(s).trim()
                      );
                    } else {
                      parsedEyewearFilters = searchFiltersValue
                        .split(",")
                        .map((s) => s.trim());
                    }
                  } catch (e) {
                    parsedEyewearFilters = searchFiltersValue
                      .split(",")
                      .map((s) => s.trim());
                  }
                }

                return {
                  id: node.id,
                  name: node.title,
                  href: `/products/eyewear/${node.handle}`,
                  price: `$${parseFloat(
                    node.priceRange.minVariantPrice.amount
                  ).toFixed(2)}`,
                  imageSrc:
                    node.featuredImage?.url ||
                    "https://placehold.co/300x300?text=No+Image",
                  imageAlt: node.featuredImage?.altText || node.title,
                  eyewearFilters: parsedEyewearFilters.filter(
                    (sf) => sf.length > 0
                  ),
                  tags: node.tags || [],
                };
              }
            );
          setAllProducts(fetchedProducts);
          setFilteredProducts(fetchedProducts);
        } else {
          setError(
            "Could not fetch eyewear products or no products in collection."
          );
          setAllProducts([]);
          setFilteredProducts([]);
        }
      } catch (err: any) {
        setError(
          err.message || "An error occurred while fetching eyewear products."
        );
        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    let tempProducts = [...allProducts];
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    const hasActiveSidebarFilters = Object.values(activeFilters).some(
      (value) => value !== null
    );

    if (hasActiveSidebarFilters) {
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) {
          tempProducts = tempProducts.filter((product) =>
            product.eyewearFilters?.some(
              (filterVal) => filterVal.toLowerCase() === value.toLowerCase()
            )
          );
        }
      });
    }

    if (lowerSearchTerm) {
      tempProducts = tempProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerSearchTerm) ||
          product.tags?.some((tag) =>
            tag.toLowerCase().includes(lowerSearchTerm)
          )
      );
    }

    setFilteredProducts(tempProducts);
  }, [activeFilters, allProducts, isLoading, searchTerm]);

  const handleFilterChange = (filterKey: string, value: string | null) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
  };

  const filterSections = [
    { title: "Shape", options: SHAPE_OPTIONS, filterKey: "shape" },
    {
      title: "Frame Width",
      options: FRAME_WIDTH_OPTIONS,
      filterKey: "frameWidth",
    },
    { title: "Material", options: MATERIAL_OPTIONS, filterKey: "material" },
    {
      title: "Prescription",
      options: PRESCRIPTION_OPTIONS,
      filterKey: "prescription",
    },
    { title: "Gender", options: GENDER_OPTIONS, filterKey: "gender" },
    { title: "Features", options: FEATURES_OPTIONS, filterKey: "features" },
    {
      title: "Nose bridge",
      options: NOSE_BRIDGE_OPTIONS,
      filterKey: "noseBridge",
    },
  ];

  if (isLoading && allProducts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-6 sm:px-10 md:px-12 lg:px-20 xl:px-28 2xl:px-36 py-8 text-center text-red-600">
        Error fetching products: {error}
      </div>
    );
  }

  return (
    // <main>
    //   <div className="w-full px-6 py-8 sm:px-10 md:px-12 lg:px-20 xl:px-28 2xl:px-36">
    //     <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 xl:gap-x-10">
    //       <div className="hidden lg:block lg:col-span-3 xl:col-span-2 sticky top-16 self-start pr-4 md:pr-6">
    //         <FilterSidebar
    //           filterSections={filterSections}
    //           activeFilters={activeFilters}
    //           onFilterChange={handleFilterChange}
    //           onClearAllFilters={clearAllFilters}
    //           productCount={filteredProducts.length}
    //         />
    //       </div>

    //       <div className="lg:col-span-9 xl:col-span-10">
    //         <Hero
    //           title="Eyewear"
    //           headline="Discover our premium Eyewear Collection—a curated selection of stylish, comfortable, and vision-enhancing glasses designed to suit every face and lifestyle."
    //         />

    //         <div className="my-6 lg:my-8 relative">
    //           <input
    //             type="text"
    //             value={searchTerm}
    //             onChange={(e) => setSearchTerm(e.target.value)}
    //             placeholder="Search by name or tag (e.g., 'Square', 'Metal', 'Lightweight')..."
    //             className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-black focus:border-black"
    //           />
    //           <Search
    //             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
    //             size={18}
    //           />
    //           {searchTerm && (
    //             <button
    //               onClick={() => setSearchTerm("")}
    //               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
    //             >
    //               <XIcon size={18} />
    //             </button>
    //           )}
    //         </div>

    //         <div className="lg:hidden my-6">
    //           <button
    //             onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
    //             className="w-full flex items-center justify-between text-left p-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-200 shadow-sm"
    //           >
    //             <span>
    //               Show Filters (
    //               {Object.values(activeFilters).filter((v) => v).length}{" "}
    //               applied)
    //             </span>
    //             <Filter size={20} />
    //           </button>
    //         </div>

    //         {isMobileFilterOpen && (
    //           <div
    //             className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
    //             onClick={() => setIsMobileFilterOpen(false)}
    //           >
    //             <div
    //               className="fixed top-0 left-0 h-full w-4/5 max-w-xs sm:max-w-sm bg-white shadow-xl p-6 overflow-y-auto z-50 transform transition-transform ease-in-out duration-300"
    //               style={{
    //                 transform: isMobileFilterOpen
    //                   ? "translateX(0)"
    //                   : "translateX(-100%)",
    //               }}
    //               onClick={(e) => e.stopPropagation()}
    //             >
    //               <div className="flex justify-between items-center mb-6">
    //                 <h2 className="text-xl font-semibold text-gray-900">
    //                   Filters
    //                 </h2>
    //                 <button
    //                   onClick={() => setIsMobileFilterOpen(false)}
    //                   className="p-1 text-gray-500 hover:text-gray-700"
    //                 >
    //                   <XIcon size={22} />
    //                 </button>
    //               </div>
    //               <FilterSidebar
    //                 filterSections={filterSections}
    //                 activeFilters={activeFilters}
    //                 onFilterChange={(key, value) => {
    //                   handleFilterChange(key, value);
    //                 }}
    //                 onClearAllFilters={() => {
    //                   clearAllFilters();
    //                 }}
    //                 productCount={filteredProducts.length}
    //               />
    //             </div>
    //           </div>
    //         )}

    //         <div className="mt-8">
    //           {isLoading &&
    //           filteredProducts.length === 0 &&
    //           allProducts.length > 0 ? (
    //             <div className="flex justify-center items-center min-h-[300px]">
    //               <Loader2 className="h-10 w-10 animate-spin text-black" />
    //             </div>
    //           ) : filteredProducts.length > 0 ? (
    //             <ProductsSection
    //               products={filteredProducts}
    //               heading="All Eyewear"
    //               isFirstTimeCustomer={isFirstTimeCustomer}
    //             />
    //           ) : (
    //             <div className="text-center py-16 bg-white rounded-lg shadow-sm">
    //               <p className="text-gray-600 text-xl mb-4">
    //                 No products match your current filters.
    //               </p>
    //               <p className="text-gray-500 text-sm mb-6">
    //                 Try adjusting your selection or clear all filters.
    //               </p>
    //               <button
    //                 onClick={clearAllFilters}
    //                 className="mt-4 px-6 py-2.5 bg-black text-white text-sm rounded-lg shadow-md hover:bg-gray-800 transition-colors"
    //               >
    //                 Clear All Filters
    //               </button>
    //             </div>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </main>

    // The existing eyewear page content is commented out and replaced with the following:

    <main className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 text-center p-6 sm:p-8">
      <div className="max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-orange-400 rounded-full shadow-lg animate-pulse">
            <Glasses size={48} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          Eyeglasses Are on Their Way!
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-600">
          Our new Eyeglasses Collection is launching soon. Get ready to find
          your perfect pair!
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 transition-colors duration-150 ease-in-out shadow-md"
          >
            Go Back to Homepage
            <ArrowRight size={20} className="ml-2" />
          </Link>
          <Link
            href="/contact-lenses" // Link to your contact lenses collection
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150 ease-in-out shadow-md"
          >
            Shop Contact Lenses
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Want to be the first to know?
            {/* You can add a newsletter sign-up link or component here later */}
            <Link
              href="/"
              className="font-medium text-black hover:underline ml-1"
            >
              Follow us for updates!
            </Link>
          </p>
        </div>

        <div className="mt-10 flex justify-center items-center space-x-2 text-gray-400">
          <Sparkles size={16} />
          <span className="text-xs">Exciting styles arriving soon</span>
          <Sparkles size={16} />
        </div>
      </div>
    </main>
  );
};

export default EyewearPage;

const gql = String.raw;

const productQueryForEyewear = gql`
  query GetCollectionProducts($handle: String!) {
    collectionByHandle(handle: $handle) {
      title
      products(first: 250) {
        edges {
          node {
            id
            title
            handle
            tags
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            searchFiltersMetafield: metafield(
              namespace: "custom"
              key: "search_filters"
            ) {
              value
            }
          }
        }
      }
    }
  }
`;
