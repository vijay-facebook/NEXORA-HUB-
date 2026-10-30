import React, { useState } from 'react';
import { groomingProducts, GroomingProduct } from '../data/products';
import { ShoppingBag, Star, Check, Sparkles, Eye, X } from 'lucide-react';

interface GroomingProductsProps {
  onAddToCart?: (product: GroomingProduct) => void;
}

export const GroomingProducts: React.FC<GroomingProductsProps> = ({ onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cartNotification, setCartNotification] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<GroomingProduct | null>(null);

  const categories = ['All', 'Styling', 'Beard Care', 'Hair Care', 'Tools & Kits'];

  const filteredProducts = selectedCategory === 'All'
    ? groomingProducts
    : groomingProducts.filter(p => p.category === selectedCategory);

  const handleAdd = (product: GroomingProduct) => {
    if (onAddToCart) onAddToCart(product);
    setCartNotification(`Added "${product.name}" to your Grooming Bag!`);
    setTimeout(() => setCartNotification(null), 3000);
  };

  return (
    <section id="shop" className="bg-[#101010] py-24 px-6 border-b border-[#39352E] relative">
      
      {/* Toast Notification */}
      {cartNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C9A45C] text-[#101010] px-5 py-3 rounded-2xl shadow-2xl font-mono text-xs font-bold flex items-center gap-2 border border-[#F1D9A3] animate-slideUp">
          <Check className="w-4 h-4 text-[#101010]" />
          <span>{cartNotification}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[#C9A45C] text-xs font-mono uppercase tracking-widest font-bold">
              <ShoppingBag className="w-4 h-4" />
              Barber-Grade Apothecary
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#F7F4EE] tracking-tight">
              Curated Grooming Products
            </h2>
            <p className="text-[#A7A7A7] text-sm leading-relaxed">
              Take the chair experience home. Hand-poured botanical pomades, cedarwood oils, and organic clay formulations engineered by master barbers.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#C9A45C] text-[#101010]'
                    : 'bg-[#191919] text-[#A7A7A7] border border-[#39352E] hover:border-[#C9A45C] hover:text-[#F7F4EE]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-[#191919] border border-[#39352E] hover:border-[#C9A45C]/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-lg text-left"
            >
              <div>
                {/* Product Image Frame */}
                <div 
                  onClick={() => setSelectedProduct(prod)}
                  className="relative aspect-square bg-[#222222] overflow-hidden cursor-pointer"
                >
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Stock Tag */}
                  <div className="absolute top-3 left-3 bg-[#101010]/80 backdrop-blur-md border border-[#39352E] px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 font-bold">
                    ● In Stock ({prod.stockCount})
                  </div>

                  {/* Size Pill */}
                  <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                    {prod.size}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-1 text-[#C9A45C] text-[11px] font-mono">
                    <Star className="w-3 h-3 fill-[#C9A45C]" />
                    <span>{prod.rating}</span>
                    <span className="text-[#A7A7A7]">({prod.reviewsCount})</span>
                  </div>

                  <h3 
                    onClick={() => setSelectedProduct(prod)}
                    className="font-serif font-bold text-base text-[#F7F4EE] hover:text-[#C9A45C] transition-colors cursor-pointer"
                  >
                    {prod.name}
                  </h3>

                  <p className="text-xs text-[#A7A7A7] line-clamp-2">
                    {prod.tagline}
                  </p>
                </div>
              </div>

              {/* Pricing & Add to Cart */}
              <div className="p-5 pt-0 space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-mono font-black text-[#F1D9A3]">
                    ₹{prod.price}
                  </span>
                  {prod.originalPrice && (
                    <span className="text-xs font-mono text-[#A7A7A7] line-through">
                      ₹{prod.originalPrice}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedProduct(prod)}
                    className="p-2.5 bg-[#222222] hover:bg-[#39352E] border border-[#39352E] rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="View Product Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAdd(prod)}
                    className="flex-1 py-2.5 bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer font-sans shadow-md"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Product Quick View Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#191919] border border-[#C9A45C]/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-left relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#222222] hover:bg-[#39352E] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#222222] border border-[#39352E]">
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#C9A45C] uppercase tracking-wider font-bold">
                      {selectedProduct.category} &bull; {selectedProduct.size}
                    </span>
                    <h3 className="text-2xl font-serif font-black text-[#F7F4EE] mt-1">
                      {selectedProduct.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-mono text-[#F1D9A3]">
                    <span className="text-2xl font-black">₹{selectedProduct.price}</span>
                    {selectedProduct.originalPrice && (
                      <span className="text-xs text-[#A7A7A7] line-through">₹{selectedProduct.originalPrice}</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {selectedProduct.description}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        handleAdd(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="w-full py-3.5 bg-[#C9A45C] hover:bg-[#F1D9A3] text-[#101010] rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg font-sans flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag — ₹{selectedProduct.price}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
