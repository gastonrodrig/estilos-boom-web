"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, LayoutDashboard, Package, Store, Spool, ShoppingBag, BookText, NotepadText, Banknote, Contact, Eye, Users, ShieldCheck, ClipboardList, Factory, ArrowLeftRight, Warehouse, Boxes, Truck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/hooks";
import { Logo } from "@/components/atoms";

interface SidebarItem {
    label: string;
    href?: string;
    icon?: string;
    badge?: number;
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
    const [isCollapsed, setIsCollapsed] = useState(false);
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
        if (isCollapsed) {
            setIsCollapsed(false);
            setOpenSections((prev) => ({
                ...prev,
                [label]: true,
            }));
        } else {
            setOpenSections((prev) => ({
                ...prev,
                [label]: !prev[label],
            }));
        }
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        setShowSidebar(mediaQuery.matches);
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
        const isOpen = isCollapsed ? false : (openSections[item.label] ?? hasActiveChild);

        const filteredChildren = item.children?.filter(child => !child.requiredRoles || (role && child.requiredRoles.includes(role)));
        const hasVisibleChildren = filteredChildren && filteredChildren.length > 0;

        if (hasVisibleChildren) {
            return (
                <div className="flex flex-col">
                    <button
                        onClick={() => handleToggleSection(item.label)}
                        className={`group flex items-center w-full cursor-pointer text-[10px] font-semibold tracking-widest uppercase text-[#8B3A52] dark:text-[#c4a0ae]/55 px-3 mb-1 mt-4 transition-colors hover:opacity-80 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                        title={isCollapsed ? item.label : undefined}
                    >
                        <span className={`flex items-center min-w-0 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
                            {ItemIcon ? <ItemIcon className="w-4 h-4 flex-shrink-0 text-[#8B3A52]/50 dark:text-[#a06878]/80 group-hover:text-[#8B3A52]/70" strokeWidth={1.5} style={{ marginRight: isCollapsed ? '0' : '10px' }} /> : null}
                            {!isCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                        </span>
                        {!isCollapsed && <ChevronDown strokeWidth={2} className={`w-3 h-3 flex-shrink-0 text-[#8B3A52]/50 dark:text-[#a06878]/80 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />}
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden flex flex-col space-y-0.5 mt-1 mb-1"
                            >
                                {filteredChildren.map(child => (
                                    <div key={child.label}>{renderItem(child, depth + 1)}</div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        }

        if (!item.href) {
            return (
                <div
                    className={`flex items-center overflow-hidden rounded-md mx-2 ${isCollapsed ? 'justify-center py-2.5' : 'justify-start px-3 py-1.5'} text-[#b89aaa] dark:text-zinc-600 opacity-100 cursor-default`}
                    title={isCollapsed ? item.label : undefined}
                >
                    {ItemIcon && (
                        <ItemIcon strokeWidth={1.5} className="w-4 h-4 flex-shrink-0 text-[#b89aaa] dark:text-zinc-600" style={{ marginRight: isCollapsed ? '0' : '10px' }} />
                    )}
                    {!isCollapsed && (
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="block min-w-0 flex-1">
                            {item.label}
                        </span>
                    )}
                </div>
            );
        }

        const isMainItem = depth === 0;

        return (
            <Link
                href={item.href || "#"}
                className={`relative group flex items-center transition-all duration-200 overflow-hidden rounded-md mx-2 ${isCollapsed ? 'justify-center py-2.5' : `justify-start py-1.5 ${depth > 0 ? 'pl-8 pr-3' : 'px-3'}`}
                    ${isItemActive
                        ? "bg-[#8B3A52]/12 dark:bg-[#8B3A52]/30 text-[#8B3A52] dark:text-[#f4c2cc] text-sm font-medium border-l-2 border-l-[#8B3A52] border-y-transparent border-r-transparent"
                        : "text-sm font-normal border-l-2 border-transparent text-[#4a3540] dark:text-[#d4b0be] hover:text-[#8B3A52] dark:hover:text-[#f4c2cc] hover:bg-[#8B3A52]/8 dark:hover:bg-[#8B3A52]/15"
                    }
                `}
                title={isCollapsed ? item.label : undefined}
            >
                {ItemIcon ? (
                    <ItemIcon 
                        strokeWidth={isItemActive ? 2 : 1.5} 
                        className={`w-4 h-4 flex-shrink-0 ${isItemActive ? 'text-[#8B3A52] dark:text-[#f4c2cc]' : 'text-[#b89aaa] dark:text-[#a06878] group-hover:text-[#8B3A52] dark:group-hover:text-[#f4c2cc]'}`}
                        style={{ marginRight: isCollapsed ? '0' : '10px' }}
                    />
                ) : null}
                {!isCollapsed && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="block min-w-0 flex-1">
                        {item.label}
                    </span>
                )}
                {!isCollapsed && item.badge && item.badge > 0 ? (
                    <span className="ml-auto shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D6405F] text-white text-[10px] font-bold flex items-center justify-center">
                        {item.badge > 99 ? '99+' : item.badge}
                    </span>
                ) : null}
                {isCollapsed && item.badge && item.badge > 0 ? (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D6405F]" />
                ) : null}
            </Link>
        );
    };

    return (
        <AnimatePresence>
            {showSidebar && (
                <>
                    <style>{`
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                        .no-scrollbar {
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                        }
                    `}</style>
                    {/* Placeholder para mantener el layout intacto al hacer el aside fixed */}
                    <div className={`transition-[width] duration-300 flex-shrink-0 ${isCollapsed ? 'w-20' : 'w-[260px]'}`} />
                    <motion.aside
                        initial={{ x: -24, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -24, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`bg-[#fdf6f0] dark:bg-[#130b11] border-r border-[#e8d5c4] dark:border-[#3d1f2d]/60 py-4 fixed top-0 left-0 h-[100vh] z-40 flex flex-col transition-all duration-[600ms] ${isCollapsed ? 'w-20' : 'w-[260px]'}`}
                    >
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute top-4 -right-4 w-8 h-8 bg-white dark:bg-[#1f0f1a] border border-[#e8d5c4] dark:border-[#3d1f2d]/60 rounded-full flex items-center justify-center text-[#8B3A52] dark:text-[#c4a0ae] hover:bg-[#fdf6f0] dark:hover:bg-[#2d1420] hover:scale-105 transition-all z-50 shadow-sm cursor-pointer"
                        title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
                    >
                        {isCollapsed ? <ChevronRight strokeWidth={2} className="w-4 h-4 ml-0.5" /> : <ChevronLeft strokeWidth={2} className="w-4 h-4 pr-0.5" />}
                    </button>
                    <nav className="flex flex-col gap-1 flex-1 overflow-y-auto no-scrollbar">
                        <div className="flex items-center justify-center pt-5 pb-4 border-b border-[#e8d5c4] dark:border-[#3d1f2d]/60 mb-2">
                            <Link href="/">
                                <Logo width={isCollapsed ? 40 : 160} height={isCollapsed ? 40 : 36} isHome={false} iconOnly={isCollapsed} />
                            </Link>
                        </div>
                        {items.map((item, index) => {
                            const rendered = renderItem(item);
                            if (!rendered) return null;
                            return (
                                <div key={item.label}>
                                    {rendered}
                                    {index < items.length - 1 && <div className="border-t border-[#e8d5c4]/60 dark:border-[#3d1f2d]/40 mt-4 mb-2" />}
                                </div>
                            );
                        })}
                    </nav>
                </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}