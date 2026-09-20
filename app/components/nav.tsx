"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRef, useState } from "react";

function MusicOffIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
            <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
    );
}

function MusicOnIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
        </svg>
    );
}

function MusicToggle() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const attemptsRef = useRef(0);
    const [playing, setPlaying] = useState(false);
    const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

    async function pickAndPlay() {
        try {
            const res = await fetch("/music.jsonl");
            const lines = (await res.text()).trim().split("\n");
            const tracks = lines
                .map((line) => JSON.parse(line))
                .filter((t) => t.url);
            if (tracks.length === 0) return;
            const track = tracks[Math.floor(Math.random() * tracks.length)];
            if (!audioRef.current) {
                audioRef.current = new Audio();
                audioRef.current.volume = 0.7;
            }
            const audio = audioRef.current;
            audio.src = track.url;
            audio.onended = () => void pickAndPlay();
            audio.onerror = () => {
                attemptsRef.current += 1;
                if (attemptsRef.current < tracks.length) {
                    void pickAndPlay();
                } else {
                    setPlaying(false);
                }
            };
            await audio.play();
            attemptsRef.current = 0;
            setPlaying(true);
        } catch {
            // fetch/parse/play failure: give up quietly, stay disabled
            setPlaying(false);
        }
    }

    function toggle() {
        if (playing) {
            audioRef.current?.pause();
            setPlaying(false);
        } else {
            void pickAndPlay();
        }
    }

    return (
        <button
            onClick={toggle}
            onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY })}
            onMouseMove={(e) => setTip({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setTip(null)}
            aria-label={playing ? "暂停音乐" : "播放音乐"}
            className={`outline-none focus:outline-none focus-visible:outline-none transition-all hover:text-[#0047AB] dark:hover:text-blue-400 flex align-middle relative py-1 px-2 m-1 cursor-pointer ${playing ? "text-[#0047AB] dark:text-blue-400" : ""}`}
            style={{ WebkitTapHighlightColor: "transparent" }}
        >
            {playing ? <MusicOnIcon /> : <MusicOffIcon />}
            {tip && (
                <span
                    className="pointer-events-none fixed z-50 text-sm text-neutral-500 whitespace-nowrap"
                    style={{ left: tip.x + 14, top: tip.y + 18 }}
                >
                    Would you like to listen to my favorite songs?
                </span>
            )}
        </button>
    );
}

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
    "/rss": {
        name: "RSS",
    },
    "https://scholar.google.com/citations?user=2WZSOp8AAAAJ&hl=en": {
        name: "Scholar",
    },
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
                    <div className="flex flex-row space-x-0 text-lg ml-auto items-center">
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
                        <MusicToggle />
                    </div>
                </nav>
            </div>
        </aside>
    );
}
