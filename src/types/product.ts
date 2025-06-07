// src/types/product.ts

export interface MappedProduct {
    id: string;
    name: string;
    href: string;
    price: string;
    imageSrc: string;
    imageAlt: string | null;
    searchFilters?: string[];
    tags?: string[];
    // Add other fields that you might need from your product objects
}
