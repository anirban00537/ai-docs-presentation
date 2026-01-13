"use client";

import React from "react";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { FooterSection } from "@/components/sections/footer-section";
import { motion } from "framer-motion";
import { IconSparkles, IconBolt, IconBrain, IconPalette } from "@tabler/icons-react";

export default function AboutPage() {
    const features = [
        {
            icon: <IconBolt className="text-secondary" size={24} />,
            title: "Ready in Seconds",
            description: "No more all-nighters. Just type your topic, and our AI builds a complete deck for you instantly."
        },
        {
            icon: <IconBrain className="text-primary" size={24} />,
            title: "Smart Writing",
            description: "Our AI learns from what you type. It writes clear, catchy text that sounds just like a professional."
        },
        {
            icon: <IconPalette className="text-pink-500" size={24} />,
            title: "Beautiful Designs",
            description: "Say goodbye to ugly cards. Everything is automatically formatted to look stunning and consistent."
        },
        {
            icon: <IconSparkles className="text-amber-500" size={24} />,
            title: "Easy Editing",
            description: "Want to change something? Just click and type. It's as simple as using a text document."
        }
    ];

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center mb-16">

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="font-serif text-6xl md:text-8xl font-medium tracking-tight leading-[1] mb-8 text-foreground"
                            >
                                Simply <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">
                                    Brilliant.
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-2xl md:text-3xl text-muted-foreground font-light leading-snug max-w-2xl mx-auto"
                            >
                                Docs reimagined. <br className="hidden md:block" />
                                Powered by intelligence. Designed for you.
                            </motion.p>
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="py-24 bg-slate-50 relative">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-10 bg-white p-2">
                                    <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-100 via-purple-50 to-teal-50 flex items-center justify-center">
                                        <div className="text-center p-8">
                                            <span className="text-8xl mb-4 block">✨</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl" />
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-10"
                            >
                                <h2 className="font-serif text-5xl md:text-6xl font-medium leading-tight text-foreground">
                                    It just works.
                                </h2>
                                <div className="space-y-6 text-xl text-slate-600 font-light leading-relaxed">
                                    <p>
                                        We believe the best tools get out of your way. They shouldn't require a manual. They should just work.
                                    </p>
                                    <p>
                                        Butterfast uses advanced AI to instantly understand your ideas and structure them into a beautiful narrative. No formatting. No friction.
                                    </p>
                                    <p>
                                        It's the power of a professional designer and a copywriter, right at your fingertips.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-32 relative overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="font-serif text-4xl md:text-6xl font-medium mb-6">Experience the difference.</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-8 rounded-3xl bg-slate-50 sm:bg-transparent sm:hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <FooterSection />
            </main>
        </>
    );
}
