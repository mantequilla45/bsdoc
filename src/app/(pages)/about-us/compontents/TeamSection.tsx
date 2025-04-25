import Image from "next/image";
import { motion } from "framer-motion";

const TeamSection = () => {
  const team = [
    {
      name: "Dr. Bombardiro Crocodillo",
      role: "Chief of Emergency Self-Care",
      image: "/Images/profile/Bombardiro_Crocodilo.webp",
      bio: "🩺 Once a field medic in the swamps of the digital frontier, Dr. Crocodillo now leads BSDOC's rapid response unit. Known for his explosive approach to symptom triage, he can diagnose a sprain from a mile away and prescribe relief faster than you can say 'first aid.'"
    },
    {
      name: "Dr. Lirilì Larilà",
      role: "Director of Holistic Healing",
      image: "/Images/profile/Lirili_rili_ralila.webp",
      bio: "🌿 Emerging from the serene realms of alternative medicine, Dr. Larilà integrates traditional remedies with modern tech. At BSDOC, she crafts personalized wellness plans that harmonize body, mind, and app notifications."
    },
    {
      name: "Dr. Tralalero Tralala",
      role: "Head of Preventive Care Innovations",
      image: "/Images/profile/tralalero-tralala.jpg",
      bio: "🦈 A visionary in proactive health, Dr. Tralala designs BSDOC's cutting-edge tools to keep ailments at bay. His signature blue sneakers are said to symbolize his commitment to keeping users one step ahead of common illnesses."
    }
  ];
  

  return (
    <section className="py-16 md:py-24 px-6">
      <div className="container max-w-[1300px] mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl lg:text-6xl text-[#62B6B8] font-bold text-center mb-16"
        >
          Our Team
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-64 w-full bg-gray-100">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                <p className="text-[#62B6B8] font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;