'use client'

import { Star } from 'lucide-react';
import React, { useState } from 'react'
import { XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';
import { useDispatch } from 'react-redux';
import { addRating } from '../lib/features/ratingSlice';
import axios from 'axios';

const RatingModal = ({ ratingModal, setRatingModal }) => {

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const { getToken } = useAuth();
    const dispatch = useDispatch();

    const handleSubmit = async () => {
        if (rating <= 0 || rating > 5) {
            throw new Error('Please select a rating');
        }
        if (review.trim().length < 5) {
            throw new Error('Please write a short review (at least 5 characters)');
        }

        const token = await getToken();
        const { data } = await axios.post('/api/rating', {
            rating,
            review: review.trim(),
            productId: ratingModal.productId,
            orderId: ratingModal.orderId
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        dispatch(addRating(data.rating));
        setRatingModal(null);
        return data;
    }

    return (
        <div className='fixed inset-0 z-120 flex items-center justify-center bg-black/10'>
            <div className='bg-white p-8 rounded-lg shadow-lg w-96 relative'>
                <button onClick={() => setRatingModal(null)} className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'>
                    <XIcon size={20} />
                </button>
                <h2 className='text-xl font-medium text-slate-600 mb-4'>Rate Product</h2>
                <div className='flex items-center justify-center mb-4'>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`size-8 cursor-pointer ${rating > i ? "text-green-400 fill-current" : "text-gray-300"}`}
                            onClick={() => setRating(i + 1)}
                        />
                    ))}
                </div>
                <textarea
                    className='w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-400'
                    placeholder='Write your review (at least 5 characters)'
                    rows='4'
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                ></textarea>
                <button onClick={() => toast.promise(handleSubmit(), {
                    loading: 'Submitting...',
                    success: 'Rating submitted successfully!',
                    error: (err) => err.response?.data?.message || err.message || 'Failed to submit rating'
                })} className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition'>
                    Submit Rating
                </button>
            </div>
        </div>
    )
}

export default RatingModal