// src/app/pages/eyewear/page.tsx
"use client";

import Hero from "@/sections/Products/Hero"; // Assuming this is a generic Hero for collection pages
import ProductsSection from "@/sections/Products/Products";
import FilterSidebar from "@/components/Filters/FilterSidebar";
import React, { useState, useEffect, useMemo } from "react";
import { storeFront } from "../../../../utils"; // Ensure this path is correct
import { Loader2, Filter, X } from "lucide-react";

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
  featuredImage: ProductImage;
  priceRange: {
    minVariantPrice: Price;
  };
  // For eyewear, we'll use a specific metafield, e.g., 'search_filters_eyewear'
  searchFiltersEyewear: MetafieldNode | null;
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
  eyewearFilters?: string[]; // To store parsed filter values for this product
}

// Define static filter options based on your list
const SHAPE_OPTIONS = [
  "Square",
  "Rectangle",
  "Round",
  "Oval",
  "Cat-eye",
  "Geometric",
  "Aviator",
];
const FRAME_WIDTH_OPTIONS = [
  "Extra narrow",
  "Narrow",
  "Medium",
  "Wide",
  "Extra wide",
]; // Consider order if not alphabetical
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
const NOSE_BRIDGE_OPTIONS = ["Standard bridge", "Low Bridge Fit"];

const EyewearPage = () => {
  const [allProducts, setAllProducts] = useState<MappedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<MappedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilters, setActiveFilters] = useState<
    Record<string, string | null>
  >({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const variables = { handle: "Eyewear" }; // Collection handle for Eyewear
        const result = await storeFront(productQueryForEyewear, variables);

        if (result.data?.collectionByHandle?.products?.edges) {
          const fetchedProducts =
            result.data.collectionByHandle.products.edges.map(
              ({ node }: ProductEdge) => {
                const searchFiltersValue = node.searchFiltersEyewear?.value;
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
                  // Ensure href points to the correct eyewear product detail page structure
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
                };
              }
            );
          setAllProducts(fetchedProducts);
          setFilteredProducts(fetchedProducts);
        } else {
          setError(
            "Could not fetch eyewear products or no products in collection."
          );
          console.error(
            "Error fetching eyewear products or empty data:",
            result
          );
          setAllProducts([]);
          setFilteredProducts([]);
        }
      } catch (err: any) {
        setError(
          err.message || "An error occurred while fetching eyewear products."
        );
        console.error(err);
        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // useEffect for filtering products based on activeFilters
  useEffect(() => {
    if (isLoading) return;

    let tempProducts = [...allProducts];
    const hasActiveFilters = Object.values(activeFilters).some(
      (value) => value !== null
    );

    if (hasActiveFilters) {
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
    setFilteredProducts(tempProducts);
  }, [activeFilters, allProducts, isLoading]);

  const handleFilterChange = (filterKey: string, value: string | null) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  // Define filter sections using the static options
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
    <main>
      {/* Main content wrapper: full width with responsive padding */}
      <div className="w-full px-6 py-8 sm:px-10 md:px-12 lg:px-20 xl:px-28 2xl:px-36">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 xl:gap-x-10">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-3 xl:col-span-2 sticky top-16 self-start pr-4 md:pr-6">
            <FilterSidebar
              filterSections={filterSections}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearAllFilters={clearAllFilters}
              productCount={filteredProducts.length}
            />
          </div>

          {/* Main Content Area (Hero, Products) */}
          <div className="lg:col-span-9 xl:col-span-10">
            <Hero
              title="Eyewear"
              headline="Discover our premium Eyewear Collection—a curated selection of stylish, comfortable, and vision-enhancing glasses designed to suit every face and lifestyle."
            />

            {/* Mobile Filters Button */}
            <div className="lg:hidden my-6">
              {" "}
              {/* Added my-6 for spacing */}
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="w-full flex items-center justify-between text-left p-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-200 shadow-sm"
              >
                <span>
                  Show Filters (
                  {Object.values(activeFilters).filter((v) => v).length}{" "}
                  applied)
                </span>
                <Filter size={20} />
              </button>
            </div>

            {/* Mobile Filter Sidebar (Modal/Drawer) */}
            {isMobileFilterOpen && (
              <div
                className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <div
                  className="fixed top-0 left-0 h-full w-4/5 max-w-xs sm:max-w-sm bg-white shadow-xl p-6 overflow-y-auto z-50 transform transition-transform ease-in-out duration-300"
                  style={{
                    transform: isMobileFilterOpen
                      ? "translateX(0)"
                      : "translateX(-100%)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Filters
                    </h2>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <X size={22} />
                    </button>
                  </div>
                  <FilterSidebar
                    filterSections={filterSections}
                    activeFilters={activeFilters}
                    onFilterChange={(key, value) => {
                      handleFilterChange(key, value);
                    }}
                    onClearAllFilters={() => {
                      clearAllFilters();
                    }}
                    productCount={filteredProducts.length}
                  />
                </div>
              </div>
            )}

            {/* Products Section or No Products Message */}
            <div className="mt-8">
              {" "}
              {/* Added mt-8 for spacing below Hero/Popular Brands for eyewear */}
              {isLoading &&
              filteredProducts.length === 0 &&
              allProducts.length > 0 ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <Loader2 className="h-10 w-10 animate-spin text-black" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <ProductsSection
                  products={filteredProducts}
                  heading="All Eyewear"
                />
              ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-600 text-xl mb-4">
                    No products match your current filters.
                  </p>
                  <p className="text-gray-500 text-sm mb-6">
                    Try adjusting your selection or clear all filters.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-6 py-2.5 bg-black text-white text-sm rounded-lg shadow-md hover:bg-gray-800 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EyewearPage;

const gql = String.raw;

// Updated query to fetch the 'search_filters_eyewear' metafield
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
            # Assuming a metafield key like 'search_filters_eyewear' for eyewear products
            searchFiltersEyewear: metafield(
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
