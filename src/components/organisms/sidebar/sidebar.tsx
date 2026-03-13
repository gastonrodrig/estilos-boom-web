"use client";

import Image from "next/image";
import Link from "next/link";
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
	"shopping-bagmp": ShoppingBag,
  booktext: BookText,
  banknote: Banknote,
  contact: Contact,
  eye: Eye,
} as const;

export function Sidebar({ items }: SidebarProps) {
	const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

	const handleToggleSection = (label: string) => {
		setOpenSections((prev) => ({
			...prev,
			[label]: !prev[label],
		}));
	};

	return (
		<aside className="w-64 bg-[#F6F7F9] p-3">
			<div className="flex items-center gap-3 mb-2">
				<div
					className="flex items-center justify-center w-12 h-12
												rounded-xl border border-gray-300
												bg-[#5E2A3C] shadow-sm p-2"
				>
					<Image
						src="/assets/auth-icon.png"
						alt="Logo"
						width={36}
						height={36}
						className="object-contain"
					/>
				</div>
				<span className="text-[#5E2A3C] font-semibold text-lg font">Estilos Boom</span>
			</div>

			<div className="border-t border-gray-200 my-3 mx-1" />

			<nav className="space-y-2">
				{items.map((item) => {
					const ItemIcon =
						item.icon && item.icon in iconMap
							? iconMap[item.icon as keyof typeof iconMap]
							: null;

					if (item.children?.length) {
						const isOpen = Boolean(openSections[item.label]);

						return (
							<div key={item.label}>
								<button
									onClick={() => handleToggleSection(item.label)}
									className="flex items-center justify-between w-full px-3 py-2 mr-1
										text-gray-900 rounded-md font-normal
										hover:bg-white hover:shadow
										transition-all duration-200 hover:cursor-pointer"
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
										{item.children.map((child, index) => (
											<Link
												key={child.href}
												href={child.href}
												className={`flex items-center w-full px-3 pr-3 mr-1
												rounded-md font-normal text-gray-900 hover:bg-white hover:shadow
												transition-all duration-200 hover:cursor-pointer ${
													index === (item.children?.length ?? 0) - 1 ? "py-2 pb-4" : "py-2"
												}`}
											>
												{child.label}
											</Link>
										))}
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
							className="flex items-center gap-2 px-3 py-2 mr-1
								text-gray-900 rounded-md font-normal
								hover:bg-white hover:shadow
								transition-all duration-200"
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