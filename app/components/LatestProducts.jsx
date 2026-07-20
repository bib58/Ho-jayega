'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useSelector } from 'react-redux';

const LatestProducts = () => {
    const displayQuantity = 8;
    const products = useSelector(state => state.product.list);

    return (
        <div className='px-6 my-6 max-w-6xl mx-auto'>
            <div className='flex flex-col items-center'>
                <h2 className='text-3xl font-semibold text-slate-800'>Latest Products</h2>

                <div className='flex items-center gap-4 mt-2'>
                    <p className='text-[16px] text-slate-600'>Showing {Math.min(products.length, displayQuantity)} of {products.length} products
                    </p>

                    <Link href='/products' className='text-green-500 flex items-center gap-1 hover:text-green-600'>View more<ArrowRight size={14} /></Link>
                </div>
            </div>

            <div className='mt-12 flex flex-wrap gap-8'>
                {products
                    .slice()
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, displayQuantity)
                    .map((product, index) => (
                        <ProductCard key={index} prod={product} />
                    ))}
            </div>
        </div>
    );
};

export default LatestProducts;