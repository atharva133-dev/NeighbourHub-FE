import { motion } from "framer-motion";
import { ArrowRight, Play, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section id="cta" className="py-24 bg-[#F6F5EF] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[40px] bg-gradient-to-tr from-[#6E8F73] via-[#C97B5A] to-[#A8442F] px-8 py-16 sm:px-16 sm:py-24 shadow-2xl shadow-[#C97B5A]/20 text-white flex flex-col lg:flex-row items-center justify-between gap-12"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-6 max-w-2xl text-center md:text-left z-10">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-white border border-white/20 backdrop-blur-md shadow-inner">
              <MapPin className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold sm:text-4xl leading-tight">
                Ready to Bring Your Community Together?
              </h2>
              <p className="mt-4 text-[16px] text-white/80 leading-relaxed font-semibold">
                Join thousands of communities already using NeighbourHub to connect, collaborate, and grow together.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto justify-center z-10">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-4 text-[15px] font-bold text-[#C97B5A] shadow-lg hover:bg-[#FCFBF6] transition-all duration-200 hover:scale-[1.02]"
            >
              Get Started for Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
            <a
              href="#showcase"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-4 text-[15px] font-bold text-white hover:bg-white/20 backdrop-blur-md transition-all duration-200 hover:scale-[1.02]"
            >
              <Play className="h-4 w-4 mr-2 fill-current" />
              Book & Demo
            </a>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
