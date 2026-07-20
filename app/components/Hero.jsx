'use client';

import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const Hero = () => {
    const currency = '$'
    return (
        <div className='mt-10 mx-auto max-w-7xl flex justify-center items-center'>
            <Image src={"/off.webp"} alt='hero' width={900} height={450} className='rounded-lg' />
        </div>
    )
}

export default Hero