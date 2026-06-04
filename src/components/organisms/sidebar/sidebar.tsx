"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, LayoutDashboard, Package, Store,Spool, ShoppingBag, BookText,NotepadText, Banknote, Contact, Eye, Users, ShieldCheck, ClipboardList, Factory, ArrowLeftRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/hooks";
import { Logo } from "@/components/atoms";

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
    spool: Spool,
    "notepad-text": NotepadText,
    "arrow-right-left": ArrowLeftRight,
} as const;

export function Sidebar({ items, hasTopBar = false }: SidebarProps) {
    const pathname = usePathname();
    const { permissions } = useAuthStore();
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
        const isOpen = isCollapsed ? false : (openSections[item.label] ?? hasActiveChild);

        const filteredChildren = item.children?.filter(child => !child.requiredPermission || permissions.includes(child.requiredPermission));
        const hasVisibleChildren = filteredChildren && filteredChildren.length > 0;

        if (hasVisibleChildren) {
            return (
                <div className="flex flex-col">
                    <button
                        onClick={() => handleToggleSection(item.label)}
                        className={`group flex items-center w-full transition-colors hover:text-[#8B3A52] dark:hover:text-[#ddc0c8] text-[#a05068] cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-between'} overflow-hidden`}
                        style={{
                            fontSize: '0.65rem',
                            letterSpacing: '0.1em',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: isCollapsed ? '16px 0 16px 0' : '16px 16px 6px'
                        }}
                        title={isCollapsed ? item.label : undefined}
                    >
                        <span className={`flex items-center min-w-0 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
                            {ItemIcon ? <ItemIcon className="text-[#a05068]" style={{ width: '16px', flexShrink: 0, marginRight: isCollapsed ? '0' : '10px' }} strokeWidth={2} /> : null}
                            {!isCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                        </span>
                        {!isCollapsed && <ChevronDown strokeWidth={2} className={`w-3 h-3 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />}
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden flex flex-col gap-1 mt-1 mb-1"
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

        if (!item.href) return null;

        const isMainItem = depth === 0;

        return (
            <Link
                href={item.href || "#"}
                className={`group flex items-center transition-all duration-200 overflow-hidden
                    ${isItemActive 
                        ? "bg-[rgba(139,58,82,0.1)] dark:bg-[rgba(196,96,127,0.2)] text-[#8B3A52] dark:text-[#ffffff] font-medium" 
                        : "hover:bg-[rgba(139,58,82,0.06)] dark:hover:bg-[rgba(255,255,255,0.05)] font-normal " + 
                          (isMainItem ? "text-[#40202D] dark:text-[#ddc0c8]" : "text-[#8C6B79] dark:text-[#a08088]")
                    }
                `}
                style={{
                    padding: isCollapsed ? '10px 0' : (isMainItem ? '9px 14px' : '7px 14px 7px 32px'),
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    margin: '0 8px',
                    borderRadius: '8px',
                    fontSize: isMainItem ? '0.82rem' : '0.78rem'
                }}
                title={isCollapsed ? item.label : undefined}
            >
                {ItemIcon ? (
                    <ItemIcon 
                        strokeWidth={isItemActive ? 2 : 1.5} 
                        className="text-[#a05068]"
                        style={{ width: '16px', flexShrink: 0, marginRight: isCollapsed ? '0' : '10px' }}
                    />
                ) : null}
                {!isCollapsed && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="block min-w-0 flex-1">
                        {item.label}
                    </span>
                )}
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
                        className={`bg-[#ede4dd] dark:bg-[#1a0e14] border-r border-[rgba(139,58,82,0.08)] dark:border-r-0 py-4 fixed top-0 left-0 h-[100vh] z-40 flex flex-col transition-all duration-[600ms] ${isCollapsed ? 'w-20' : 'w-[260px]'}`}
                    >
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute top-[16px] -right-[12px] w-[24px] h-[24px] bg-[#2e1d27] border border-[rgba(255,255,255,0.1)] rounded-full flex items-center justify-center text-white hover:bg-[#3a2430] transition-colors z-50 shadow-md"
                        title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
                    >
                        {isCollapsed ? <ChevronRight strokeWidth={2} className="w-3 h-3" /> : <ChevronLeft strokeWidth={2} className="w-3 h-3" />}
                    </button>
                    <nav className="flex flex-col gap-1 flex-1 overflow-y-auto no-scrollbar">
                        <div style={{ padding: '20px 16px', fontSize: '0.95rem' }} className="flex items-center justify-center border-b border-[rgba(139,58,82,0.08)] dark:border-[rgba(255,255,255,0.05)] mb-4">
                            <Link href="/">
                                <Logo width={isCollapsed ? 40 : 160} height={isCollapsed ? 12 : 36} isHome={false} />
                            </Link>
                        </div>
                        {items.map((item, index) => {
                            const rendered = renderItem(item);
                            if (!rendered) return null;
                            return (
                                <div key={item.label}>
                                    {rendered}
                                    {index < items.length - 1 && <div className="border-t border-[rgba(139,58,82,0.08)] dark:border-[rgba(255,255,255,0.05)]" style={{ margin: '4px 0' }} />}
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