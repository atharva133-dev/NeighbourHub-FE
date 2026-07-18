import { motion } from "framer-motion";
import { UserPlus, UserCheck, MessageSquare, Bell } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "1",
    title: "Create or Join",
    description: "Create your community or join using a unique 6-digit code."
  },
  {
    icon: UserCheck,
    step: "2",
    title: "Get Verified",
    description: "Verify your email securely using OTP to access your community."
  },
  {
    icon: MessageSquare,
    step: "3",
    title: "Post & Connect",
    description: "Share updates, events, and announcements in real time."
  },
  {
    icon: Bell,
    step: "4",
    title: "Stay Notified",
    description: "Receive instant notifications and never miss what matters."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#F6F5EF] relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-[#20261F] sm:text-5xl">
            How NeighbourHub Works
          </h2>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 border-t border-dashed border-[rgba(32,38,31,0.12)] -translate-y-12 hidden lg:block z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-[#E4EBE1] text-[#6E8F73] group-hover:bg-[#6E8F73] group-hover:text-white transition-all duration-300 shadow-md shadow-[#6E8F73]/5 mb-6">
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#20261F] text-xs font-bold text-white group-hover:scale-110 transition-transform">
                    {step.step}
                  </span>
                  <step.icon className="h-10 w-10 group-hover:rotate-6 transition-transform duration-300" />
                </div>

                <h3 className="text-xl font-bold text-[#20261F] mb-3">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-[rgba(32,38,31,0.7)] max-w-xs">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
