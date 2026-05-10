"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, LayoutDashboard, Package, Store, ShoppingBag, BookText, Banknote, Contact, Eye, Users, ShieldCheck, ClipboardList, Factory } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/hooks";

interface SidebarItem {
    label: string;
    href?: string;
    icon?: string;
    requiredPermission?: string;
    children?: SidebarItem[];
}

interface SidebarProps {
    items: SidebarItem[];
    hasTopBar?: boolean;
}

const iconMap = {
    dashboard: LayoutDashboard,
    package: Package,
    store: Store,
    "shopping-bag": ShoppingBag,
    booktext: BookText,
    banknote: Banknote,
    contact: Contact,
    eye: Eye,
    users: Users,
    permissions: ShieldCheck,
    "clipboard-list": ClipboardList,
    factory: Factory,
} as const;

export function Sidebar({ items, hasTopBar = false }: SidebarProps) {
    const pathname = usePathname();
    const { permissions } = useAuthStore();
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    const [showSidebar, setShowSidebar] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(min-width: 1024px)").matches;
    });

    const sidebarTopClass = hasTopBar ? "top-[100px]" : "top-16";
    const sidebarHeightClass = hasTopBar ? "h-[calc(100dvh-100px)]" : "h-[calc(100dvh-64px)]";

    const isPathActive = (href: string) => {
        return pathname === href;
    };

    const checkActiveRecursive = (item: SidebarItem): boolean => {
        if (item.href && isPathActive(item.href)) return true;
        if (item.children) {
            return item.children.some(child => checkActiveRecursive(child));
        }
        return false;
    };

    const handleToggleSection = (label: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        const handleChange = (event: MediaQueryListEvent) => setShowSidebar(event.matches);
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const renderItem = (item: SidebarItem, depth = 0) => {
        if (item.requiredPermission && !permissions.includes(item.requiredPermission)) {
            return null;
        }

        const ItemIcon = item.icon && item.icon in iconMap ? iconMap[item.icon as keyof typeof iconMap] : null;

        // Determina si el item actual o alguno de sus hijos está activo
        const isItemActive = item.href ? isPathActive(item.href) : false;
        const hasActiveChild = item.children ? item.children.some(child => checkActiveRecursive(child)) : false;

        // Si tiene hijos activos, la sección debe estar abierta por defecto
        const isOpen = openSections[item.label] ?? hasActiveChild;

        const filteredChildren = item.children?.filter(child => !child.requiredPermission || permissions.includes(child.requiredPermission));
        const hasVisibleChildren = filteredChildren && filteredChildren.length > 0;

        if (hasVisibleChildren) {
            return (
                <div key={item.label}>
                    <button
                        onClick={() => handleToggleSection(item.label)}
                        className={`group flex items-center justify-between w-full px-3 py-2.5 
                            rounded-lg transition-all duration-200 hover:cursor-pointer
                            ${hasActiveChild ? "font-medium text-[#5B283A] bg-white shadow-sm" : "font-normal text-gray-900"}
                            hover:bg-white hover:shadow-sm hover:text-[#5B283A]`}
                    >
                        <span className={`flex items-center gap-2.5 ${depth === 0 ? "text-[15px]" : "text-[14px]"} ${ItemIcon || depth > 0 ? "" : "pl-7"}`}>
                            {ItemIcon ? <ItemIcon className="w-4.5 h-4.5 shrink-0" /> : null}
                            <span className={depth === 0 ? "whitespace-nowrap" : "whitespace-normal leading-tight"}>
                                {item.label}
                            </span>
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="ml-4 mt-1 border-l-2 border-[#d8bcc6] pl-2 flex flex-col gap-1">
                                    {filteredChildren.map(child => renderItem(child, depth + 1))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        }

        if (!item.href) return null;

        return (
            <Link
                key={item.label + (item.href || "")}
                href={item.href || "#"}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200
                    ${depth === 0 ? "text-[15px] py-2.5" : "text-[14px] py-2"}
                    ${isItemActive ? "font-medium text-[#5B283A] bg-white shadow-sm" : "font-normal text-gray-900"}
                    hover:bg-white hover:shadow-sm hover:text-[#5B283A]`}
            >
                {ItemIcon ? <ItemIcon className="w-4.5 h-4.5 shrink-0" /> : null}
                <span className={depth === 0 ? "whitespace-nowrap" : "whitespace-normal leading-tight"}>
                    {item.label}
                </span>
            </Link>
        );
    };

    return (
        <AnimatePresence>
            {showSidebar && (
                <motion.aside
                    initial={{ x: -24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -24, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`w-72 bg-[#F6F7F9] p-3 sticky ${sidebarTopClass} ${sidebarHeightClass} rounded-r-2xl border-r border-white/70 overflow-y-auto custom-scrollbar`}
                >
                    <nav className="space-y-1">
                        {items.map(item => renderItem(item))}
                    </nav>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}