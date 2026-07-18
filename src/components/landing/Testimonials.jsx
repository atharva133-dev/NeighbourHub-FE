import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Rohan Mehta",
    role: "Secretary, Green Valley Apts",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
    quote: "NeighbourHub has transformed the way we communicate. Everything is organized and instantly accessible! Highly recommended for residential societies.",
    rating: 5
  },
  {
    name: "Priya Sharma",
    role: "Admin, Bright Future School",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
    quote: "The platform is super easy to use and has improved our engagement with students and parents. Our announcement reach has doubled.",
    rating: 5
  },
  {
    name: "Amit Verma",
    role: "Manager, Sunrise Residency",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    quote: "Amenity booking and real-time updates have made community management so much smoother. Residents love the transparent booking system.",
    rating: 5
  },
  {
    name: "Neha Iyer",
    role: "Cultural Head, Tech Club",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80",
    quote: "Perfect for our college! Events, notices, everything at one place. The AI categorization feature is incredibly smart and saves hours of moderation.",
    rating: 5
  },
  {
    name: "Siddharth Rao",
    role: "Coordinator, Youth Organization",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80",
    quote: "Simple, secure and incredibly effective for our organization's daily communication. The 6-digit access code system makes onboarding members a breeze.",
    rating: 5
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-[#F6F5EF]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Loved by Communities
          </h2>
        </div>

        <div className="hidden lg:grid grid-cols-3 gap-8 mb-12">
          {testimonials.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-100 rounded-[28px] p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-amber-500 mb-6">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-[15px] leading-relaxed text-slate-600 mb-6 italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={item.avatar}
                  className="h-10 w-10 rounded-full object-cover"
                  alt={item.name}
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-400 font-semibold">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:hidden relative max-w-lg mx-auto bg-slate-50 border border-slate-100 rounded-[28px] p-8 min-h-[300px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-amber-500 mb-6">
                  {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-[15px] leading-relaxed text-slate-600 mb-6 italic">
                  "{testimonials[activeIndex].quote}"
                </p>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={testimonials[activeIndex].avatar}
                  className="h-10 w-10 rounded-full object-cover"
                  alt={testimonials[activeIndex].name}
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{testimonials[activeIndex].name}</h4>
                  <p className="text-xs text-slate-400 font-semibold">{testimonials[activeIndex].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute right-6 bottom-6 flex gap-2">
            <button
              onClick={handlePrev}
              className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === idx ? "w-6 bg-[#C97B5A]" : "w-2 bg-[#E4EBE1]"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
