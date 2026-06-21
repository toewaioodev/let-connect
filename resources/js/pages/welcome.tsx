import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { Shield, Zap, Globe, Lock, Download, ChevronRight, Activity, Smartphone, Server } from 'lucide-react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function Welcome() {
    const { auth } = usePage().props;
    const { scrollYProgress } = useScroll();

    // Parallax effects
    const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        },
    };

    // Bento box features
    const features = [
        {
            title: "Military-Grade Encryption",
            description: "AES-256 bit encryption ensures your data remains completely indecipherable to prying eyes.",
            icon: Lock,
            size: "col-span-1 md:col-span-2",
            gradient: "from-blue-500/20 to-indigo-500/20",
            iconColor: "text-blue-400"
        },
        {
            title: "Zero Log Policy",
            description: "We never track, read, or store your browsing activity.",
            icon: Shield,
            size: "col-span-1",
            gradient: "from-emerald-500/20 to-teal-500/20",
            iconColor: "text-emerald-400"
        },
        {
            title: "Global Network",
            description: "50+ ultra-fast servers distributed strategically across the globe.",
            icon: Globe,
            size: "col-span-1",
            gradient: "from-purple-500/20 to-pink-500/20",
            iconColor: "text-purple-400"
        },
        {
            title: "Lightning Fast",
            description: "Engineered for speed. Enjoy buffer-free streaming and low-latency gaming.",
            icon: Zap,
            size: "col-span-1 md:col-span-2",
            gradient: "from-amber-500/20 to-orange-500/20",
            iconColor: "text-amber-400"
        }
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-slate-50 font-sans selection:bg-indigo-500/30">
            <Head title="LetConnect VPN" />

            {/* Glowing background orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div
                    style={{ y: y1 }}
                    className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px]"
                />
                <motion.div
                    style={{ y: y2 }}
                    className="absolute top-[40%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[120px]"
                />
            </div>

            {/* Glassmorphism Navigation */}
            <nav className="fixed top-0 w-full z-50 flex justify-center pt-6 px-4">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-black/40 px-6 py-3 backdrop-blur-md shadow-2xl shadow-black/50"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
                            <Shield className="h-4 w-4" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">LetConnect</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link href={dashboard().url}>
                                <div className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer mr-2">
                                    Dashboard
                                </div>
                            </Link>
                        ) : null}

                        <a href="#download">
                            <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:scale-105 active:scale-95">
                                <Download className="h-4 w-4" />
                                <span>Get App</span>
                            </button>
                        </a>
                    </div>
                </motion.div>
            </nav>

            <main className="relative z-10 flex flex-col items-center px-4 pt-48 pb-24">

                {/* Hero Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex w-full max-w-5xl flex-col items-center text-center"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300 backdrop-blur-sm mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                        v2.0 is now available
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="mb-8 max-w-4xl text-6xl font-extrabold tracking-tighter sm:text-7xl md:text-8xl lg:text-[7rem] leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40"
                    >
                        The network that <br className="hidden md:block" /> never sleeps.
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="mb-12 max-w-2xl text-lg md:text-xl font-light text-slate-400"
                    >
                        Experience unparalleled privacy and blazing fast connection speeds. An advanced routing protocol engineered for the modern internet.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <a href="#download" className="w-full sm:w-auto">
                            <button className="group relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40">
                                <span>Download for Android</span>
                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </a>
                        <a href="#features" className="w-full sm:w-auto">
                            <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-8 py-4 text-base font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white backdrop-blur-sm">
                                Explore Features
                            </button>
                        </a>
                    </motion.div>

                    {/* Abstract Floating Visual */}
                    <motion.div
                        variants={itemVariants}
                        className="relative mt-24 w-full max-w-4xl aspect-[21/9] rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black flex items-center justify-center"
                    >
                        {/* Simulation of a glowing globe / network nodes */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                                opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 blur-[60px]"
                        ></motion.div>
                        <Globe className="relative z-20 h-24 w-24 text-white/80 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    </motion.div>
                </motion.div>

                {/* Bento Box Features Section */}
                <div id="features" className="w-full max-w-5xl mt-32">
                    <div className="mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need.</h2>
                        <p className="text-slate-400 text-lg max-w-2xl">A complete suite of privacy tools wrapped in a beautiful, minimal interface. No configuration required.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                whileHover={{ scale: 0.98 }}
                                className={`group relative overflow-hidden rounded-3xl border border-white/5 bg-[#111111] p-8 transition-colors hover:border-white/10 ${feature.size}`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}></div>

                                <div className="relative z-10 flex h-full flex-col">
                                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                        <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                                    </div>
                                    <h3 className="mb-3 text-2xl font-bold">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed max-w-sm">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* minimalist Stats */}
                <div className="w-full max-w-5xl mt-32 border-y border-white/10 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-4xl md:text-5xl font-bold text-white mb-2">50+</span>
                            <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Servers</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-4xl md:text-5xl font-bold text-white mb-2">20+</span>
                            <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Countries</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-4xl md:text-5xl font-bold text-white mb-2">&lt;50<span className="text-2xl text-slate-500">ms</span></span>
                            <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Latency</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</span>
                            <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Uptime</span>
                        </div>
                    </div>
                </div>

                {/* Final CTA Strip */}
                <div id="download" className="w-full max-w-3xl mt-32 bg-gradient-to-br from-slate-900 to-black rounded-3xl border border-white/10 p-12 text-center shadow-2xl relative overflow-hidden">
                    {/* decorative blur */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[conic-gradient(at_center,transparent_200deg,rgba(99,102,241,0.3)_360deg)] animate-spin-slow pointer-events-none" style={{ animationDuration: '8s' }}></div>
                    <div className="absolute inset-1 bg-black rounded-[calc(1.5rem-4px)] z-0"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to connect?</h2>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto">Get started in seconds. No credit card required. Download the app directly to your device.</p>

                        <button className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 font-semibold text-black transition-transform hover:scale-105">
                            <Smartphone className="h-5 w-5" />
                            <span>Download APK</span>
                        </button>
                    </div>
                </div>

                {/* Simple Footer */}
                <footer className="w-full max-w-5xl mt-32 flex flex-col md:flex-row items-center justify-between text-sm text-slate-600 border-t border-white/10 pt-8">
                    <p>© {new Date().getFullYear()} LetConnect. All rights reserved.</p>
                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
                        {!auth.user && (
                            <Link href={login().url} className="opacity-30 hover:opacity-100 transition-opacity">
                                Admin Console
                            </Link>
                        )}
                    </div>
                </footer>
            </main>
        </div>
    );
}
