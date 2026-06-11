"use client"
import React, { useEffect } from 'react'
import useSidebar from '../../../hooks/useSidebar'
import { usePathname } from 'next/navigation'
import useAdmin from 'apps/admin-ui/src/hooks/useAdmin'
import Box from '../box'
import { Sidebar } from './sidebar.styles'
import Link from 'next/link'
import { BellPlus, BellRing, CreditCard, FileClock, Home, ListOrdered, LogOut, PackageSearch, PencilRuler, Settings, Store, User, Users } from 'lucide-react'
import SidebarItem from './sidebar.item'
import SidebarMenu from './sidebar.menu'

const SidebarWrapper = () => {
    const [activeSidebar, setActiveSidebar] = useSidebar()
    const pathName = usePathname()
    const { admin } = useAdmin()

    useEffect(()=> {
        setActiveSidebar(pathName)
    }, [pathName, setActiveSidebar])

    const getIconColor = (route: string) =>
        activeSidebar === route ? "#0085ff" : "#969696"

    return (
        <Box
            css={{
                height: "100vh",
                zIndex: 202,
                position: "sticky",
                padding: "8px",
                top: "0",
                overflowY: "scroll",
                scrollbarWidth: "none",
            }}
            className="sidebar-wrapper"
        >
            <Sidebar.Header>
                <Box>
                    <Link href={"/"} className="flex justify-center text-center gap-2">
                        {/* <Logo /> */}
                        Logo
                        <Box>
                            <h3 className="text-xl font-medium text-[#ecedee]">
                                {admin?.name}
                            </h3>
                            <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-normal">
                                {admin?.email}
                            </h5>
                        </Box>
                    </Link>
                </Box>
            </Sidebar.Header>

            <div className="block my-3 h-full">
                <Sidebar.Body className="body sidebar">
                    <SidebarItem
                        title='Dashboard'
                        icon={<Home color={getIconColor("/dashboard")} />}
                        isActive={activeSidebar === "/dashboard"}
                        href="/dashboard"
                    />
                    <div className="mt-2 block">
                        <SidebarMenu title="Main Menu">
                            <SidebarItem
                                title="Orders"
                                href="/dashboard/orders"
                                icon={
                                    <ListOrdered
                                        size={26}
                                        color={getIconColor("/dashboard/orders")}
                                    />
                                }
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/payments"}
                                title='Payments'
                                icon={<CreditCard size={22}  color={getIconColor("/dashboard/payments")} />}
                                href="/dashboard/payments"
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/products"}
                                title='Products'
                                icon={<PackageSearch size={22} color={getIconColor("/dashboard/products")} />}
                                href="/dashboard/products"
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/events"}
                                title='Events'
                                icon={<BellPlus size={24} color={getIconColor("/dashboard/events")} />}
                                href="/dashboard/events"
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/users"}
                                title='Users'
                                icon={<Users size={24} color={getIconColor("/dashboard/users")} />}
                                href="/dashboard/users"
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/sellers"}
                                title='Sellers'
                                icon={<Store size={22} color={getIconColor("/dashboard/sellers")} />}
                                href="/dashboard/sellers"
                            />
                        </SidebarMenu>
                        <SidebarMenu title="Controllers">
                            <SidebarItem
                                title="Loggers"
                                href="/dashboard/loggers"
                                icon={
                                    <FileClock
                                        size={22}
                                        color={getIconColor("/dashboard/loggers")}
                                    />
                                }
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/management"}
                                title='Management'
                                icon={<Settings size={22} color={getIconColor("/dashboard/management")} />}
                                href="/dashboard/management"
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/notifications"}
                                title='Notifications'
                                icon={<BellRing size={24} color={getIconColor("/dashboard/notifications")} />}
                                href="/dashboard/notifications"
                            />
                        </SidebarMenu>
                        <SidebarMenu title="Customization">
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/customization"}
                                title="All Customization"
                                href="/dashboard/customization"
                                icon={
                                    <PencilRuler
                                        size={22}
                                        color={getIconColor("/dashboard/customization")}
                                    />
                                }
                            />
                        </SidebarMenu>
                        <SidebarMenu title="Extras">
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/logout"}
                                title="Logout"
                                href="/dashboard/logout"
                                icon={
                                    <LogOut
                                        size={20}
                                        color={getIconColor("/dashboard/logout")}
                                    />
                                }
                            />
                        </SidebarMenu>
                    </div>
                </Sidebar.Body>
            </div>
        </Box>
    )
}

export default SidebarWrapper