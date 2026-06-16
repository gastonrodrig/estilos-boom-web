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
    const { role } = useAuthStore();
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
        const ItemIcon = item.icon && item.icon in iconMap ? iconMap[item.icon as keyof typeof iconMap] : null;

        const isItemActive = item.href ? isPathActive(item.href) : false;
        const hasActiveChild = item.children ? item.children.some(child => checkActiveRecursive(child)) : false;

        const isOpen = openSections[item.label] ?? hasActiveChild;

        const filteredChildren = item.children?.filter(child => !child.requiredRoles || (role && child.requiredRoles.includes(role)));
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
                            ${hasActiveChild ? "font-semibold text-[#1a0c12] dark:text-[#fdeef5]" : "font-medium text-[rgba(26,12,18,0.85)] dark:text-[#b8afc8]"}
                            hover:bg-[rgba(220,140,170,0.15)] hover:text-[#1a0c12] dark:hover:bg-[rgba(240,150,190,0.08)] dark:hover:text-[rgba(253,238,245,0.9)]`}
                    >
                        <span className={`flex items-center gap-4 ${depth === 0 ? "text-[15px] tracking-wide" : "text-[14px]"} ${ItemIcon || depth > 0 ? "" : "pl-9"}`}>
                            {ItemIcon ? <ItemIcon className="w-5 h-5 shrink-0" strokeWidth={2} /> : null}
                            <span className={depth === 0 ? "whitespace-nowrap" : "whitespace-normal leading-tight"}>
                                {item.label}
                            </span>
                        </span>
                        <ChevronDown className={`w-4 h-4 text-[rgba(26,12,18,0.85)] dark:text-[#b8afc8] group-hover:dark:text-[rgba(253,238,245,0.9)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2} />
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
                        ? `text-[0.87rem] py-[9px] px-[14px] ${isItemActive ? "font-medium text-[#2a1520] dark:text-[#fdeef5] bg-[rgba(220,140,170,0.2)] dark:bg-[rgba(232,184,109,0.09)] border-l-[2px] border-l-[#c4547a] dark:border-l-[#e8b86d] shadow-[inset_0_0_20px_rgba(220,140,170,0.1)] dark:shadow-[inset_0_0_20px_rgba(232,184,109,0.04)] pl-[12px]" : "font-medium text-[rgba(42,21,32,0.85)] dark:font-normal dark:text-[#b8afc8] hover:bg-[rgba(220,140,170,0.15)] hover:text-[#2a1520] border-l-[2px] border-transparent dark:hover:bg-[rgba(232,184,109,0.06)] dark:hover:text-[rgba(253,238,245,0.85)] hover:border-l-[rgba(184,134,11,0.45)] dark:hover:border-l-[rgba(232,184,109,0.35)] hover:pl-[12px]"}`
                        : `text-[0.82rem] py-2 px-3 pl-[28px] relative ${isItemActive ? "font-medium text-[#2a1520] dark:text-[#fdeef5]" : "font-medium text-[rgba(42,21,32,0.75)] dark:font-normal dark:text-[#b8afc8]/80 hover:text-[#c4547a] dark:hover:text-[rgba(232,184,109,0.9)]"}`
                    }`}
            >
                {ItemIcon ? (
                    <ItemIcon 
                        className={`shrink-0 transition-all duration-200 ${isItemActive ? "text-[#c4547a] dark:text-[#fdeef5] w-[17px] h-[17px]" : "text-[rgba(196,84,122,0.7)] dark:text-[#b8afc8] group-hover:text-[#c4547a] dark:group-hover:text-[rgba(253,238,245,0.85)] w-[17px] h-[17px]"}`} 
                        strokeWidth={isItemActive ? 2 : 1.8} 
                        style={isItemActive ? { animation: 'iconGlow 3s ease-in-out infinite' } : undefined}
                    />
                ) : (
                    <>
                        <div className="hidden dark:flex w-[12px] h-5 items-center justify-center shrink-0 absolute left-[12px]">
                            <span className="text-[12px] text-[#e8b86d]/60 transition-all duration-200 group-hover:text-[#e8b86d]">—</span>
                        </div>
                        <div className="dark:hidden w-[17px] h-5 flex items-center shrink-0 absolute left-[12px]">
                            <span className="text-[12px] text-[rgba(196,84,122,0.55)] font-bold transition-all duration-200 group-hover:text-[#c4547a]">—</span>
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
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -24, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={`sidebar-elegant w-72 sticky flex flex-col ${sidebarTopClass} ${sidebarHeightClass} border-r-[1.5px] border-[rgba(196,84,122,0.15)] dark:border-[rgba(232,184,109,0.08)] shadow-[3px_0_24px_rgba(196,84,122,0.1)] dark:shadow-none z-10 overflow-y-auto overflow-x-hidden relative bg-[linear-gradient(180deg,rgba(255,240,245,0.98)_0%,rgba(255,232,240,0.96)_50%,rgba(255,225,235,0.98)_100%)] dark:bg-none dark:bg-[rgba(12,4,10,0.88)] backdrop-blur-[20px]`}
                >
                    {/* Estrellas Light Mode */}
                    <div className="dark:hidden pointer-events-none absolute inset-0 z-0 overflow-hidden">
                        <div className="absolute rounded-full" style={{ top: '22%', left: '78%', width: '1.5px', height: '1.5px', backgroundColor: '#b8860b', opacity: 0.4, animation: 'twinkle 3s ease-in-out infinite' }} />
                        <div className="absolute rounded-full" style={{ top: '50%', left: '15%', width: '1px', height: '1px', backgroundColor: '#c4547a', opacity: 0.3, animation: 'twinkle 4s ease-in-out 1s infinite' }} />
                        <div className="absolute rounded-full" style={{ top: '74%', left: '62%', width: '2px', height: '2px', backgroundColor: '#b8860b', opacity: 0.25, animation: 'twinkle 2.5s ease-in-out 0.5s infinite' }} />
                    </div>

                    {/* Pétalos Cayendo (DARK MODE ONLY) */}
                    <div className="hidden dark:block pointer-events-none absolute inset-0 z-0 overflow-hidden">
                        {[
                            { dur: 12, del: 0, left: 20, fill: "rgba(240,150,190,0.25)", stroke: "rgba(200,100,140,0.3)" },
                            { dur: 15, del: 3, left: 55, fill: "rgba(232,184,109,0.2)", stroke: "rgba(210,130,100,0.3)" },
                            { dur: 10, del: 6, left: 75, fill: "rgba(240,150,190,0.25)", stroke: "rgba(200,100,140,0.3)" },
                            { dur: 18, del: 1, left: 35, fill: "rgba(240,150,190,0.25)", stroke: "rgba(200,100,140,0.3)" },
                            { dur: 13, del: 8, left: 15, fill: "rgba(232,184,109,0.2)", stroke: "rgba(210,130,100,0.3)" },
                            { dur: 16, del: 4, left: 65, fill: "rgba(240,150,190,0.25)", stroke: "rgba(200,100,140,0.3)" }
                        ].map((petal, i) => (
                            <svg key={i} viewBox="0 0 50 70" className="absolute top-[-20px]" style={{
                                left: `${petal.left}%`,
                                width: '15px', height: 'auto',
                                animation: `petalSpiral ${petal.dur}s ease-in-out ${petal.del}s infinite`
                            }}>
                                <path d="M 25 68 C 8 55, 2 38, 4 22 C 6 8, 14 1, 25 1 C 36 1, 44 8, 46 22 C 48 38, 42 55, 25 68 Z" fill={petal.fill}/>
                                <path d="M 25 65 Q 24 40 25 4" stroke={petal.stroke} strokeWidth="0.7" fill="none"/>
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
                        html:not(.dark) .sidebar-elegant::before {
                            content: "";
                            position: absolute;
                            top: 0; left: 0; right: 0;
                            height: 200px;
                            background: radial-gradient(ellipse at 50% 0%, rgba(220,120,160,0.15) 0%, transparent 70%);
                            pointer-events: none;
                            z-index: 0;
                        }
                        html:not(.dark) .sidebar-elegant::after {
                            content: "";
                            position: absolute; top: 15%; right: 0;
                            width: 1.5px; height: 70%;
                            background: linear-gradient(to bottom, transparent, rgba(184,134,11,0.25) 30%, rgba(196,84,122,0.2) 60%, transparent);
                            pointer-events: none;
                            z-index: 0;
                        }
                        html:not(.dark) .logo-icon {
                            filter: drop-shadow(0 0 4px rgba(196,84,122,0.3));
                        }

                        /* ANIMACIONES SUTILES */
                        @keyframes petalSpiral {
                            0%   { transform: translateY(-40px) translateX(0px) rotate(0deg); opacity: 0; }
                            8%   { opacity: 0.55; }
                            25%  { transform: translateY(20vh) translateX(15px) rotate(30deg); }
                            50%  { transform: translateY(45vh) translateX(-10px) rotate(55deg); }
                            75%  { transform: translateY(70vh) translateX(12px) rotate(80deg); }
                            92%  { opacity: 0.3; }
                            100% { transform: translateY(105vh) translateX(-5px) rotate(110deg); opacity: 0; }
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
                        
                        <div className="pt-4 space-y-2 border-none relative mt-4">
                            <div className="dark:hidden absolute top-0 left-[-16px] right-[-16px] h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(196,84,122,0.2) 30%, rgba(184,134,11,0.15) 70%, transparent)' }}></div>
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
                            className="dark:hidden block absolute bottom-0 left-0 w-full pointer-events-none opacity-[0.8] sidebar-flores"
                            style={{ filter: 'saturate(1.15) brightness(1.0)' }}
                        />
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
