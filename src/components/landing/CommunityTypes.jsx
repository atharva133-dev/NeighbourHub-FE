import { motion } from "framer-motion";
import { Home, GraduationCap, Users2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const communities = [
  {
    icon: Home,
    title: "Building Societies",
    description: "Manage residents, amenities, notices, and deliveries effortlessly.",
    color: "text-[#6E8F73] bg-[#E4EBE1]"
  },
  {
    icon: GraduationCap,
    title: "Colleges & Schools",
    description: "Engage students, share announcements, manage events, and more.",
    color: "text-[#C97B5A] bg-[#F3DFD1]"
  },
  {
    icon: Users2,
    title: "Other Organizations",
    description: "Perfect for clubs, NGOs, offices, and any organized community.",
    color: "text-[#4E6B54] bg-[#E4EBE1]"
  }
];

export default function CommunityTypes() {
  return (
    <section className="py-24 bg-[#FCFBF6]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#20261F] sm:text-5xl">
            Built for Every Type of Community
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {communities.map((comm, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -6 }}
              className="bg-[#FCFBF6] border border-[rgba(32,38,31,0.12)] rounded-[28px] p-8 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col items-start"
            >
              <div className={`p-4 rounded-2xl mb-6 ${comm.color}`}>
                <comm.icon className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-[#20261F] mb-3">{comm.title}</h3>
              <p className="text-[16px] leading-relaxed text-[rgba(32,38,31,0.7)] mb-6">{comm.description}</p>
              
              <a
                href="#cta"
                className="mt-auto inline-flex items-center gap-1.5 text-[15px] font-bold text-[#C97B5A] hover:text-[#A85C3F] transition-colors group"
              >
                <span>Learn More</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
