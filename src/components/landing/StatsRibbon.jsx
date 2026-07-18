import { motion } from "framer-motion";

const stats = [
  { value: "2,000+", label: "Active Communities" },
  { value: "50,000+", label: "Happy Members" },
  { value: "100K+", label: "Posts & Updates" },
  { value: "99.9%", label: "Uptime & Reliable" }
];

export default function StatsRibbon() {
  return (
    <section className="relative overflow-hidden w-full bg-[#FCFBF6] py-12 lg:py-16 text-[#20261F]">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center items-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="flex flex-col gap-1.5"
            >
              <span className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#20261F]">{stat.value}</span>
              <span className="text-xs md:text-sm font-semibold text-[#20261F]">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
