"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navLeftItems = {
    "/": {
        name: "Home",
    },
    "/blog": {
        name: "Blog",
    },
    "/notes": {
        name: "Notes",
    },
    // 临时屏蔽 CV 页面：恢复时取消注释
    // "/cv": {
    //     name: "CV",
    // },
    "/links": {
        name: "Links",
    },
};

const navRightItems = {
    "https://github.com/zeroffa233": {
        name: "Github",
    },
};

export function Navbar() {
    const pathname = usePathname();

    return (
        <aside className="-ml-[8px] mt-5 mb-5 tracking-tight">
            <div className="lg:sticky lg:top-20">
                <nav
                    className="flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
                    id="nav"
                >
                    <div className="flex flex-row space-x-0 text-lg">
                        {Object.entries(navLeftItems).map(
                            ([path, { name }]) => {
                                return (
                                    <Link
                                        key={path}
                                        href={path}
                                        className={`
  transition-all hover:text-[#0047AB] dark:hover:text-blue-400
  flex align-middle relative py-1 px-2 m-1
  ${pathname === path ? "font-bold text-[#0047AB] dark:text-blue-400" : ""}
`}
                                    >
                                        {name}
                                    </Link>
                                );
                            },
                        )}
                    </div>
                    <div className="flex flex-row space-x-0 text-lg ml-auto">
                        {Object.entries(navRightItems).map(
                            ([path, { name }]) => {
                                return (
                                    <Link
                                        key={path}
                                        href={path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={` transition-all hover:text-[#0047AB] dark:hover:text-blue-400 flex align-middle relative py-1 px-2 m-1`}
                                    >
                                        {name}
                                    </Link>
                                );
                            },
                        )}
                    </div>
                </nav>
            </div>
        </aside>
    );
}
