"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, LayoutDashboard, Package, Store, ShoppingBag, BookText, Banknote, Contact, Eye, ToolCase } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarChildItem {
	label: string;
	href: string;
	highlighted?: boolean;
}

interface SidebarItem {
	label: string;
	href?: string;
	icon?: string;
	children?: SidebarChildItem[];
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
  workshop: ToolCase,
} as const;

export function Sidebar({ items, hasTopBar = false }: SidebarProps) {
	const pathname = usePathname();
	const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
	const [showSidebar, setShowSidebar] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia("(min-width: 1138px)").matches;
	});
	const sidebarTopClass = hasTopBar ? "top-[100px]" : "top-16";
	const sidebarHeightClass = hasTopBar ? "h-[calc(100dvh-100px)]" : "h-[calc(100dvh-64px)]";

	const isPathActive = (href: string) => {
		const isDashboardRoute = href === "/admin" || href === "/client" || href === "/storekeeper";

		if (isDashboardRoute) {
			return pathname === href;
		}

		return pathname === href || pathname.startsWith(`${href}/`);
	};

	const handleToggleSection = (label: string) => {
		setOpenSections((prev) => ({
			...prev,
			[label]: !prev[label],
		}));
	};

	const handleNavigate = () => {
		setOpenSections({});
	};

	useEffect(() => {
		const mediaQuery = window.matchMedia("(min-width: 1138px)");

		const handleChange = (event: MediaQueryListEvent) => {
			setShowSidebar(event.matches);
		};

		mediaQuery.addEventListener("change", handleChange);

		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	return (
		<AnimatePresence>
			{showSidebar && (
				<motion.aside
					initial={{ x: -24, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: -24, opacity: 0 }}
					transition={{ duration: 0.2, ease: "easeOut" }}
					className={`w-64 bg-[#F6F7F9] p-3 sticky ${sidebarTopClass} ${sidebarHeightClass} rounded-r-2xl border-r border-white/70`}
				>

			<nav className="space-y-1.5">
				{items.map((item) => {
					const ItemIcon =
						item.icon && item.icon in iconMap
							? iconMap[item.icon as keyof typeof iconMap]
							: null;
					const isItemActive = item.href ? isPathActive(item.href) : false;

					if (item.children?.length) {
						const hasActiveChild = item.children.some((child) => isPathActive(child.href));
						const isOpen = openSections[item.label] ?? hasActiveChild;

						return (
							<div key={item.label}>
								<button
									onClick={() => handleToggleSection(item.label)}
									className={`group flex items-center justify-between w-full px-3 py-2.5 text-[15px] leading-6
										rounded-lg ${hasActiveChild ? "font-medium text-[#5B283A] bg-white shadow-sm" : "font-normal text-gray-900"}
										hover:bg-white hover:shadow-sm hover:text-[#5B283A]
										transition-all duration-200 hover:cursor-pointer`}
								>
									<span className={`flex items-center gap-2.5 ${ItemIcon ? "" : "pl-7"}`}>
										{ItemIcon ? <ItemIcon className="w-4.5 h-4.5 shrink-0" /> : null}
										{item.label}
									</span>

									<ChevronDown
										className={`w-4.5 h-4.5 transition-transform duration-300 ${
											hasActiveChild ? "text-[#5B283A]" : "text-gray-900"
										} ${
											isOpen ? "rotate-180" : ""
										}`}
									/>
								</button>

								<div
									className={`overflow-hidden transition-all duration-500 ${
										isOpen ? "max-h-80 mt-2 opacity-100" : "mt-0 max-h-0 opacity-0"
									}`}
								>
									<div className="ml-6 mt-1 border-l-2 border-[#d8bcc6] pl-3 pr-1 pb-1 flex flex-col gap-1.5">
										{item.children.map((child) => {
											const isChildActive = isPathActive(child.href);

											return (
											<Link
												key={child.href}
												href={child.href}
												onClick={handleNavigate}
												className={`flex items-center w-full px-3 py-2 text-[15px] leading-6
												rounded-lg hover:bg-white hover:shadow-sm hover:text-[#5B283A]
												${isChildActive ? "font-medium text-[#5B283A] bg-white shadow-sm" : "font-normal text-gray-900"}
												transition-all duration-200 hover:cursor-pointer`}
											>
												{child.label}
											</Link>
											);
										})}
									</div>
								</div>
							</div>
						);
					}

					if (!item.href) {
						return null;
					}

					return (
						<Link
							key={item.label}
							href={item.href}
							onClick={handleNavigate}
							className={`group flex items-center gap-2.5 px-3 py-2.5 text-[15px] leading-6
								rounded-lg ${isItemActive ? "font-medium text-[#5B283A] bg-white shadow-sm" : "font-normal text-gray-900"}
								hover:bg-white hover:shadow-sm hover:text-[#5B283A]
								transition-all duration-200`}
						>
							{ItemIcon ? <ItemIcon className="w-4.5 h-4.5 shrink-0" /> : null}
							{item.label}
						</Link>
					);
				})}
			</nav>
				</motion.aside>
			)}
		</AnimatePresence>
	);
}