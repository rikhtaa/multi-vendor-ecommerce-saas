"use client"

import React, { useDeferredValue, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance"
import { Download, Search } from "lucide-react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table"
import { saveAs } from "file-saver"
import Image from "next/image"

type Seller = {
  id: string
  name: string
  email: string
  createdAt: string
  shop: {
    name: string
    avatar: string
    address: string
  }
}

type SellersResponse = {
  data: Seller[]
  meta: {
    totalSellers: number
    currentPage: number
    totalPages: number
  }
}

const BreadCrumbs = ({ title }: { title: string }) => (
  <nav className="text-gray-400 text-sm">
    <span>Dashboard</span> / <span className="text-white">{title}</span>
  </nav>
)

const UsersPage = () => {
  const [globalFilter, setGlobalFilter] = useState("")
  const [page, setPage] = useState(1)

  const deferredGlobalFilter = useDeferredValue(globalFilter)
  const limit = 10

  const { data, isLoading } = useQuery<SellersResponse>({
    queryKey: ["sellers-list", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-sellers?page=${page}&limit=${limit}`
      )

      return res.data
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  })

  const allSellers = data?.data || []

  const filteredSellers = useMemo(() => {
    return allSellers.filter((seller) =>
      deferredGlobalFilter
        ? Object.values(seller)
            .map((value) =>
              typeof value === "string" ? value : JSON.stringify(value)
            )
            .join(" ")
            .toLowerCase()
            .includes(deferredGlobalFilter.toLowerCase())
        : true
    )
  }, [allSellers, deferredGlobalFilter])

  const totalPages = Math.ceil(
    (data?.meta?.totalSellers ?? 0) / limit
  )

  const columns = useMemo(
    () => [
      {
        accessorKey: "shop.avatar",
        header: "Avatar",
        cell: ({ row }: any) => (
          <Image
            src={row.original.shop?.avatar || "/placeholder.png"}
            alt={row.original.name}
            width={40}
            height={40}
            className="rounded-full w-10 h-10 object-cover"
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "shop.name",
        header: "Shop Name",
        cell: ({ row }: any) => {
          const shopName = row.original.shop?.name

          return shopName ? (
            <a
              className="text-blue-400 hover:underline"
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/shop/${row.original.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shopName}
            </a>
          ) : (
            <span className="text-gray-400 italic">
              No Shop
            </span>
          )
        },
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }: any) => (
          <span className="text-gray-400">
            {new Date(
              row.original.createdAt
            ).toLocaleDateString()}
          </span>
        ),
      },
    ],
    []
  )

  const exportCSV = () => {
    const csvData = filteredSellers.map(
      (seller) =>
        `${seller.name},${seller.email},${seller.shop?.name || "No Shop"},${seller.createdAt}`
    )

    const blob = new Blob(
      [`Name,Email,Shop,Created At\n${csvData.join("\n")}`],
      {
        type: "text/csv;charset=utf-8",
      }
    )

    saveAs(blob, `sellers-page-${page}.csv`)
  }

  const table = useReactTable({
    data: filteredSellers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    globalFilterFn: "includesString",
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold tracking-wide">
          All Sellers
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-4">
        <BreadCrumbs title="All Sellers" />
      </div>

      <div className="flex items-center mb-4 bg-gray-900 p-2 rounded-md">
        <Search
          size={18}
          className="text-gray-400 mr-2"
        />

        <input
          type="text"
          placeholder="Search sellers..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) =>
            setGlobalFilter(e.target.value)
          }
        />
      </div>

      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white py-6">
            Loading sellers...
          </p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table
                .getHeaderGroups()
                .map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-gray-800"
                  >
                    {headerGroup.headers.map(
                      (header) => (
                        <th
                          key={header.id}
                          className="p-3 text-left text-sm text-gray-400 font-medium"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef
                                  .header,
                                header.getContext()
                              )}
                        </th>
                      )
                    )}
                  </tr>
                ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  {row
                    .getVisibleCells()
                    .map((cell) => (
                      <td
                        key={cell.id}
                        className="p-3"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading &&
          filteredSellers.length === 0 && (
            <p className="text-center py-6 text-gray-400">
              No sellers found!
            </p>
          )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() =>
            setPage((p) => Math.max(p - 1, 1))
          }
          disabled={page === 1}
          className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600 transition"
        >
          Previous
        </button>

        <span className="text-white text-sm">
          Page {page} of {totalPages || 1}
        </span>

        <button
          onClick={() =>
            setPage((p) =>
              Math.min(p + 1, totalPages)
            )
          }
          disabled={
            page === totalPages || totalPages === 0
          }
          className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600 transition"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default UsersPage