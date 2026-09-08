// src/pages/home/Home.tsx
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import HowItWorks from '@/components/HowItWorks';

import ToggleDark from '@/components/ToggleDark';
import MenuSection from '@/components/MenuSection';

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <main>
                <Hero />
                <AboutSection />
                <HowItWorks />
                <MenuSection />
            </main>
            {/* <div className="fixed top-4 right-4 z-50">
                <ToggleDark />
                </div> */}
        </div>
    );
}