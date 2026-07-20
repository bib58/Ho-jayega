'use client'
import { StarIcon } from 'lucide-react';
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ prod }) => {
    const currency = '$'
    const rating = Math.round(
        (prod.rating.reduce((acc, curr) => acc + curr.rating, 0) || 0) /
        (prod.rating.length || 1)
    );

    return (
        <Link href={`/product/${prod._id}`} className=' group max-xl:mx-auto border rounded-lg p-3 border-gray-400'>
            <img className='w-30 h-30 object-cover rounded-lg transition duration-300 group-hover:scale-105' src={prod.images[0].url} alt={prod.name} />
            <div className='flex justify-between gap-3 text-md text-slate-800 pt-2 max-w-60'>
                <div>
                    <p>{prod.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p>{currency}{prod.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard