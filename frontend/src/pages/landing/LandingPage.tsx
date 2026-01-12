import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Hero from './Hero';
import TrustedPartners from './TrustedPartners';
import Features from './Features';
import Footer from './Footer';
import styles from './styles/LandingPage.module.css';

// লোগোর শুরুর পজিশন (Center & Big)
const initialLogoPosition = {
    top: '50%',
    left: '50%',
    x: '-50%',
    y: '-50%',
    position: 'fixed' as const,
    height: window.innerWidth < 768 ? '180px' : '350px', // শুরুতে লোগো বড় থাকবে (মোবাইলে কিছুটা ছোট)
    zIndex: 2000,
};

// লোগোর শেষের পজিশন (Top-Left & Small)
const getTargetPosition = (animate: boolean) => {
    if (!animate) return {};
    const isMobile = window.innerWidth < 768;
    return {
        top: isMobile ? '7px' : '15px',     // Navbar এর উচ্চতা অনুযায়ী ফাইনাল পজিশন
        left: isMobile ? '15px' : '5%',      // Navbar এর প্যাডিং অনুযায়ী
        x: '0%',
        y: isMobile ? '-10%' : '-15%',
        height: isMobile ? '35px' : '60px',  // Navbar এর লোগো সাইজ
    };
};

export default function LandingPage() {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // ৫ সেকেন্ড পর অ্যানিমেশন শুরু হবে
        const timer = setTimeout(() => {
            setAnimate(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={styles.container}>
            {/* Logo 1: শুরুতে দেখা যাবে, মুভ করার সময় Fade Out হবে */}
            <motion.img
                src="/logo1.png"
                alt="HealthSync Logo Start"
                className={styles.floatingLogo}
                // ইনিশিয়াল: মাঝখানে এবং পুরোপুরি দৃশ্যমান (Opacity 1)
                initial={{ ...initialLogoPosition, opacity: 1 }}
                // অ্যানিমেশন: পজিশন বদলাবে এবং অদৃশ্য হয়ে যাবে (Opacity 0)
                animate={{
                    ...getTargetPosition(animate),
                    opacity: animate ? 0 : 1
                }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                // অদৃশ্য হওয়ার পর যাতে ক্লিক না করা যায়
                style={{ pointerEvents: animate ? 'none' : 'auto' }}
            />

            {/* Logo 2: শুরুতে অদৃশ্য থাকবে, মুভ করার সময় Fade In হবে */}
            <motion.img
                src="/icon.png"
                alt="HealthSync Logo Final"
                className={styles.floatingLogo}
                // ইনিশিয়াল: মাঝখানে কিন্তু অদৃশ্য (Opacity 0)
                initial={{ ...initialLogoPosition, opacity: 0 }}
                // অ্যানিমেশন: পজিশন বদলাবে এবং দৃশ্যমান হবে (Opacity 1)
                animate={{
                    ...getTargetPosition(animate),
                    opacity: animate ? 1 : 0
                }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                // ক্লিক করলে উপরে স্ক্রল হবে (Navbar লোগোর কাজ)
                onClick={() => animate && window.scrollTo({ top: 0, behavior: 'smooth' })}
            />

            {/* Navbar স্লাইড করে নামবে */}
            <div className={`${styles.navbarWrapper} ${animate ? styles.navbarVisible : ''}`}>
                <Navbar showLogo={animate} /> {/* Navbar এর নিজস্ব লোগো লুকানো থাকবে */}
            </div>

            {/* বাকি কন্টেন্ট ফেড ইন হবে */}
            <div className={`${styles.contentWrapper} ${animate ? styles.contentVisible : ''}`}>
                <Hero />
                <TrustedPartners />
                <Features />
                <Footer />
            </div>
        </div>
    );
}