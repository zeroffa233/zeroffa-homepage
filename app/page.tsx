import Image from "next/image";
import Link from "next/link";
import * as Public from "../public";

export default function Page() {
    return (
        <section>
            <ProfileCard />
            <hr className="mt-5 border-neutral-500 dark:border-neutral-500"></hr>
            <Biography />
            <hr className="mt-5 border-neutral-500 dark:border-neutral-500"></hr>
            <Experience />
            <hr className="mt-5 border-neutral-500 dark:border-neutral-500"></hr>
            <Publications />
            <hr className="mt-5 border-neutral-500 dark:border-neutral-500"></hr>
            <Honors />
        </section>
    );
}

function ProfileCard() {
    return (
        <section className="flex flex-col sm:flex-row items-stretch gap-10 p-1 rounded-xl border-neutral-200 dark:border-neutral-800 mb-5">
            <div className="relative w-40 h-100 flex-shrink-0 overflow-hidden my-auto rounded-sm">
                <Image
                    src={Public.avatar}
                    alt="Avatar"
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col justify-between flex-grow py-1">
                <div>
                    <h2 className="text-4xl text-[#0047AB] font-bold tracking-tight my-10">
                        Baixin Wan（万佰鑫）
                    </h2>
                </div>
                <p className="text-md font-bold text-neutral-1000 dark:text-neutral-400">
                    Undergraduate, Computer Science and Technology
                </p>
                <p className="text-md font-bold text-neutral-1000 dark:text-neutral-400">
                    School of Computer Science and Engineering
                </p>
                <p className="text-md font-bold text-neutral-1000 dark:text-neutral-400">
                    Southeast University
                </p>
                <p className="text-md font-bold text-neutral-1000 dark:text-neutral-400">
                    Email: baixinwan@seu.edu.cn
                </p>
            </div>
            <div className="flex flex-col justify-between items-end ml-auto flex-shrink-0 pt-6">
                <div className="flex gap-5">
                    <Link
                        href="https://aiia.seu.edu.cn/palm"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative w-28 h-87 flex-shrink-0 overflow-hidden rounded-lg"
                    >
                        <Image src={Public.palmLogo} alt="Palm Logo" />
                    </Link>

                    <Link
                        href="https://www.seu.edu.cn/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative w-28 h-87 flex-shrink-0 overflow-hidden rounded-lg"
                    >
                        <Image src={Public.seuLogo} alt="SEU Logo" />
                    </Link>
                </div>
                <p className="italic text-lg text-neutral-500 dark:text-neutral-400 text-right">
                    “自己想通了，无所谓别人怎么讲。
                    <br />
                    自己想不通，才要一直问别人的看法。”
                    <br />
                    ——HuhuMeow
                </p>
            </div>
        </section>
    );
}

function Biography() {
    return (
        <section className="text-lg">
            <h2 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 my-3">
                Biography
            </h2>
            <p className="mb-1">
                I am an undergraduate student majoring in Computer Science and
                Technology at Southeast University, with an expected graduation
                date of August 2027.
            </p>
            <p className="mb-1">
                My research interests lie in ML systems, LLM, and Coding Agent.
                I am particularly interested in improving the efficiency,
                reliability, and practical capabilities of ML/Agent systems.
            </p>
        </section>
    );
}

function Experience() {
    return (
        <section className="text-lg">
            <h2 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 my-3">
                Experience
            </h2>
            <ul className="grid grid-cols-[1fr_max-content] gap-x-10 gap-y-0 items-baseline">
                <li className="contents">
                    <p className="font-medium">
                        University of California San Diego
                    </p>
                    <span className="justify-self-end text-lg font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                        2025 – Present
                    </span>
                    <p className="pb-2 text-base text-neutral-600 dark:text-neutral-400">
                        Visiting Student Researcher, Picasso Lab
                    </p>
                    <p className="justify-self-end pb-2 text-base text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        Advisor: Prof. Yufei Ding
                    </p>
                </li>
                <li className="contents">
                    <p className="font-medium">Peking University</p>
                    <span className="justify-self-end text-lg font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                        2025 – Present
                    </span>
                    <p className="pb-2 text-base text-neutral-600 dark:text-neutral-400">
                        Visiting Student Researcher, IF Lab
                    </p>
                    <p className="justify-self-end pb-2 text-base text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        Advisor: Prof. Xiang Chen
                    </p>
                </li>
                <li className="contents">
                    <p className="font-medium">Southeast University</p>
                    <span className="justify-self-end text-lg font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                        2023 – Present
                    </span>
                    <p className="pb-2 text-base text-neutral-600 dark:text-neutral-400">
                        B.Eng. in Computer Science and Technology
                    </p>
                    <p className="justify-self-end pb-2 text-base text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        Advisor: Prof. Feng Shan
                    </p>
                </li>
            </ul>
        </section>
    );
}

function Publications() {
    return (
        <section className="text-lg">
            <h2 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 my-3">
                Publications
            </h2>
            <ul className="list-disc list-outside pl-4">
                <li className="mb-2">
                    <p className="font-medium text-lg">
                        <Link
                            href="https://doi.org/10.1109/ICPADS67057.2025.11323001"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-all hover:text-[#0047AB] dark:hover:text-blue-400"
                        >
                            Skyline-Based Cooperative Scheduling: Makespan
                            Minimization for Dock-to-Dock UAV Fleets
                        </Link>
                    </p>

                    <p className="text-base text-neutral-600 dark:text-neutral-400">
                        <strong>Baixin Wan</strong>, Haozhe Zhang, Jiaqi Li,
                        Jianping Huang, Feng Shan<sup>*</sup>, and Yun Wang.
                    </p>

                    <p className="text-base text-neutral-500 dark:text-neutral-400">
                        IEEE Transactions on Services Computing (TSC) · CCF-A
                    </p>
                </li>
                <li className="mb-2">
                    <p className="font-medium text-lg">
                        <Link
                            href="https://doi.org/10.1109/ICPADS67057.2025.11323001"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-all hover:text-[#0047AB] dark:hover:text-blue-400"
                        >
                            From Docking Station to Docking Station: Completing
                            Tasks in Minimum Time by Cooperative UAV Fleets
                        </Link>
                    </p>

                    <p className="text-base text-neutral-600 dark:text-neutral-400">
                        <strong>Baixin Wan</strong>, Feng Shan<sup>*</sup>,
                        Jianping Huang.
                    </p>

                    <p className="text-base text-neutral-500 dark:text-neutral-400">
                        31st IEEE International Conference on Parallel and
                        Distributed Systems (ICPADS 2025) · CCF-C
                    </p>
                </li>
            </ul>
        </section>
    );
}

function Honors() {
    return (
        <section className="text-lg">
            <h2 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 my-3">
                Honors &amp; Awards
            </h2>

            <ul className="list-disc list-outside pl-4">
                <li>
                    <p className="font-medium">
                        Meritorious Winner, Mathematical Contest in Modeling
                        (MCM), COMAP, 2025
                    </p>
                </li>
                <li>
                    <p className="font-medium">
                        Outstanding Student Leader, Southeast University, 2024
                    </p>
                </li>
            </ul>
        </section>
    );
}
