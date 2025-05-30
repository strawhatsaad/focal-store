// src/app/pages/contact-lenses/page.tsx
"use client";

import Hero from "@/sections/Products/Hero";
import ProductsSection from "@/sections/Products/Products";
import FilterSidebar from "@/components/Filters/FilterSidebar";
import React, { useState, useEffect, useMemo } from "react";
import { storeFront } from "../../../../utils/index";
import { Loader2, Filter, Search, X as XIcon } from "lucide-react"; // Added Search and XIcon

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
  searchFiltersMetafield: MetafieldNode | null;
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
  searchFilters?: string[];
  tags?: string[]; // Added tags
}

const ALL_BRANDS_OPTIONS = [
  "Acuvue",
  "Air Optix",
  "Biofinity",
  "Biotrue",
  "Clariti",
  "Dailies",
  "Infuse",
  "MyDay",
  "Precision1",
  "Scout",
  "Total 30",
  "Ultra",
  "Proclear",
].sort();
const LENS_TYPES_OPTIONS = [
  "Daily",
  "Weekly",
  "Biweekly",
  "Monthly",
  "Multifocal & Bifocal",
  "Toric & Astigmatism",
  "Color",
].sort();
const MANUFACTURERS_OPTIONS = [
  "Alcon",
  "Bausch + Lomb",
  "CooperVision",
  "Johnson & Johnson",
  "Warby Parker",
].sort();
const POPULAR_BRANDS_DISPLAY = [
  "Acuvue",
  "Dailies",
  "Biofinity",
  "Air Optix",
  "MyDay",
  "Precision1",
  "Total 30",
  "Ultra",
  "Biotrue",
  "Clariti",
];

const ContactLensesPage = () => {
  const [allProducts, setAllProducts] = useState<MappedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<MappedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilters, setActiveFilters] = useState<
    Record<string, string | null>
  >({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const variables = { handle: "Contacts" };
        const result = await storeFront(productQueryWithMetafields, variables);

        if (result.data?.collectionByHandle?.products?.edges) {
          const fetchedProducts =
            result.data.collectionByHandle.products.edges.map(
              ({ node }: ProductEdge) => {
                const searchFiltersValue = node.searchFiltersMetafield?.value;
                let parsedSearchFilters: string[] = [];

                if (searchFiltersValue) {
                  try {
                    const jsonArray = JSON.parse(searchFiltersValue);
                    if (Array.isArray(jsonArray)) {
                      parsedSearchFilters = jsonArray.map((s) =>
                        String(s).trim()
                      );
                    } else {
                      parsedSearchFilters = searchFiltersValue
                        .split(",")
                        .map((s) => s.trim());
                    }
                  } catch (e) {
                    parsedSearchFilters = searchFiltersValue
                      .split(",")
                      .map((s) => s.trim());
                  }
                }

                return {
                  id: node.id,
                  name: node.title,
                  href: `/products/${node.handle}`,
                  price: `$${parseFloat(
                    node.priceRange.minVariantPrice.amount
                  ).toFixed(2)}`,
                  imageSrc:
                    node.featuredImage?.url ||
                    "https://placehold.co/300x300?text=No+Image",
                  imageAlt: node.featuredImage?.altText || node.title,
                  searchFilters: parsedSearchFilters.filter(
                    (sf) => sf.length > 0
                  ),
                  tags: node.tags || [], // Add tags
                };
              }
            );
          setAllProducts(fetchedProducts);
          setFilteredProducts(fetchedProducts);
        } else {
          setError(
            "Could not fetch contact lenses or no products in collection."
          );
          setAllProducts([]);
          setFilteredProducts([]);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching products.");
        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // useEffect for filtering products based on activeFilters AND searchTerm
  useEffect(() => {
    if (isLoading) return;

    let tempProducts = [...allProducts];
    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    // Apply sidebar filters first
    const hasActiveSidebarFilters = Object.values(activeFilters).some(
      (value) => value !== null
    );
    if (hasActiveSidebarFilters) {
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) {
          tempProducts = tempProducts.filter((product) =>
            product.searchFilters?.some(
              (filterVal) => filterVal.toLowerCase() === value.toLowerCase()
            )
          );
        }
      });
    }

    // Then apply search term filter on the result of sidebar filters
    if (lowerSearchTerm) {
      tempProducts = tempProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerSearchTerm) || // Search in name
          product.tags?.some((tag) =>
            tag.toLowerCase().includes(lowerSearchTerm)
          ) // Search in tags
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

  const handlePopularBrandClick = (brandName: string) => {
    setSearchTerm(""); // Clear search when a popular brand is clicked
    setActiveFilters((prev) => ({
      brand: prev.brand === brandName ? null : brandName,
      lensType: null,
      manufacturer: null,
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm(""); // Also clear search term
  };

  const filterSections = [
    { title: "All brands", options: ALL_BRANDS_OPTIONS, filterKey: "brand" },
    { title: "Lens types", options: LENS_TYPES_OPTIONS, filterKey: "lensType" },
    {
      title: "Manufacturer",
      options: MANUFACTURERS_OPTIONS,
      filterKey: "manufacturer",
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
    <main>
      <div className="w-full px-6 py-8 sm:px-10 md:px-12 lg:px-20 xl:px-28 2xl:px-36">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 xl:gap-x-10">
          <div className="hidden lg:block lg:col-span-3 xl:col-span-2 sticky top-16 self-start pr-4 md:pr-6">
            <FilterSidebar
              filterSections={filterSections}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearAllFilters={clearAllFilters}
              productCount={filteredProducts.length}
            />
          </div>

          <div className="lg:col-span-9 xl:col-span-10">
            <Hero
              title="Contact Lenses"
              headline="Explore our premium selection of prescription and colored contact lenses designed for comfort, clarity, and style."
            />

            {/* Search Input */}
            <div className="my-6 lg:my-8 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or tag (e.g., 'Acuvue', 'daily', 'toric')..."
                className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-black focus:border-black"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <XIcon size={18} />
                </button>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-base font-semibold text-gray-600 mb-3">
                Popular Brands:
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {POPULAR_BRANDS_DISPLAY.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handlePopularBrandClick(brand)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm rounded-full border transition-colors duration-150 ease-in-out
                      ${
                        activeFilters.brand === brand
                          ? "bg-black text-white border-black shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
                      }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:hidden mb-6">
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
                      <XIcon size={22} />
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

            {isLoading &&
            filteredProducts.length === 0 &&
            allProducts.length > 0 ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-10 w-10 animate-spin text-black" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <ProductsSection
                products={filteredProducts}
                heading="Our Contact Lenses"
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
    </main>
  );
};

export default ContactLensesPage;

const gql = String.raw;

const productQueryWithMetafields = gql`
  query GetCollectionProducts($handle: String!) {
    collectionByHandle(handle: $handle) {
      title
      products(first: 250) {
        edges {
          node {
            id
            title
            handle
            tags # Fetch product tags
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
