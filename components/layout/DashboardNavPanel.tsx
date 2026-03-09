"use client";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Logo from "@/public/images/logo.svg";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button, PrettyBR } from "../atoms";
import { observer } from "mobx-react-lite";

const navigationTabs = [
    {
        id: "profile",
        label: "Профиль",
        to: "/panel/profile",
        icon: "mdi:account-outline",
    },
    {
        id: "storage",
        label: "Хранилище",
        to: "/panel/storage",
        icon: "mdi:database-outline",
    },
];

const DashboardNavPanelComponent = () => {
    const path = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className="h-screen overflow-hidden text-main-100">
            <div className="flex h-full w-full gap-3">
                <aside
                    className={`relative flex h-full shrink-0 flex-col overflow-hidden rounded-3xl bg-main-800/70 p-3 backdrop-blur-md transition-[width] duration-300 ease-in-out ${
                        isCollapsed ? "w-16" : "w-55"
                    }`}
                >
                    <div
                        className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
                    >
                        <Image
                            src={Logo}
                            alt="ZVS Logo"
                            width={34}
                            height={34}
                            className={`rounded-lg p-1.5 transition-colors hover:cursor-pointer hover:bg-main-700 ${
                                isCollapsed ? "hidden" : "block"
                            }`}
                        />
                        <Button
                            onClick={() => setIsCollapsed((prev) => !prev)}
                            variant="primary"
                            className="flex h-8 w-8 items-center justify-center"
                        >
                            <Icon
                                icon={
                                    isCollapsed
                                        ? "mdi:chevron-right"
                                        : "mdi:chevron-left"
                                }
                                width={20}
                                height={20}
                            />
                        </Button>
                    </div>

                    <PrettyBR
                        label={isCollapsed ? " " : "Навигация"}
                        icon="mdi:menu"
                    />

                    <nav className="space-y-2">
                        {navigationTabs.map((tab) => {
                            const isActive = tab.to === path;

                            return (
                                <Button
                                    key={tab.to}
                                    variant=""
                                    onClick={() => router.push(tab.to)}
                                    className={`border-transparent flex w-full items-center rounded-xl py-2 text-left text-sm transition-colors cursor-pointer justify-start ${
                                        isActive
                                            ? "bg-main-700/60 text-main-100"
                                            : "text-main-300 hover:bg-main-800/60 hover:text-main-100"
                                    } ${isCollapsed ? "justify-center px-0" : "gap-2 px-2"}`}
                                    title={tab.label}
                                >
                                    <Icon
                                        icon={tab.icon}
                                        width={18}
                                        height={18}
                                    />
                                    <span
                                        className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ${
                                            isCollapsed
                                                ? "max-w-0 opacity-0"
                                                : "max-w-32 opacity-100"
                                        }`}
                                    >
                                        {tab.label}
                                    </span>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>
            </div>
        </aside>
    );
};

export const DashboardNavPanel = observer(DashboardNavPanelComponent);
