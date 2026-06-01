"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, LayoutDashboard, Package, Store, Spool, ShoppingBag, BookText, NotepadText, Banknote, Contact, Eye, Users, ShieldCheck, ClipboardList, Factory, ArrowLeftRight, Warehouse, Boxes, Truck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/hooks";

interface SidebarItem {
    label: string;
    href?: string;
    icon?: string;
    requiredRoles?: string[];
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
    spool: Spool,
    "notepad-text": NotepadText,
    "arrow-right-left": ArrowLeftRight,
    warehouse: Warehouse,
    inventory: Boxes,
    truck: Truck,
} as const;

export function Sidebar({ items, hasTopBar = false }: SidebarProps) {
    const pathname = usePathname();
    const { role } = useAuthStore();
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
        if (item.requiredRoles && role && !item.requiredRoles.includes(role)) {
            return null;
        }

        const ItemIcon = item.icon && item.icon in iconMap ? iconMap[item.icon as keyof typeof iconMap] : null;

        // Determina si el item actual o alguno de sus hijos está activo
        const isItemActive = item.href ? isPathActive(item.href) : false;
        const hasActiveChild = item.children ? item.children.some(child => checkActiveRecursive(child)) : false;

        // Si tiene hijos activos, la sección debe estar abierta por defecto
        const isOpen = openSections[item.label] ?? hasActiveChild;

        const filteredChildren = item.children?.filter(child => !child.requiredRoles || (role && child.requiredRoles.includes(role)));
        const hasVisibleChildren = filteredChildren && filteredChildren.length > 0;

        if (hasVisibleChildren) {
            return (
                <div key={item.label}>
                    <button
                        onClick={() => handleToggleSection(item.label)}
                        className={`group flex items-center justify-between w-full px-3 py-2.5
                            rounded-lg transition-colors duration-200 hover:cursor-pointer overflow-hidden
                            ${hasActiveChild ? "font-semibold text-white bg-[#5B283A]" : "font-medium text-[#C4A9B5]"}
                            hover:bg-[#3D2330] hover:text-white`}
                    >
                        <span className={`flex items-center gap-3 min-w-0 flex-1 ${depth === 0 ? "text-[14px]" : "text-[13px]"} ${!ItemIcon && depth === 0 ? "pl-6" : ""}`}>
                            {ItemIcon ? <ItemIcon strokeWidth={1.5} className="w-5 h-5 shrink-0" /> : null}
                            <span className="truncate leading-tight">
                                {item.label}
                            </span>
                        </span>
                        <ChevronDown strokeWidth={1.5} className={`w-4 h-4 shrink-0 text-[#A98495] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
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
                                <div className="ml-5 mt-1 border-l border-[#4A2E3B] pl-3 flex flex-col gap-0.5">
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
                className={`group flex items-center gap-3 px-3 rounded-lg transition-colors duration-200 overflow-hidden
                    ${depth === 0 ? "text-[14px] py-2.5" : "text-[13px] py-2"}
                    ${!ItemIcon && depth === 0 ? "pl-[2.375rem]" : ""}
                    ${isItemActive ? "font-semibold text-white bg-[#5B283A]" : "font-medium text-[#C4A9B5]"}
                    hover:bg-[#3D2330] hover:text-white`}
            >
                {ItemIcon ? <ItemIcon strokeWidth={1.5} className="w-5 h-5 shrink-0" /> : null}
                <span className="truncate leading-tight">
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
                    className={`w-72 bg-[#2A1620] p-4 sticky ${sidebarTopClass} ${sidebarHeightClass} border-r border-[#4A2E3B] overflow-y-auto custom-scrollbar`}
                >
                    <nav className="space-y-1">
                        {items.map(item => renderItem(item))}
                    </nav>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}