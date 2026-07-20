'use client'
import Hero from '../components/Hero';
import OurSpecs from "../components/OurSpec";
import LatestProducts from "../components/LatestProducts";

export default function Home() {
    return (
        <div>
            <Hero />
            <LatestProducts />
            <OurSpecs />
        </div>
    );
}