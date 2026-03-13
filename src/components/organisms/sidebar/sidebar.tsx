"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LayoutDashboard, Package, Store, ShoppingBag, BookText, Banknote, Contact, Eye } from "lucide-react";

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
} as const;

export function Sidebar({ items }: SidebarProps) {
	const pathname = usePathname();
	const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

	const isPathActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

	const handleToggleSection = (label: string) => {
		setOpenSections((prev) => ({
			...prev,
			[label]: !prev[label],
		}));
	};

	return (
		<aside className="w-64 bg-[#F6F7F9] p-3 h-[calc(100vh-64px)] sticky top-16">

			<nav className="space-y-2">
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
									className={`flex items-center justify-between w-full px-3 py-2 mr-1
										text-gray-900 rounded-md ${hasActiveChild ? "font-medium bg-white shadow" : "font-normal"}
										hover:bg-white hover:shadow
										transition-all duration-200 hover:cursor-pointer`}
								>
									<span className={`flex items-center gap-2 ${ItemIcon ? "" : "pl-6"}`}>
										{ItemIcon ? <ItemIcon className="w-4 h-4" /> : null}
										{item.label}
									</span>

									<ChevronDown
										className={`w-4 h-4 transition-transform duration-500 ${
											isOpen ? "rotate-180" : ""
										}`}
									/>
								</button>

								<div
									className={`overflow-hidden transition-all duration-700 ${
										isOpen ? "max-h-40 mt-2" : "mt-0 max-h-0"
									}`}
								>
									<div className="ml-6 flex flex-col gap-2">
										{item.children.map((child, index) => {
											const isChildActive = isPathActive(child.href);

											return (
											<Link
												key={child.href}
												href={child.href}
												className={`flex items-center w-full px-3 pr-3 mr-1
												rounded-md text-gray-900 hover:bg-white hover:shadow
												${isChildActive ? "font-medium bg-white shadow" : "font-normal"}
												transition-all duration-200 hover:cursor-pointer ${
													index === (item.children?.length ?? 0) - 1 ? "py-2 pb-4" : "py-2"
												}`}
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
							className={`flex items-center gap-2 px-3 py-2 mr-1
								text-gray-900 rounded-md ${isItemActive ? "font-medium bg-white shadow" : "font-normal"}
								hover:bg-white hover:shadow
								transition-all duration-200`}
						>
							{ItemIcon ? <ItemIcon className="w-4 h-4" /> : null}
							{item.label}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}