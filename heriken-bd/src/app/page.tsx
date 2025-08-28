'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ShoppingBagIcon, 
  HeartIcon, 
  MagnifyingGlassIcon,
  PhoneIcon,
  TruckIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)

  // Hero slider data
  const heroSlides = [
    {
      id: 1,
      title: 'Welcome to Khapsu',
      titleEn: 'Welcome to Khapsu',
      subtitle: 'Bangladesh\'s Premier Online Shopping Destination',
      subtitleEn: 'Bangladesh\'s Premier Online Shopping Destination',
      image: '/hero-1.jpg',
      cta: 'Shop Now',
      ctaEn: 'Shop Now',
      link: '/products'
    },
    {
      id: 2,
      title: 'Special Offers',
      titleEn: 'Special Offers',
      subtitle: 'Up to 50% Off on All Products',
      subtitleEn: 'Up to 50% Off on All Products',
      image: '/hero-2.jpg',
      cta: 'View Offers',
      ctaEn: 'View Offers',
      link: '/offers'
    },
    {
      id: 3,
      title: 'Free Delivery',
      titleEn: 'Free Delivery',
      subtitle: 'Free Delivery on Orders Above ৳1000',
      subtitleEn: 'Free Delivery on Orders Above ৳1000',
      image: '/hero-3.jpg',
      cta: 'Order Now',
      ctaEn: 'Order Now',
      link: '/products'
    }
  ]

  // Featured categories
  const categories = [
    { id: 1, name: 'Electronics', nameEn: 'Electronics', icon: '📱', count: 150 },
    { id: 2, name: 'Fashion', nameEn: 'Fashion', icon: '👕', count: 300 },
    { id: 3, name: 'Home & Garden', nameEn: 'Home & Garden', icon: '🏠', count: 200 },
    { id: 4, name: 'Sports', nameEn: 'Sports', icon: '⚽', count: 100 },
    { id: 5, name: 'Books', nameEn: 'Books', icon: '📚', count: 500 },
    { id: 6, name: 'Beauty', nameEn: 'Beauty', icon: '💄', count: 80 }
  ]

  // Featured products
  const featuredProducts = [
    {
      id: 1,
      name: 'Samsung Galaxy S21',
      nameEn: 'Samsung Galaxy S21',
      price: 45000,
      originalPrice: 50000,
      image: '/product-1.jpg',
      rating: 4.5,
      reviews: 120,
      isNew: true,
      isFeatured: true
    },
    {
      id: 2,
      name: 'Nike Air Max 270',
      nameEn: 'Nike Air Max 270',
      price: 8500,
      originalPrice: 10000,
      image: '/product-2.jpg',
      rating: 4.8,
      reviews: 85,
      isNew: false,
      isFeatured: true
    },
    {
      id: 3,
      name: 'Cotton T-Shirt',
      nameEn: 'Cotton T-Shirt',
      price: 1500,
      originalPrice: 2000,
      image: '/product-3.jpg',
      rating: 4.2,
      reviews: 200,
      isNew: true,
      isFeatured: true
    },
    {
      id: 4,
      name: 'Wireless Headphones',
      nameEn: 'Wireless Headphones',
      price: 3500,
      originalPrice: 4500,
      image: '/product-4.jpg',
      rating: 4.6,
      reviews: 95,
      isNew: false,
      isFeatured: true
    }
  ]

  // Auto-slide hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price).replace('BDT', '৳')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        {/* Top Bar */}
        <div className="bg-green-600 text-white py-2">
          <div className="container mx-auto px-4 flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span>📞 16263 (24/7 Customer Support)</span>
              <span>🚚 Free Delivery on Orders Above ৳1000</span>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <span>Welcome, {session.user.name}</span>
              ) : (
                <Link href="/auth/signin" className="hover:underline">
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                K
              </div>
              <span className="text-2xl font-bold text-gray-800">Khapsu</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-green-600">
                <HeartIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </button>
              <button className="relative p-2 text-gray-600 hover:text-green-600">
                <ShoppingBagIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-gray-100 border-t">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-8 py-3">
              <Link href="/categories" className="text-gray-700 hover:text-green-600 font-medium">
                All Categories
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-green-600">
                Products
              </Link>
              <Link href="/offers" className="text-gray-700 hover:text-green-600">
                Offers
              </Link>
              <Link href="/brands" className="text-gray-700 hover:text-green-600">
                Brands
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-green-600">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-green-600">
                Contact
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-green-600 to-green-800 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-xl mb-8 opacity-90">
              {heroSlides[currentSlide].subtitle}
            </p>
            <Link
              href={heroSlides[currentSlide].link}
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {heroSlides[currentSlide].cta}
            </Link>
          </div>
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Free Delivery</h3>
              <p className="text-gray-600 text-sm">On orders above ৳1000</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">bKash, Nagad, Upay</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Partial Payment</h3>
              <p className="text-gray-600 text-sm">Pre-order facility</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Contact us anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Popular Categories</h2>
            <p className="text-gray-600">Find your favorite products</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow group"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-green-600">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">{category.count} products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Products</h2>
            <p className="text-gray-600">Check out our best products</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Product Image</span>
                  </div>
                  {product.isNew && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                      New
                    </span>
                  )}
                  <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <HeartIcon className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-green-600">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">({product.reviews})</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link
              href="/products"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              View More Products
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Subscribe to Newsletter</h2>
          <p className="text-green-100 mb-8">Subscribe to get latest offers and updates</p>
          
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <button className="bg-green-800 text-white px-6 py-3 rounded-r-lg hover:bg-green-900 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                  K
                </div>
                <span className="text-xl font-bold">Khapsu</span>
              </div>
              <p className="text-gray-300 mb-4">
                Bangladesh's premier online shopping destination. We are committed to providing quality products and services.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">📘</a>
                <a href="#" className="text-gray-300 hover:text-white">📷</a>
                <a href="#" className="text-gray-300 hover:text-white">🐦</a>
                <a href="#" className="text-gray-300 hover:text-white">📺</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms & Conditions</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-300 hover:text-white">Help Center</Link></li>
                <li><Link href="/returns" className="text-gray-300 hover:text-white">Return Policy</Link></li>
                <li><Link href="/shipping" className="text-gray-300 hover:text-white">Shipping Info</Link></li>
                <li><Link href="/track" className="text-gray-300 hover:text-white">Track Order</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="space-y-2 text-gray-300">
                <p>📞 16263 (24/7)</p>
                <p>📧 support@khapsu.com</p>
                <p>📍 Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Khapsu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
