"use client"
import React, { useDeferredValue, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Download, Eye, Search, Star } from 'lucide-react'
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { saveAs } from "file-saver";

const Page = () => {
    const [globalFilter, setGlobalFilter] = useState("")
    const deferredFilter = useDeferredValue(globalFilter)
    const [page, setPage] = useState(1)
    const limit = 10

    const { data, isLoading } = useQuery<any>({
        queryKey: ["events-list", page],
        queryFn: async () => {
            const res = await axiosInstance.get(
                `/admin/api/get-all-events?page=${page}&limit=${limit}`
            )
            return res.data
        },
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60 * 5
    })

    const allEvents = data?.data || []

    const filteredProducts = useMemo(() => {
        return allEvents.filter((product: any) => {
            return Object.values(product)
                .join(" ")
                .toLowerCase()
                .includes(deferredFilter.toLowerCase())
        })
    }, [allEvents, deferredFilter])

    const totalPages = Math.ceil((data?.meta?.totalEvents ?? 0) / limit)

    const columns = useMemo(() => [
        {
            accessorKey: "image",
            header: "Image",
            cell: ({ row }: any) => (
                <Image
                    src={row.original.images[0]?.url || "/placeholder.png"}
                    alt={row.original.title}
                    width={48}
                    height={48}
                    className='w-10 h-10 rounded object-cover'
                />
            )
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }: any) => {
                <Link
                    href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                    className='hover:text-blue-500 hover:border-b'
                >
                    {row.original.title}
                </Link>
            }
        },
        {
            accessorKey: "sale_price",
            header: "Price",
            cell: ({ row }: any) => `$${row.original.sale_price}`
        },
        {
            accessorKey: "stock",
            header: "Stock"
        },
        {
            accessorKey: "starting_date",
            header: "Start",
            cell: ({ row }: any) =>
                new Date(row.original.starting_date).toLocaleDateString()
        },
        {
            accessorKey: "ending_date",
            header: "End",
            cell: ({ row }: any) =>
                new Date(row.original.ending_date).toLocaleDateString()
        },
        {
            accessorKey: "Shop.name",
            header: "Shop Name",
            cell: ({ row }: any) => row.original.Shop?.name || "-"
        },

    ], [])

const exportCSV = () => {
    const csvData = filteredProducts.map(
        (p: any) =>
            `${p.title},${p.sale_price},${p.stock},${p.starting_date},${p.ending_date},${p.Shop.name}`
    );
    const blob = new Blob(
        [
            `Title,Price,Stock,Start Date,End Date,Shop\n${csvData.join("\n")}`,
        ],
        { type: "text/csv;charset=utf-8" }
    );
    saveAs(blob, `products-page-${page}.csv`);
};

const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
})

return (
    <div className='w-full min-h-screen p-8  bg-black text-white text-sm'>
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
            <h2 className='text-xl font-bold tracking-wide'>All Events</h2>
            <button
                onClick={exportCSV}
                className='flex justify-between gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg'
            >
                <Download size={16} /> Export CSV
            </button>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center mb-4">
            <Link href="/dashboard" className='text-blue-400 cursor-pointer'>
                Dashboard
            </Link>
            <ChevronRight size={20} className='text-gray-200' />
            <span className="text-white">All Events</span>
        </div>

        {/* SearchBar */}
        <div className="flex items-center mb-4 bg-gray-900 p-2 rounded-md">
            <Search size={18} className='text-gray-400 mr-2' />
            <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-transparent text-white outline-none"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
            />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
            {isLoading ? (
                <p className="text-center text-white py-6">Loading events...</p>
            ) : (
                <table className="w-full text-white">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="border-b border-gray-800">
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="p-3 text-left text-sm text-gray-400 font-medium">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b border-gray-800 hover:bg-gray-800 transition"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-3">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {!isLoading && filteredProducts.length === 0 && (
                <p className="text-center py-6 text-gray-400">No events found!</p>
            )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
            <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600 transition"
            >
                Previous
            </button>
            <span className="text-white text-sm">
                Page {page} of {totalPages || 1}
            </span>
            <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || totalPages === 0}
                className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600 transition"
            >
                Next
            </button>
        </div>
    </div>
)
}

export default Page