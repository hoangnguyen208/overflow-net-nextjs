'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'
import {Button} from "@heroui/button";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className='h-full flex items-center justify-center space-y-6'>
            <div className='flex flex-col items-center text-center gap-6'>
                <h1 className='text-5xl font-bold'>Something went wrong!</h1>
                <h3 className='text-3xl text-danger-600'>{error.message}</h3>
                <Button
                    color='primary'
                    onPress={
                        () => reset()
                    }
                >
                    Try again
                </Button>
            </div>
        </div>
    )
}