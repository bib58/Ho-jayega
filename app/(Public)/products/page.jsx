'use client';

import ProductCard from "../../components/ProductCard"
import { useSelector } from "react-redux"
import Title from "../../components/Title"

export default function ProductsContent() {
    const products = useSelector(state => state.product.list)

    return (
        <div className="min-h-[70vh] mx-6 mt-3">
            <div className="max-w-7xl mx-auto">
                <Title title='All Products' description={`Showing ${products.length} products`} href='/products' />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8 mt-12 mb-32">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <ProductCard key={product._id || product.id} prod={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <p className="text-slate-500 text-lg">No products available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
