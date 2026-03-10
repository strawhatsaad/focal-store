"use client";

import Hero from "@/sections/Products/Hero";
import FilterSidebar from "@/components/Filters/FilterSidebar";
import EyewearProductCard, {
  EyewearProductProps,
} from "@/components/EyewearProductCard";
import React, { useState, useEffect, useMemo } from "react";
import { storeFront } from "../../../utils";
import { Loader2, Filter, Search, X as XIcon } from "lucide-react";

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

interface VariantNode {
  id: string;
  title: string;
  priceV2: Price;
  image: ProductImage | null;
}

interface ProductNode {
  id: string;
  title: string;
  handle: string;
  tags: string[];
  featuredImage: ProductImage;
  priceRange: {
    minVariantPrice: Price;
  };
  searchFiltersMetafield: MetafieldNode | null;
  colorSwatchesMetafield: MetafieldNode | null;
  variants: {
    edges: { node: VariantNode }[];
  };
}

interface ProductEdge {
  node: ProductNode;
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
  const [allProducts, setAllProducts] = useState<EyewearProductProps[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<
    EyewearProductProps[]
  >([]);
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
                const colorSwatchesValue = node.colorSwatchesMetafield?.value;
                let parsedEyewearFilters: string[] = [];
                let parsedColorSwatches: any[] = [];

                if (searchFiltersValue) {
                  try {
                    const jsonArray = JSON.parse(searchFiltersValue);
                    if (Array.isArray(jsonArray)) {
                      parsedEyewearFilters = jsonArray.map((s) =>
                        String(s).trim(),
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

                if (colorSwatchesValue) {
                  try {
                    parsedColorSwatches = JSON.parse(colorSwatchesValue);
                  } catch (e) {
                    console.error(
                      "Failed to parse color swatches for",
                      node.title,
                    );
                  }
                }

                const variants = node.variants.edges.map((vNode) => ({
                  id: vNode.node.id,
                  title: vNode.node.title,
                  price: parseFloat(vNode.node.priceV2.amount).toFixed(2),
                  imageSrc:
                    vNode.node.image?.url ||
                    node.featuredImage?.url ||
                    "https://placehold.co/300x300?text=No+Image",
                }));

                return {
                  id: node.id,
                  name: node.title,
                  handle: node.handle,
                  tags: node.tags || [],
                  variants,
                  colorSwatches: parsedColorSwatches,
                  eyewearFilters: parsedEyewearFilters.filter(
                    (sf) => sf.length > 0,
                  ),
                };
              },
            );
          setAllProducts(fetchedProducts);
          setFilteredProducts(fetchedProducts);
        } else {
          setError(
            "Could not fetch eyewear products or no products in collection.",
          );
          setAllProducts([]);
          setFilteredProducts([]);
        }
      } catch (err: any) {
        setError(
          err.message || "An error occurred while fetching eyewear products.",
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
      (value) => value !== null,
    );

    if (hasActiveSidebarFilters) {
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) {
          tempProducts = tempProducts.filter((product: any) =>
            product.eyewearFilters?.some(
              (filterVal: string) =>
                filterVal.toLowerCase() === value.toLowerCase(),
            ),
          );
        }
      });
    }

    if (lowerSearchTerm) {
      tempProducts = tempProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerSearchTerm) ||
          product.tags?.some((tag) =>
            tag.toLowerCase().includes(lowerSearchTerm),
          ),
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
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-6 sm:px-10 md:px-12 lg:px-20 xl:px-28 2xl:px-36 py-8 text-center text-red-600 bg-slate-50 min-h-screen">
        Error fetching products: {error}
      </div>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen pb-20">
      <div className="w-full px-6 py-8 sm:px-10 md:px-12 lg:px-16 xl:px-20 max-w-[1600px] mx-auto">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 xl:gap-x-12">
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-3 xl:col-span-3 sticky top-24 self-start pr-2">
            <FilterSidebar
              filterSections={filterSections}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearAllFilters={clearAllFilters}
              productCount={filteredProducts.length}
            />
          </div>

          <div className="lg:col-span-9 xl:col-span-9">
            <Hero
              title="Eyeglasses"
              headline="Starting at $145, including prescription lenses. Try on 5 pairs for free at home."
            />

            {/* Mobile/Tablet Search and Filter Buttons */}
            <div className="my-6 lg:my-8 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, shape, or material..."
                className="w-full pl-11 pr-10 py-3.5 text-base border border-gray-300 rounded-xl shadow-sm focus:ring-1 focus:ring-black focus:border-black transition-shadow"
              />
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <XIcon size={18} />
                </button>
              )}
            </div>

            <div className="lg:hidden my-6">
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl text-base font-medium text-gray-800 hover:bg-gray-50 shadow-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-500" />
                  <span>
                    Filters
                    {Object.values(activeFilters).filter((v) => v).length > 0 &&
                      ` (${Object.values(activeFilters).filter((v) => v).length})`}
                  </span>
                </div>
              </button>
            </div>

            {/* Mobile Filter Drawer */}
            {isMobileFilterOpen && (
              <div
                className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <div
                  className="fixed top-0 left-0 h-full w-[85%] max-w-[360px] bg-white shadow-2xl p-6 overflow-y-auto transform transition-transform ease-out duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Filters
                    </h2>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <XIcon size={20} />
                    </button>
                  </div>
                  <FilterSidebar
                    filterSections={filterSections}
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                    onClearAllFilters={clearAllFilters}
                    productCount={filteredProducts.length}
                  />
                </div>
              </div>
            )}

            {/* Product Grid */}
            <div className="mt-8">
              {isLoading &&
              filteredProducts.length === 0 &&
              allProducts.length > 0 ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <Loader2 className="h-10 w-10 animate-spin text-black" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <EyewearProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-gray-400 h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No frames found
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    We couldn't find any frames matching your current filters.
                    Try adjusting your selections.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-black text-white text-sm font-medium rounded-lg shadow-md hover:bg-gray-800 transition-colors"
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
            colorSwatchesMetafield: metafield(
              namespace: "custom"
              key: "color_swatches"
            ) {
              value
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
