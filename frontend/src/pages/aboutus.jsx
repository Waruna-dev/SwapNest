import React from "react";
import { motion } from "framer-motion";

// Images
import impactHero from "../pictures/fe64b3e246ca0c38c7bb835868f2c100.jpg";
import visionImg from "../pictures/221ffbd54d806c6864d9c45505a28b6c.jpg";
import missionImg from "../pictures/8e9f9071f80d78b121337300604eac54.jpg";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white text-[#1F4135] font-sans">

      {/* HEADER */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-4xl mx-auto text-center">

          {/* Animated Heading */}
          <motion.h1
            className="text-5xl md:text-6xl font-black mb-8 text-[#1F4135]"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              animate={{ x: [0, -5, 5, -5, 5, 0] }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="inline-block"
            >
              About
            </motion.span>{" "}
            <span className="text-[#F97316]">Us</span>
          </motion.h1>

          {/* Paragraphs */}
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed text-left">

            <p>
              SwapNest is a community-driven platform designed to promote sustainable living through item swapping and reuse. 
              Our goal is to reduce waste, support local communities, and build a circular economy by connecting people in smarter ways.
            </p>

            <p>
              SwapNest goes beyond a simple exchange platform — it creates a meaningful ecosystem where individuals can give a second life 
              to unused items instead of discarding them. By encouraging responsible consumption, we help minimize environmental impact 
              while making essential goods more accessible.
            </p>

            <p>
              Our platform also introduces a volunteer network to manage delivery and collection centers, making the swapping process 
              more efficient and accessible while strengthening community collaboration.
            </p>

          </div>

        </div>
      </section>

      {/* HERO */}
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl font-black mb-6">
              Swap<span className="text-[#F97316]">Nest</span>
            </h2>

            <p className="text-gray-600 leading-relaxed text-lg">
              Our platform enables users to exchange items easily while minimizing environmental impact. 
              SwapNest connects people, reduces waste, and supports sustainable communities.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="rounded-3xl overflow-hidden shadow-xl">
            <img src={impactHero} alt="SwapNest" className="w-full h-full object-cover" />
          </motion.div>

        </div>
      </section>

      {/* VISION */}
      <section className="px-6 md:px-16 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="rounded-3xl overflow-hidden shadow-lg">
            <img src={visionImg} alt="Vision" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl font-black mb-6 text-[#F97316]">Our Vision</h2>

            <p className="text-gray-600 text-lg leading-relaxed">
              We envision a world where resources are reused and communities thrive through sharing. 
              SwapNest promotes a circular economy where items are continuously reused, creating sustainable cities and stronger local connections.
            </p>
          </motion.div>

        </div>
      </section>

      {/* MISSION */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl font-black mb-6 text-[#F97316]">Our Mission</h2>

            <p className="text-gray-600 text-lg leading-relaxed">
              Our mission is to make sustainable living simple and accessible. 
              We help users exchange items, reduce waste, and support local communities while enabling efficient delivery and collection systems.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="rounded-3xl overflow-hidden shadow-lg">
            <img src={missionImg} alt="Mission" className="w-full h-full object-cover" />
          </motion.div>

        </div>
      </section>

      {/* VOLUNTEER */}
      <section className="px-6 md:px-16 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-4xl font-black mb-6 text-[#F97316]">Volunteer Network</h2>

          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Join our volunteer network to support delivery and collection centers. Help manage item exchanges and build a sustainable community.
          </p>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="p-8 bg-white rounded-2xl shadow-md border">
              <h3 className="font-bold text-lg mb-3">📦 Collection Centers</h3>
              <p className="text-gray-500">Manage local item collection hubs.</p>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-md border">
              <h3 className="font-bold text-lg mb-3">🚚 Delivery</h3>
              <p className="text-gray-500">Help deliver items to users.</p>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-md border">
              <h3 className="font-bold text-lg mb-3">🤝 Community</h3>
              <p className="text-gray-500">Grow local sustainable networks.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}