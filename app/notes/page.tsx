import Link from "next/link";

// Notes 页索引：Papers 按主题、Books 按书目、Projects 按项目分组；Misc 平铺。
// 加内容：往对应 entries 里加 { title, href, desc? } 即可。
// href 指向站内博客（/blog/<slug>）或外部链接均可；desc 可选，显示在标题后。
type NoteEntry = { title: string; href: string; desc?: string };
type NoteGroup = { name?: string; entries: NoteEntry[] };
type NoteSection = { title: string; groups: NoteGroup[] };

const SECTIONS: NoteSection[] = [
    {
        title: "Papers",
        groups: [
            {
                name: "主题一",
                entries: [],
            },
        ],
    },
    {
        title: "Books",
        groups: [
            {
                name: "书目一",
                entries: [],
            },
        ],
    },
    {
        title: "Projects",
        groups: [
            {
                name: "项目一",
                entries: [],
            },
        ],
    },
    {
        title: "Misc",
        groups: [
            {
                entries: [],
            },
        ],
    },
];

const h3Style =
    "text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 mb-3";

export default function Notes() {
    return (
        <div>
            <h2 className="text-[#0047AB] text-4xl font-bold tracking-tight dark:text-neutral-100 mt-5">
                Notes
            </h2>
            {SECTIONS.map(({ title, groups }) => (
                <div key={title}>
                    <h3 className={h3Style}>{title}</h3>
                    <hr className="my-5 border-neutral-500 dark:border-neutral-500"></hr>
                    {groups.map(({ name, entries }, i) => (
                        <div key={name ?? i} className={i > 0 ? "mt-5" : ""}>
                            {name && (
                                <p className="font-bold text-lg mb-2">{name}</p>
                            )}
                            <ul className="list-disc list-outside pl-4">
                                {entries.map((entry) => (
                                    <li key={entry.title} className="mb-1">
                                        <Link
                                            href={entry.href}
                                            target={
                                                entry.href.startsWith("http")
                                                    ? "_blank"
                                                    : undefined
                                            }
                                            rel="noopener noreferrer"
                                            className="transition-all hover:text-[#0047AB] dark:hover:text-blue-400"
                                        >
                                            {entry.title}
                                        </Link>
                                        {entry.desc && (
                                            <span className="text-neutral-500 dark:text-neutral-400">
                                                {" "}
                                                — {entry.desc}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
