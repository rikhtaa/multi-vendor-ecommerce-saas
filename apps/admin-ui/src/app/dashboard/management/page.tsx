"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCoreRowModel, useReactTable, flexRender } from "@tanstack/react-table"
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance"
import { useState } from "react"

const BreadCrumbs = ({ title }: { title: string }) => (
    <nav className="text-gray-400 text-sm">
        <span>Dashboard</span> / <span className="text-white">{title}</span>
    </nav>
)

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" }
]

const Page = () => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [selectedRole, setSelectedRole] = useState("user")

    const queryClient = useQueryClient()

    const { data, isLoading, isError } = useQuery({
        queryKey: ["admins"],
        queryFn: async () => {
            const res = await axiosInstance.get("/admin/api/get-all-admins")
            return res.data.admins || []
        },
    })

    const { mutate: updateRole, isPending: updating } = useMutation({
        mutationFn: async () => {
            return await axiosInstance.put("/admin/api/add-new-admin", {
                email: search,
                role: selectedRole
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admins"] })
            setOpen(false)
            setSearch("")
            setSelectedRole("user")
        },
        onError: (err) => {
            console.error("Role update failed", err)
        }
    })

    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const handleSubmit = (e: any) => {
        e.preventDefault()
        updateRole()
    }

    return (
        <div className='w-full min-h-screen p-8 bg-black text-white text-sm'>
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <h2 className='text-xl font-bold tracking-wide'>Team Management</h2>
                <button
                    onClick={() => setOpen(true)}
                    className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded'
                >
                   Add Admin
                </button>
            </div>

            {/* Breadcrumbs */}
            <div className="mb-4">
               <BreadCrumbs title="Team Management" />
            </div>

            {/* Table Container */}
            <div className="overflow-hidden shadow-xl border border-slate-700 !rounded">
                <table className="min-w-full text-left">
                    <thead className="bg-slate-900 text-slate-300">
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
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-slate-400">
                                    Loading ...
                                </td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-red-500">
                                    Failed to load admins.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-t border-slate-700 hover:bg-slate-800 transition"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="p-3">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Overlay / Form (from screenshots 3, 4, 5, 6) */}
            {open && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
                    <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md relative">
                        <button
                            className="absolute top-3 right-4 text-slate-400 hover:text-white"
                            onClick={() => setOpen(false)}
                        >
                            &times;
                        </button>
                        
                        <h3 className="text-lg font-semibold mb-4">Add New Admin</h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1 text-slate-300">Email</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="support@becodemy.com"
                                    className="w-full px-3 py-2 outline-none bg-slate-800 text-white border border-slate-600 rounded"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-slate-300">Role</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded outline-none"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-8 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="w-full bg-slate-700 text-white px-4 py-2 !rounded hover:bg-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="w-full bg-blue-600 text-white px-4 py-2 !rounded hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {updating ? "Updating..." : "Add Admin"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Page