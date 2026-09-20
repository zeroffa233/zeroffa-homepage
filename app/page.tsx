import Image from "next/image";
import Link from "next/link";
import * as Public from "../public";

export default function Page() {
    return (
        <section>
            <ProfileCard />
            <hr className="mt-5"></hr>
            <Biography />
            <hr className="mt-5"></hr>
            <Experience />
            <hr className="mt-5"></hr>
            <Publication />
            <hr className="mt-5"></hr>
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
            <div className="flex flex-col justify-between items-end ml-auto flex-shrink-0">
                <div className="flex gap-5">
                    <Link
                        href="https://aiia.seu.edu.cn/palm"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative w-32 h-100 flex-shrink-0 overflow-hidden rounded-lg"
                    >
                        <Image src={Public.palmLogo} alt="Palm Logo" />
                    </Link>

                    <Link
                        href="https://www.seu.edu.cn/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative w-32 h-100 flex-shrink-0 overflow-hidden rounded-lg"
                    >
                        <Image src={Public.seuLogo} alt="SEU Logo" />
                    </Link>
                </div>
                <p className="italic text-lg text-neutral-500 dark:text-neutral-400">
                    “江南雨，落如花满地，飘零。”
                </p>
            </div>
        </section>
    );
}

function Biography() {
    return (
        <section>
            <h2 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 my-3">
                Biography
            </h2>
            <p className="mb-2">
                I am an undergraduate student majoring in Computer Science and
                Technology at Southeast University, with an expected graduation
                date of August 2027.
            </p>
            <p className="mb-2">
                My research interests lie in ML systems, LLM, and Coding Agent.
                I am particularly interested in improving the efficiency,
                reliability, and practical capabilities of ML/Agent systems.
            </p>
        </section>
    );
}

function Experience() {
    return (
        <section>
            <h2 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 my-3">
                Experience
            </h2>
            <li className="flex gap-6 mb-2">
                <span className="w-28 shrink-0 dark:text-neutral-400">
                    2025 – Present
                </span>
                <div>
                    <p className="font-medium">
                        University of California San Diego
                    </p>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Advisor: Prof. Yufei Ding
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Visiting Student Researcher in Picasso Lab
                    </p>
                </div>
            </li>
            <li className="flex gap-6 mb-2">
                <span className="w-28 shrink-0 dark:text-neutral-400">
                    2025 – Present
                </span>
                <div>
                    <p className="font-medium">Peking University</p>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Advisor: Prof. Xiang Chen
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Visiting Student Researcher in IF Lab
                    </p>
                </div>
            </li>
            <li className="flex gap-6 mb-2">
                <span className="w-28 shrink-0 dark:text-neutral-400">
                    2023 – Present
                </span>
                <div>
                    <p className="font-medium">Southeast University</p>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Advisor: Prof. Feng Shan
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        B.Eng. in Computer Science and Technology
                    </p>
                </div>
            </li>
        </section>
    );
}

function Publication() {
    return (
        <section>
            <h2 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 my-3">
                Publication
            </h2>
            <ul className="list-disc list-outside pl-4">
                <li className="mb-2">
                    <p className="font-medium">
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

                    <p className="text-neutral-600 dark:text-neutral-400">
                        <strong>Baixin Wan</strong>, Haozhe Zhang, Jiaqi Li,
                        Jianping Huang, Feng Shan<sup>*</sup>, and Yun Wang.
                    </p>

                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        IEEE Transactions on Services Computing (TSC) · CCF-A
                    </p>
                </li>
                <li className="mb-2">
                    <p className="font-medium">
                        <Link
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-all hover:text-[#0047AB] dark:hover:text-blue-400"
                        >
                            From Docking Station to Docking Station: Completing
                            Tasks in Minimum Time by Cooperative UAV Fleets
                        </Link>
                    </p>

                    <p className="text-neutral-600 dark:text-neutral-400">
                        <strong>Baixin Wan</strong>, Feng Shan<sup>*</sup>,
                        Jianping Huang.
                    </p>

                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
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
        <section>
            <h2 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 my-3">
                Honors & Awards
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
