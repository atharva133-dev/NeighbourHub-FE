import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  ShieldAlert,
  Sparkles,
  HeartHandshake,
  Languages,
  Image as ImageIcon,
  Clock
} from "lucide-react";

const features = [
  {
    icon: Bell,
    title: "Real-time Updates",
    description: "Instant posts and notifications powered by Socket.io. Never miss an important update.",
    color: "text-[#6E8F73] bg-[#E4EBE1]"
  },
  {
    icon: Calendar,
    title: "Amenity Booking",
    description: "Admins can create any amenities and members can book them with ease.",
    color: "text-[#C97B5A] bg-[#F3DFD1]"
  },
  {
    icon: ShieldAlert,
    title: "Secure & Private",
    description: "Join your community using unique 6-digit codes. Your data is safe with JWT & OTP verification.",
    color: "text-[#4E6B54] bg-[#E4EBE1]"
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Gemini AI categorizes posts automatically with a smart model fallback system.",
    color: "text-[#A8442F] bg-[#EAD6CE]"
  },
  {
    icon: HeartHandshake,
    title: "Content Moderation",
    description: "HuggingFace AI detects and filters toxic content to keep your community safe and respectful.",
    color: "text-pink-600 bg-pink-50"
  },
  {
    icon: Languages,
    title: "Multi-language Support",
    description: "Google Translate integration makes posts accessible in your preferred language.",
    color: "text-teal-600 bg-teal-50"
  },
  {
    icon: ImageIcon,
    title: "Media Sharing",
    description: "Upload images and media seamlessly with Cloudinary integration.",
    color: "text-cyan-600 bg-cyan-50"
  },
  {
    icon: Clock,
    title: "Smart Automation",
    description: "Automated cleanups and scheduled tasks run in the background with node-cron.",
    color: "text-amber-600 bg-amber-50"
  }
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24 bg-[#FCFBF6]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#20261F] sm:text-5xl">
            Everything You Need for a{" "}
            <span className="bg-gradient-to-r from-[#6E8F73] via-[#C97B5A] to-[#A8442F] bg-clip-text text-transparent">
              Thriving Community
            </span>
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -8 }}
              className="bg-[#FCFBF6] border border-[rgba(32,38,31,0.12)] rounded-[28px] p-8 shadow-xs hover:shadow-lg transition-all duration-300 group flex flex-col items-start"
            >
              <div className={`p-4 rounded-2xl mb-6 ${feat.color} group-hover:scale-110 transition-transform duration-300`}>
                <feat.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#20261F] mb-3">{feat.title}</h3>
              <p className="text-[15px] leading-relaxed text-[rgba(32,38,31,0.7)]">{feat.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
