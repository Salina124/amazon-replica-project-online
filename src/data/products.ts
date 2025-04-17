
import { Product } from "@/components/ProductCard";

// Mock data for products
export const products: Product[] = [
  {
    id: 1,
    title: "Apple AirPods Pro (2nd Generation) Wireless Earbuds",
    price: 249.99,
    image: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
    rating: 4.7,
    reviewCount: 23482,
    isPrime: true,
    discountPercent: 20
  },
  {
    id: 2,
    title: "Samsung Galaxy S23 Ultra Cell Phone, Factory Unlocked Android Smartphone, 256GB Storage",
    price: 1199.99,
    image: "https://m.media-amazon.com/images/I/716nc5VyVeL._AC_SL1500_.jpg",
    rating: 4.5,
    reviewCount: 1254,
    isPrime: true,
    discountPercent: 15
  },
  {
    id: 3,
    title: "Kindle Paperwhite (8 GB) – Now with a 6.8\" display and adjustable warm light",
    price: 139.99,
    image: "https://m.media-amazon.com/images/I/61Ww4abGclL._AC_SL1000_.jpg",
    rating: 4.8,
    reviewCount: 32765,
    isPrime: true
  },
  {
    id: 4,
    title: "Ninja AF101 Air Fryer that Crisps, Roasts, Reheats, & Dehydrates, 4 Quart",
    price: 99.99,
    image: "https://m.media-amazon.com/images/I/71+8yTEpEWL._AC_SL1500_.jpg",
    rating: 4.6,
    reviewCount: 43590,
    isPrime: true,
    discountPercent: 32
  },
  {
    id: 5,
    title: "Apple MacBook Air Laptop M2 Chip: 13.6-inch Liquid Retina Display, 8GB RAM, 256GB SSD",
    price: 1099.99,
    image: "https://m.media-amazon.com/images/I/71f5Eu5lJSL._AC_SL1500_.jpg",
    rating: 4.8,
    reviewCount: 2478,
    isPrime: true
  },
  {
    id: 6,
    title: "LEGO Star Wars: The Mandalorian The Child 75318 Building Kit",
    price: 79.99,
    image: "https://m.media-amazon.com/images/I/71Horgak-2L._AC_SL1500_.jpg",
    rating: 4.9,
    reviewCount: 19876,
    isPrime: true,
    discountPercent: 25
  },
  {
    id: 7,
    title: "Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker",
    price: 129.99,
    image: "https://m.media-amazon.com/images/I/71pz4ZuVDSL._AC_SL1500_.jpg",
    rating: 4.7,
    reviewCount: 123654,
    isPrime: true,
    discountPercent: 40
  },
  {
    id: 8,
    title: "PlayStation 5 Console Slim",
    price: 499.99,
    image: "https://m.media-amazon.com/images/I/61hJ40qZKKL._SL1500_.jpg",
    rating: 4.8,
    reviewCount: 5641,
    isPrime: true
  }
];

// Get featured products
export const getFeaturedProducts = (): Product[] => {
  return products.slice(0, 4);
};

// Get deal products (with discounts)
export const getDealProducts = (): Product[] => {
  return products.filter(product => product.discountPercent);
};

// Get recommended products
export const getRecommendedProducts = (): Product[] => {
  return products;
};

// Get a specific product by ID
export const getProductById = (id: number): Product | undefined => {
  return products.find(product => product.id === id);
};
