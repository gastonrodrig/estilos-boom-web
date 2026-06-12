import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Home, ShoppingBag, Heart, Star, MessageSquare, User, Settings, Package, History } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/hooks";
import { ClientModule } from "@data";

interface ClientSidebarProps {
    items: ClientModule[];
    hasTopBar?: boolean;
}

const iconMap = {
    home: Home,
    "shopping-bag": ShoppingBag,
    heart: Heart,
    star: Star,
    "message-square": MessageSquare,
    user: User,
    settings: Settings,
    package: Package,
    history: History,
} as const;

export function ClientSidebar({ items, hasTopBar = false }: ClientSidebarProps) {
    const pathname = usePathname();
    const { permissions } = useAuthStore();
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    const [showSidebar, setShowSidebar] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(min-width: 1024px)").matches;
    });

    const sidebarTopClass = hasTopBar ? "top-[100px]" : "top-16";
    const sidebarHeightClass = "h-fit pb-6 rounded-b-[2rem]";

    const isPathActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    const checkActiveRecursive = (item: ClientModule): boolean => {
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

    const renderItem = (item: ClientModule, depth = 0) => {
        if (item.requiredPermission && !permissions.includes(item.requiredPermission)) {
            return null;
        }

        const ItemIcon = item.icon && item.icon in iconMap ? iconMap[item.icon as keyof typeof iconMap] : null;

        const isItemActive = item.href ? isPathActive(item.href) : false;
        const hasActiveChild = item.children ? item.children.some(child => checkActiveRecursive(child)) : false;

        const isOpen = openSections[item.label] ?? hasActiveChild;

        const filteredChildren = item.children?.filter(child => !child.requiredPermission || permissions.includes(child.requiredPermission));
        const hasVisibleChildren = filteredChildren && filteredChildren.length > 0;

        if (hasVisibleChildren) {
            return (
                <div key={item.label} className="mb-2">
                    <button
                        onClick={() => handleToggleSection(item.label)}
                        className={`group flex items-center justify-between w-full px-5 py-3 
                            rounded-2xl transition-all duration-300 hover:cursor-pointer backdrop-blur-sm border border-transparent
                            ${hasActiveChild ? "font-semibold text-[#594246] dark:text-[#f0a0c0]" : "font-medium text-[#594246] dark:text-[#f0d8e8]"}
                            hover:bg-white/40 hover:text-[#594246] dark:hover:bg-[#e8688a]/15 dark:hover:text-[#f0a0c0] dark:hover:border-[#e8688a]/20 dark:hover:shadow-[0_0_10px_rgba(232,104,138,0.2)]`}
                    >
                        <span className={`flex items-center gap-4 ${depth === 0 ? "text-[15px] tracking-wide" : "text-[14px]"} ${ItemIcon || depth > 0 ? "" : "pl-9"}`}>
                            {ItemIcon ? <ItemIcon className="w-5 h-5 shrink-0" strokeWidth={2} /> : null}
                            <span className={depth === 0 ? "whitespace-nowrap" : "whitespace-normal leading-tight"}>
                                {item.label}
                            </span>
                        </span>
                        <ChevronDown className={`w-4 h-4 text-[#594246]/70 dark:text-white/50 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="ml-7 mt-2 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-gradient-to-b before:from-[#F2D0D3]/10 before:via-[#F2D0D3] before:to-[#F2D0D3]/10 dark:before:from-[#e8688a]/10 dark:before:via-[#e8688a]/50 dark:before:to-[#e8688a]/10 pl-5 flex flex-col gap-1">
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
                className={`group flex items-center gap-4 px-5 rounded-2xl transition-all duration-300 mb-2 relative overflow-hidden backdrop-blur-sm
                    ${depth === 0 ? "text-[15px] tracking-wide py-3" : "text-[14px] py-2.5"}
                    ${isItemActive 
                        ? "font-bold text-[#594246] dark:text-[#f0a0c0] bg-white/60 dark:bg-[#e8688a]/20 shadow-[0_4px_20px_-4px_rgba(242,208,211,0.5)] dark:shadow-[0_0_15px_rgba(232,104,138,0.4)] border border-white/50 dark:border-[#e8688a]/30" 
                        : `font-medium text-[#594246] dark:text-[#f0d8e8] hover:bg-white/40 hover:text-[#594246] border border-transparent 
                           ${depth === 0 
                               ? "dark:hover:bg-[#e8688a]/15 dark:hover:text-[#f0a0c0] dark:hover:border-[#e8688a]/20 dark:hover:shadow-[0_0_10px_rgba(232,104,138,0.2)]" 
                               : "dark:hover:bg-[#d4a855]/15 dark:hover:text-[#d4a855] dark:hover:border-[#d4a855]/20 dark:hover:shadow-[0_0_10px_rgba(212,168,85,0.2)]"}`
                    }`}
            >
                {isItemActive && (
                    <motion.div 
                        layoutId="active-pill" 
                        className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-[#F2778D] to-[#F291A3] dark:from-[#f0a0c0] dark:to-[#e8688a] dark:shadow-[0_0_10px_rgba(232,104,138,0.8)] rounded-r-full" 
                    />
                )}
                {ItemIcon ? (
                    <ItemIcon 
                        className={`w-5 h-5 shrink-0 transition-all duration-300 ${isItemActive ? "text-[#F2778D] dark:text-[#f0a0c0] dark:drop-shadow-[0_0_5px_rgba(232,104,138,0.8)]" : "text-[#594246]/60 dark:text-[#f0d8e8]/60 group-hover:text-[#594246] dark:group-hover:text-[#f0a0c0]"}`} 
                        strokeWidth={isItemActive ? 2 : 1.5} 
                    />
                ) : (
                    <div className="w-5 h-5 flex items-center justify-center">
                        <div className={`transition-all duration-300 rounded-full ${isItemActive ? 'w-2 h-2 bg-[#F2778D] dark:bg-[#f0a0c0] dark:shadow-[0_0_5px_rgba(232,104,138,0.8)]' : 'w-1 h-1 bg-[#594246]/30 dark:bg-[#f0d8e8]/30 group-hover:bg-[#594246]/60 dark:group-hover:bg-[#f0a0c0] group-hover:scale-150'}`}></div>
                    </div>
                )}
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
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={`w-72 bg-white/60 dark:bg-[#2d0a1e] backdrop-blur-2xl sticky flex flex-col ${sidebarTopClass} ${sidebarHeightClass} border-r border-white/40 dark:border-[#e8688a]/20 shadow-[8px_0_30px_rgba(89,66,70,0.05)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.2)] z-10 overflow-hidden relative`}
                >
                    {/* Ethereal Dark Mode Background Effects */}
                    <div className="absolute inset-0 pointer-events-none hidden dark:block z-0 rounded-b-[2rem]">
                        {/* Gradient diffuse light */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[80%] bg-[radial-gradient(ellipse_at_bottom_center,_rgba(232,104,138,0.45)_0%,_rgba(107,48,96,0.25)_50%,_transparent_80%)]" />
                        
                        {/* Golden sparkles (Bokeh effect) */}
                        <svg className="absolute inset-0 w-full h-full opacity-70">
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                            <g fill="#f0a0c0" filter="url(#glow)">
                                <circle cx="20%" cy="85%" r="1.5" opacity="0.6" />
                                <circle cx="80%" cy="75%" r="2.5" opacity="0.4" />
                                <circle cx="40%" cy="92%" r="1" opacity="0.8" />
                                <circle cx="70%" cy="96%" r="3" opacity="0.3" />
                                <circle cx="15%" cy="65%" r="1.5" opacity="0.5" />
                                <circle cx="88%" cy="88%" r="1.5" opacity="0.7" />
                                <circle cx="50%" cy="80%" r="2" opacity="0.4" />
                                <circle cx="30%" cy="70%" r="1" opacity="0.6" />
                                <circle cx="60%" cy="88%" r="2" opacity="0.5" />
                            </g>
                        </svg>

                        {/* Light fog / haze */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#e8688a]/5" />
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col p-6 space-y-2 mt-2 relative z-10">
                        {items.filter(item => item.position !== 'bottom').map(item => renderItem(item))}
                        
                        <div className="pt-4 space-y-2 border-t border-[#594246]/10 dark:border-[#e8688a]/20 mt-4">
                            {items.filter(item => item.position === 'bottom').map(item => renderItem(item))}
                        </div>
                    </nav>

                    {/* Footer Illustration */}
                    <div className="w-full mt-4 px-4">
                        <img 
                            src="/assets/Flor de Loto.png" 
                            alt="Flor de Loto decorativa" 
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
