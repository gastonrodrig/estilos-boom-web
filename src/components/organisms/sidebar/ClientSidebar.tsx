import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Home, ShoppingBag, Heart, Star, MessageSquare, User, Settings, Package, History, Crown } from "lucide-react";
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

    const sidebarTopClass = hasTopBar ? "top-[114px] min-[1138px]:top-16" : "top-16";
    const sidebarHeightClass = hasTopBar ? "h-[calc(100vh-114px)] min-[1138px]:h-[calc(100vh-64px)]" : "h-[calc(100vh-64px)]";

    const isPathActive = (href: string) => {
        if (href === '/client' || href === '/') {
            return pathname === href;
        }
        return pathname === href || pathname.startsWith(href + '/');
    };

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

    const renderItem = (item: ClientModule, depth = 0, globalIndex?: number) => {
        if (item.requiredPermission && !permissions.includes(item.requiredPermission)) {
            return null;
        }

        const ItemIcon = item.icon && item.icon in iconMap ? iconMap[item.icon as keyof typeof iconMap] : null;

        const isItemActive = item.href ? isPathActive(item.href) : false;
        const hasActiveChild = item.children ? item.children.some(child => checkActiveRecursive(child)) : false;

        const isOpen = openSections[item.label] ?? hasActiveChild;

        const filteredChildren = item.children?.filter(child => !child.requiredPermission || permissions.includes(child.requiredPermission));
        const hasVisibleChildren = filteredChildren && filteredChildren.length > 0;

        const entranceStyle = depth === 0 && globalIndex !== undefined ? {
            animation: `itemEntrada 0.4s ease forwards`,
            animationDelay: `${globalIndex * 0.05 + 0.05}s`,
            opacity: 0
        } : {};

        if (hasVisibleChildren) {
            return (
                <div key={item.label} className="mb-2" style={entranceStyle}>
                    <button
                        onClick={() => handleToggleSection(item.label)}
                        className={`group flex items-center justify-between w-full px-5 py-3 
                            rounded-[10px] transition-all duration-300 hover:cursor-pointer backdrop-blur-sm border border-transparent
                            ${hasActiveChild ? "font-semibold text-[#594246] dark:text-[#fdeef5]" : "font-medium text-[#594246] dark:text-[#b8afc8]"}
                            hover:bg-white/40 hover:text-[#594246] dark:hover:bg-[rgba(240,150,190,0.08)] dark:hover:text-[rgba(253,238,245,0.9)]`}
                    >
                        <span className={`flex items-center gap-4 ${depth === 0 ? "text-[15px] tracking-wide" : "text-[14px]"} ${ItemIcon || depth > 0 ? "" : "pl-9"}`}>
                            {ItemIcon ? <ItemIcon className="w-5 h-5 shrink-0" strokeWidth={2} /> : null}
                            <span className={depth === 0 ? "whitespace-nowrap" : "whitespace-normal leading-tight"}>
                                {item.label}
                            </span>
                        </span>
                        <ChevronDown className={`w-4 h-4 text-[#594246]/70 dark:text-[#b8afc8] group-hover:dark:text-[rgba(253,238,245,0.9)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2} />
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
                style={entranceStyle}
                className={`group flex items-center gap-4 rounded-[10px] transition-all duration-[0.25s] ease-out mb-2 relative overflow-hidden backdrop-blur-sm
                    ${depth === 0 
                        ? `text-[0.87rem] py-[9px] px-[14px] ${isItemActive ? "font-medium text-[#594246] dark:text-[#fdeef5] bg-white/60 dark:bg-[rgba(232,184,109,0.09)] border-l-[2px] border-l-transparent dark:border-l-[#e8b86d] dark:shadow-[inset_0_0_20px_rgba(232,184,109,0.04)] pl-[12px]" : "font-normal text-[#594246] dark:text-[#b8afc8] hover:bg-white/40 hover:text-[#594246] border-l-[2px] border-transparent dark:hover:bg-[rgba(232,184,109,0.06)] dark:hover:text-[rgba(253,238,245,0.85)] dark:hover:border-l-[rgba(232,184,109,0.35)] dark:hover:pl-[12px]"}`
                        : `text-[0.81rem] py-2 px-3 pl-[28px] relative ${isItemActive ? "font-medium text-[#594246] dark:text-[#fdeef5]" : "font-normal text-[#594246] dark:text-[#b8afc8]/80 dark:hover:text-[rgba(232,184,109,0.9)]"}`
                    }`}
            >
                {ItemIcon ? (
                    <ItemIcon 
                        className={`shrink-0 transition-all duration-200 ${isItemActive ? "text-[#F2778D] dark:text-[#fdeef5] w-[17px] h-[17px]" : "text-[#594246]/60 dark:text-[#b8afc8] group-hover:text-[#594246] dark:group-hover:text-[rgba(253,238,245,0.85)] w-[17px] h-[17px]"}`} 
                        strokeWidth={isItemActive ? 2 : 1.5} 
                        style={isItemActive ? { animation: 'iconGlow 3s ease-in-out infinite' } : undefined}
                    />
                ) : (
                    <>
                        <div className="hidden dark:flex w-[12px] h-5 items-center justify-center shrink-0 absolute left-[12px]">
                            <span className="text-[12px] text-[#e8b86d]/60 transition-all duration-200 group-hover:text-[#e8b86d]">—</span>
                        </div>
                        <div className="dark:hidden w-[17px] h-5 flex items-center justify-center shrink-0 absolute left-3">
                            {isItemActive ? (
                               <div className="w-[12px] h-[1.5px] bg-[#F2778D] inline-block align-middle transition-colors duration-200"></div>
                            ) : (
                               <div className="w-[12px] h-[1px] bg-[#594246]/30 group-hover:bg-[#594246]/60 inline-block align-middle transition-colors duration-200"></div>
                            )}
                        </div>
                    </>
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
                    className={`sidebar-elegant w-72 sticky flex flex-col ${sidebarTopClass} ${sidebarHeightClass} border-r border-white/40 dark:border-[rgba(232,184,109,0.08)] shadow-[8px_0_30px_rgba(89,66,70,0.05)] dark:shadow-none z-10 overflow-y-auto overflow-x-hidden relative bg-white/60 dark:bg-[rgba(12,4,10,0.88)] backdrop-blur-[20px]`}
                >
                    {/* Pétalos Cayendo (DARK MODE ONLY) */}
                    <div className="hidden dark:block pointer-events-none absolute inset-0 z-0 overflow-hidden">
                        {[
                            { dur: 12, del: 0, left: 20, fill: "rgba(240,150,190,0.25)" },
                            { dur: 15, del: 3, left: 55, fill: "rgba(232,184,109,0.2)" },
                            { dur: 10, del: 6, left: 75, fill: "rgba(240,150,190,0.25)" },
                            { dur: 18, del: 1, left: 35, fill: "rgba(240,150,190,0.25)" },
                            { dur: 13, del: 8, left: 15, fill: "rgba(232,184,109,0.2)" },
                            { dur: 16, del: 4, left: 65, fill: "rgba(240,150,190,0.25)" }
                        ].map((petal, i) => (
                            <svg key={i} viewBox="0 0 10 15" className="absolute top-[-20px]" style={{
                                left: `${petal.left}%`,
                                width: '6px', height: '9px',
                                fill: petal.fill,
                                animation: `petalCaer ${petal.dur}s linear ${petal.del}s infinite`
                            }}>
                                <ellipse cx="5" cy="7.5" rx="3" ry="4.5" transform="rotate(30 5 7.5)" />
                            </svg>
                        ))}
                    </div>

                    <style dangerouslySetInnerHTML={{__html: `
                        .dark .sidebar-elegant::before {
                            content: "";
                            position: absolute;
                            top: 0; left: 0; right: 0;
                            height: 120px;
                            background: radial-gradient(ellipse at 40% 0%, rgba(232,184,109,0.06) 0%, transparent 65%);
                            pointer-events: none;
                            z-index: 0;
                        }
                        .dark .sidebar-elegant::after {
                            content: "";
                            position: absolute;
                            bottom: 0; left: 0; right: 0;
                            height: 200px;
                            background: linear-gradient(to top, rgba(140,40,80,0.15), transparent);
                            pointer-events: none;
                            z-index: 0;
                        }

                        /* ANIMACIONES SUTILES */
                        @keyframes petalCaer {
                            0%   { transform: translateY(-20px) rotate(0deg); opacity: 0; }
                            10%  { opacity: 0.6; }
                            90%  { opacity: 0.3; }
                            100% { transform: translateY(100vh) rotate(45deg); opacity: 0; }
                        }
                        @keyframes itemEntrada {
                            from { opacity: 0; transform: translateX(-8px); }
                            to   { opacity: 1; transform: translateX(0); }
                        }
                        @keyframes iconGlow {
                            0%,100% { filter: drop-shadow(0 0 2px rgba(232,184,109,0.3)); }
                            50%      { filter: drop-shadow(0 0 6px rgba(232,184,109,0.7)); }
                        }
                        @keyframes trazoDibujo {
                            from { stroke-dashoffset: 300; opacity: 0; }
                            to   { stroke-dashoffset: 0; opacity: 1; }
                        }
                        @keyframes floresFloat {
                            0%,100% { transform: translateY(0px) rotate(0deg); }
                            50%      { transform: translateY(-4px) rotate(0.5deg); }
                        }
                        @media (prefers-reduced-motion: reduce) {
                            * { animation: none !important; transition-duration: 0.01ms !important; }
                        }
                    `}} />

                    {/* Navigation */}
                    <nav className="flex flex-col p-6 space-y-2 mt-0 relative z-10">
                        {items.filter(item => item.position !== 'bottom').map((item, idx) => renderItem(item, 0, idx))}
                        
                        <div className="pt-4 space-y-2 border-t border-[#594246]/10 dark:border-none relative mt-4">
                            <div className="hidden dark:block absolute top-0 left-[-16px] right-[-16px] h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,184,109,0.12) 40%, rgba(240,150,190,0.08) 60%, transparent)' }}></div>
                            {items.filter(item => item.position === 'bottom').map((item, idx) => renderItem(item, 0, idx + items.filter(i => i.position !== 'bottom').length + 1))}
                        </div>
                    </nav>

                    {/* SVG Decorativo Elegante */}
                    <div className="hidden dark:block absolute bottom-[160px] left-0 w-full opacity-[0.08] pointer-events-none z-0">
                        <svg viewBox="0 0 240 120">
                            <path d="M-20,80 Q60,20 140,70 Q200,110 260,50"
                                  stroke="#e8b86d" strokeWidth="0.8"
                                  fill="none" opacity="0.6"
                                  style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: 'trazoDibujo 2s ease-out 0.5s forwards' }} />
                            <path d="M-20,100 Q80,50 160,90 Q220,120 260,70"
                                  stroke="#f0a0c0" strokeWidth="0.5"
                                  fill="none" opacity="0.4"
                                  style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: 'trazoDibujo 2s ease-out 0.5s forwards' }} />
                        </svg>
                    </div>

                    {/* Flores base */}
                    <div className="mt-auto relative z-[1] flex-shrink-0">
                        {/* Spacer so scroll content doesn't get hidden behind absolute flowers */}
                        <div className="h-[200px]"></div>
                        {/* Dark Mode Loto */}
                        <img 
                            src="/assets/Flor de Loto.png" 
                            alt="Flor de Loto Elegante" 
                            className="hidden dark:block absolute bottom-0 left-0 w-full pointer-events-none opacity-60"
                            style={{ animation: 'floresFloat 6s ease-in-out infinite', filter: 'saturate(0.8) brightness(0.75)' }}
                        />
                        {/* Light Mode Loto */}
                        <img 
                            src="/assets/Flor de Loto.png" 
                            alt="Flor de Loto decorativa" 
                            className="dark:hidden block absolute bottom-0 left-0 w-full pointer-events-none opacity-65"
                            style={{ filter: 'saturate(0.8) brightness(0.8) sepia(0.1)' }}
                        />
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
