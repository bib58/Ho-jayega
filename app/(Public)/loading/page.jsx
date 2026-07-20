'use client'

import Loading from "../../components/Loading"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { checkoutClearCart } from "../../lib/features/cartSlice"

export default function LoadingPage() {
    const router = useRouter()
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(checkoutClearCart())
        
        const params = new URLSearchParams(window.location.search)
        const url = params.get('nextUrl')

        if (url) {
            setTimeout(() => {
                router.push(url)
            }, 8000)
        }
    }, [router, dispatch])

    return <Loading />
}
