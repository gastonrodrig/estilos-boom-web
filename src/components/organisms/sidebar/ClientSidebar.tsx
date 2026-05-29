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
    const { role } = useAuthStore();
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    const [showSidebar, setShowSidebar] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(min-width: 1024px)").matches;
    });

    const sidebarTopClass = hasTopBar ? "top-[100px]" : "top-16";
    const sidebarHeightClass = hasTopBar ? "h-[calc(100dvh-100px)]" : "h-[calc(100dvh-64px)]";

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
        if (item.requiredRoles && role && !item.requiredRoles.includes(role)) {
            return null;
        }

        const ItemIcon = item.icon && item.icon in iconMap ? iconMap[item.icon as keyof typeof iconMap] : null;

        const isItemActive = item.href ? isPathActive(item.href) : false;
        const hasActiveChild = item.children ? item.children.some(child => checkActiveRecursive(child)) : false;

        const isOpen = openSections[item.label] ?? hasActiveChild;

        const filteredChildren = item.children?.filter(child => !child.requiredRoles || (role && child.requiredRoles.includes(role)));
        const hasVisibleChildren = filteredChildren && filteredChildren.length > 0;

        if (hasVisibleChildren) {
            return (
                <div key={item.label} className="mb-2">
                    <button
                        onClick={() => handleToggleSection(item.label)}
                        className={`group flex items-center justify-between w-full px-5 py-3 
                            rounded-2xl transition-all duration-300 hover:cursor-pointer
                            ${hasActiveChild ? "font-semibold text-[#594246] bg-[#F2D0D3]/20" : "font-medium text-[#594246]"}
                            hover:bg-[#F2D0D3]/40 hover:text-[#594246]`}
                    >
                        <span className={`flex items-center gap-4 ${depth === 0 ? "text-[15px] tracking-wide" : "text-[14px]"} ${ItemIcon || depth > 0 ? "" : "pl-9"}`}>
                            {ItemIcon ? <ItemIcon className="w-5 h-5 shrink-0" strokeWidth={2} /> : null}
                            <span className={depth === 0 ? "whitespace-nowrap" : "whitespace-normal leading-tight"}>
                                {item.label}
                            </span>
                        </span>
                        <ChevronDown className={`w-4 h-4 text-[#594246]/70 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2} />
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
                                <div className="ml-7 mt-2 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-gradient-to-b before:from-[#F2D0D3]/10 before:via-[#F2D0D3] before:to-[#F2D0D3]/10 pl-5 flex flex-col gap-1">
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
                className={`group flex items-center gap-4 px-5 rounded-2xl transition-all duration-300 mb-2 relative overflow-hidden
                    ${depth === 0 ? "text-[15px] tracking-wide py-3" : "text-[14px] py-2.5"}
                    ${isItemActive 
                        ? "font-bold text-[#594246] bg-[#F2D0D3]/40 shadow-[0_4px_20px_-4px_rgba(242,208,211,0.5)]" 
                        : "font-medium text-[#594246] hover:bg-[#F2D0D3]/20 hover:text-[#594246]"
                    }`}
            >
                {isItemActive && (
                    <motion.div 
                        layoutId="active-pill" 
                        className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-[#F2778D] to-[#F291A3] rounded-r-full" 
                    />
                )}
                {ItemIcon ? (
                    <ItemIcon 
                        className={`w-5 h-5 shrink-0 transition-colors duration-300 ${isItemActive ? "text-[#F2778D]" : "text-[#594246]/60 group-hover:text-[#594246]"}`} 
                        strokeWidth={isItemActive ? 2 : 1.5} 
                    />
                ) : (
                    <div className="w-5 h-5 flex items-center justify-center">
                        <div className={`transition-all duration-300 rounded-full ${isItemActive ? 'w-2 h-2 bg-[#F2778D]' : 'w-1 h-1 bg-[#594246]/30 group-hover:bg-[#594246]/60 group-hover:scale-150'}`}></div>
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
                    className={`w-72 bg-[#FAF9F6]/80 backdrop-blur-xl sticky flex flex-col ${sidebarTopClass} ${sidebarHeightClass} border-r border-white shadow-[8px_0_30px_rgba(89,66,70,0.03)] z-10`}
                >
                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2 mt-2">
                        {items.map(item => renderItem(item))}
                    </nav>

                    {/* Footer Illustration */}
                    <div className="mt-auto w-full relative">
                        <img 
                            src="/assets/Flor de Loto.png" 
                            alt="Flor de Loto decorativa" 
                            className="w-full h-auto object-contain opacity-70 mix-blend-multiply pointer-events-none transform translate-y-2"
                        />
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
