import React, { useState } from 'react';
import { blogPosts, BlogPost } from '../data/blog';
import { BookOpen, Calendar, Clock, ArrowRight, User, X } from 'lucide-react';

export const GroomingBlog: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <section id="blog" className="bg-[#101010] py-24 px-6 border-b border-[#39352E]">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[#C9A45C] text-xs font-mono uppercase tracking-widest font-bold">
              <BookOpen className="w-4 h-4" />
              The Gentleman's Gazette
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-[#F7F4EE] tracking-tight">
              Master Grooming Knowledge
            </h2>
            <p className="text-[#A7A7A7] text-sm leading-relaxed">
              Expert advice direct from master barbers on fades, beard sculpts, scalp maintenance, and product chemistry.
            </p>
          </div>

          <div className="text-xs font-mono text-[#C9A45C] uppercase tracking-widest font-bold">
            Read Weekly Publications
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {blogPosts.slice(0, 3).map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-[#191919] border border-[#39352E] hover:border-[#C9A45C]/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-lg cursor-pointer"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#222222]">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-[#101010]/80 backdrop-blur-md border border-[#39352E] px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-[#F1D9A3] uppercase">
                    {post.category}
                  </div>
                </div>

                {/* Article Info */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#A7A7A7]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#C9A45C]" />
                      {post.publishDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C9A45C]" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-xl text-[#F7F4EE] group-hover:text-[#C9A45C] transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-[#A7A7A7] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Author & CTA Footer */}
              <div className="p-6 pt-0 border-t border-[#39352E]/40 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">By <strong className="text-[#F1D9A3]">{post.author}</strong></span>
                <span className="text-[#C9A45C] group-hover:text-[#F1D9A3] font-bold flex items-center gap-1">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Secondary 2 Articles Preview strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {blogPosts.slice(3, 5).map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-[#191919] border border-[#39352E] hover:border-[#C9A45C]/60 p-5 rounded-2xl flex flex-col sm:flex-row gap-5 items-center cursor-pointer group transition-all"
            >
              <div className="w-full sm:w-32 aspect-square sm:aspect-auto sm:h-28 rounded-xl overflow-hidden bg-[#222222] shrink-0">
                <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="text-[10px] font-mono text-[#C9A45C] uppercase tracking-wider font-bold">
                  {post.category} &bull; {post.readTime}
                </span>
                <h4 className="font-serif font-bold text-base text-[#F7F4EE] group-hover:text-[#C9A45C] transition-colors">
                  {post.title}
                </h4>
                <p className="text-xs text-[#A7A7A7] line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Full Article Reader Modal */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#191919] border border-[#C9A45C]/40 rounded-3xl max-w-3xl w-full p-6 sm:p-10 space-y-6 text-left relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#222222] hover:bg-[#39352E] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 pr-12">
                <div className="flex items-center gap-2 text-xs font-mono text-[#C9A45C] uppercase tracking-wider font-bold">
                  <span>{selectedPost.category}</span>
                  <span>•</span>
                  <span>{selectedPost.publishDate}</span>
                  <span>•</span>
                  <span>{selectedPost.readTime}</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-serif font-black text-[#F7F4EE]">
                  {selectedPost.title}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
                  <User className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Written by <strong className="text-[#F1D9A3]">{selectedPost.author}</strong> ({selectedPost.authorRole})</span>
                </div>
              </div>

              <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-[#39352E]">
                <img src={selectedPost.featuredImage} alt={selectedPost.title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-4 text-sm text-slate-200 leading-relaxed font-sans">
                <p className="text-base text-[#F1D9A3] font-serif italic border-l-2 border-[#C9A45C] pl-4">
                  "{selectedPost.excerpt}"
                </p>
                {selectedPost.contentParagraphs.map((para, idx) => (
                  <p key={idx} className="text-slate-300">
                    {para}
                  </p>
                ))}
              </div>

              <div className="pt-4 border-t border-[#39352E] flex justify-between items-center text-xs font-mono">
                <span className="text-[#A7A7A7]">Published by The Gent's Den Editorial Desk</span>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2 bg-[#222222] hover:bg-[#39352E] text-white rounded-xl cursor-pointer"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
