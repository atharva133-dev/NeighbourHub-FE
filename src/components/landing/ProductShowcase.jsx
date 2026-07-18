import { motion } from "framer-motion";
import { CheckCircle2, Calendar, ArrowRight, Eye, MessageCircle, Heart } from "lucide-react";

export default function ProductShowcase() {
  return (
    <section id="showcase" className="py-24 bg-[#F6F5EF] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-6 relative flex justify-center items-center min-h-[500px]">
            <motion.div
              initial={{ opacity: 0, x: -30, rotate: -5 }}
              whileInView={{ opacity: 1, x: 0, rotate: -3 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="absolute left-[10%] top-0 w-[240px] h-[480px] rounded-[36px] border-[8px] border-slate-900 bg-slate-950 shadow-2xl z-10 flex flex-col overflow-hidden"
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20" />
              <div className="flex-1 bg-[#FCFBF6] p-3 pt-8 text-[10px] text-[#20261F]">
                <div className="font-bold text-[#20261F] mb-2">Bookings</div>
                <div className="flex gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-[#C97B5A] text-white font-semibold">Upcoming</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E4EBE1] text-[#20261F]">History</span>
                </div>
                
                <div className="bg-[#FCFBF6] border border-[rgba(32,38,31,0.12)] rounded-lg p-2.5 mb-2 shadow-xs">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Calendar className="h-3 w-3 text-[#6E8F73]" />
                    <span className="font-bold text-[#20261F]">Clubhouse</span>
                  </div>
                  <div className="text-[rgba(32,38,31,0.5)] text-[8px] mb-1">May 18, 2026 • 5:00 PM - 7:00 PM</div>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#E4EBE1] text-[#6E8F73] font-bold text-[8px]">Confirmed</span>
                </div>

                <div className="bg-[#FCFBF6] border border-[rgba(32,38,31,0.12)] rounded-lg p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Calendar className="h-3 w-3 text-[#6E8F73]" />
                    <span className="font-bold text-[#20261F]">Tennis Court</span>
                  </div>
                  <div className="text-[rgba(32,38,31,0.5)] text-[8px] mb-1">May 20, 2026 • 8:00 AM - 9:00 AM</div>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#F3DFD1] text-[#C97B5A] font-bold text-[8px]">Pending</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30, rotate: 5 }}
              whileInView={{ opacity: 1, x: 0, rotate: 3 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="absolute left-[38%] top-12 w-[240px] h-[480px] rounded-[36px] border-[8px] border-slate-900 bg-slate-950 shadow-2xl z-20 flex flex-col overflow-hidden"
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20" />
              <div className="flex-1 bg-[#FCFBF6] p-3 pt-8 text-[10px] text-[#20261F]">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-[#20261F]">Post</span>
                </div>
                
                <div className="flex items-center gap-1.5 mb-2">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&h=40&q=80" className="h-5 w-5 rounded-full object-cover" alt="" />
                  <div>
                    <div className="font-bold text-[#20261F]">Admin</div>
                    <div className="text-[7px] text-[rgba(32,38,31,0.5)]">2m ago</div>
                  </div>
                </div>

                <div className="font-semibold text-[#20261F] mb-1">Lift Maintenance</div>
                <p className="text-[9px] text-[rgba(32,38,31,0.7)] mb-2 leading-relaxed">
                  The lift in Block A will be under maintenance on 16th May from 9:00 AM to 1:00 PM.
                </p>

                <div className="flex gap-3 text-[8px] text-slate-400 font-semibold border-t border-slate-50 pt-2">
                  <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5 text-[#A8442F] fill-current" /> 12 Likes</span>
                  <span className="flex items-center gap-0.5"><MessageCircle className="h-2.5 w-2.5" /> 3 Comments</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 flex flex-col gap-6"
          >
            <span className="text-xs font-bold text-[#C97B5A] uppercase tracking-widest">
              Powerful Features
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#20261F] sm:text-5xl">
              Smarter Tools for Stronger Communities
            </h2>
            <p className="text-lg text-[rgba(32,38,31,0.7)]">
              Bring coordination and communication together. Empower managers and community members alike with a modern app designed for accessibility and security.
            </p>

            <ul className="space-y-4">
              {[
                "AI automatically categorizes and tags posts",
                "Real-time notifications keep everyone in the loop",
                "Book any amenity, anytime, transparently",
                "Access your community in your preferred language"
              ].map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#6E8F73] shrink-0" />
                  <span className="text-[16px] text-[#20261F] font-semibold">{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl bg-[#C97B5A] px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-[#C97B5A]/20 hover:bg-[#A85C3F] hover:shadow-[#C97B5A]/30 transition-all duration-200 hover:scale-[1.02]"
              >
                Explore All Features
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
