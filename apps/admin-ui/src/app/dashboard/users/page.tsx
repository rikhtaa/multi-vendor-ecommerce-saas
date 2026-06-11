"use client"
import React, { useDeferredValue, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance'
import { Ban, Download, Search } from 'lucide-react'
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { saveAs } from "file-saver"

type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

type UserResponse = {
  data: User[]
  meta: {
    totalUsers: number
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
  const [roleFilter, setRoleFilter] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const deferredFilter = useDeferredValue(globalFilter)
  const limit = 10
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<UserResponse>({
    queryKey: ["users-list", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-users?page=${page}&limit=${limit}`
      )
      return res.data
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5
  })

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.put(`/admin/api/ban-user/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] })
      setIsModalOpen(false)
    }
  })

  const allUsers = data?.data || []

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user: any) => {
      const matchesSearch = Object.values(user)
        .join(" ")
        .toLowerCase()
        .includes(deferredFilter.toLowerCase())
      const matchesRole = roleFilter ? user.role === roleFilter : true
      return matchesSearch && matchesRole
    })
  }, [allUsers, deferredFilter, roleFilter])

  const totalPages = Math.ceil((data?.meta?.totalUsers ?? 0) / limit)

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => (
        <span className="text-white">{row.original.name}</span>
      )
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: any) => (
        <span className="text-gray-300">{row.original.email}</span>
      )
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }: any) => (
        <span className='uppercase font-semibold text-blue-400'>
          {row.original.role}  
        </span>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }: any) => (
        <span className='text-gray-400'>
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "Actions",
      cell: ({ row }: any) => (
        <button
          className='text-red-500 ml-3 text-sm text-center w-full'
          onClick={() => {
            setSelectedUser(row.original)
            setIsModalOpen(true)
          }}
          title="Ban User"
        >
          <Ban size={18} />
        </button>
      )
    }
  ], [])

  const exportCSV = () => {
    const csvData = filteredUsers.map(
      (user: any) =>
        `${user.name},${user.email},${user.role},${user.createdAt}`
    )
    const blob = new Blob(
      [`Name,Email,Role,Created At\n${csvData.join("\n")}`],
      { type: "text/csv;charset=utf-8" }
    )
    saveAs(blob, `users-page-${page}.csv`)
  }

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className='w-full min-h-screen p-8 bg-black text-white text-sm'>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className='text-xl font-bold tracking-wide'>All Users</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className='flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg'
          >
            <Download size={16} /> Export CSV
          </button>
          <select
            value={roleFilter}
            className="bg-gray-800 border border-gray-700 text-white outline-none rounded-md px-2 py-1"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>  
          </select>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="mb-4">
        <BreadCrumbs title="All Users" />  
      </div>

      {/* SearchBar */}
      <div className="flex items-center mb-4 bg-gray-900 p-2 rounded-md">
        <Search size={18} className='text-gray-400 mr-2' />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white py-6">Loading users...</p>
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

        {!isLoading && filteredUsers.length === 0 && (
          <p className="text-center py-6 text-gray-400">No users found!</p>
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

      {/* Ban Confirmation Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-[#1e293b] rounded-2xl shadow-lg w-[90%] max-w-md p-6 relative">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-white text-lg font-semibold">Ban User</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 leading-6">
                <span className="text-yellow-400 font-semibold">⚠ Important:{" "}</span>
                Are you sure you want to ban{" "}
                <span className="text-red-400 font-medium">
                  {selectedUser.name}
                </span>
                ? This action can be reverted later.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => banUserMutation.mutate(selectedUser.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-sm text-white rounded flex items-center gap-2"
              >
                <Ban size={16} /> Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage