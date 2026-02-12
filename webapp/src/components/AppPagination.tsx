'use client'

import {useEffect, useState} from "react";
import {useRouter} from "next/dist/client/components/navigation";
import {useSearchParams} from "next/navigation";
import {Button} from "@heroui/button";
import {Pagination} from "@heroui/pagination";

type Props = {
    totalCount: number
}

const PAGE_SIZE = [5, 10, 20];

export default function AppPagination({totalCount}: Props) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const router = useRouter();
    const searchParams = useSearchParams();
    const pageFromUrl = parseInt(searchParams.get('page') || '1');
    const pageSizeFromUrl = parseInt(searchParams.get('pageSize') || '5');
    
    useEffect(() => {
        if (pageFromUrl === currentPage && pageSizeFromUrl === pageSize) {
            return;
        }
        const params = new URLSearchParams(searchParams);
        params.set('page', currentPage.toString());
        params.set('pageSize', pageSize.toString());
        router.push(`?${params.toString()}`, {scroll: false});
    }, [currentPage, pageSize])
    
    return (
        <div className='flex justify-between items-center pt-3 pb-6 px-6'>
            <div className='flex items-center gap-2'>
                <span>Page size: </span>
                <div className='flex items-center gap-1'>

                    {PAGE_SIZE.map((size, i) => (
                        <Button
                            key={i}
                            type='button'
                            variant={size === pageSize ? 'solid' : 'bordered'}
                            isIconOnly
                            size='sm'
                            color='secondary'
                            onPress={() => {
                                setCurrentPage(1);
                                setPageSize(size);
                            }}
                        >
                            {size}
                        </Button>
                    ))}

                </div>
            </div>

            <Pagination
                color='secondary'
                page={currentPage}
                total={Math.ceil(totalCount / pageSize)}
                onChange={setCurrentPage}
                className='cursor-pointer'
            />
        </div>
    );
}