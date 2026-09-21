import Link from "next/link";
import { formatDate } from "app/blog/utils";
import { getNotesStructure, NoteListItem } from "app/notes/utils";

function EntryList({
    notes,
    variant = "default",
}: {
    notes: NoteListItem[];
    variant?: "default" | "papers";
}) {
    const linkClass =
        "text-lg transition-all hover:text-[#0047AB] dark:hover:text-blue-400";
    if (variant === "papers") {
        // Papers：标题在前，后接日期与录用信息（斜体），同行自然排布
        return (
            <ul className="list-disc list-outside pl-5 text-lg">
                {notes.map((note) => (
                    <li key={note.slug} className="mb-2">
                        <Link href={`/notes/${note.slug}`} className={linkClass}>
                            {note.title}
                        </Link>
                        {note.date && (
                            <span className="text-lg text-neutral-500 dark:text-neutral-400">
                                {" "}
                                {formatDate(note.date)}
                            </span>
                        )}
                        {note.acceptedBy && (
                            <span className="text-lg italic text-neutral-500 dark:text-neutral-400">
                                {" "}
                                {note.acceptedBy}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        );
    }
    // 其他分区：单行，标题居左、日期靠右
    return (
        <ul className="list-disc list-outside pl-5 text-lg">
            {notes.map((note) => (
                <li key={note.slug} className="mb-2">
                    <div className="flex justify-between items-baseline">
                        <Link href={`/notes/${note.slug}`} className={linkClass}>
                            {note.title}
                        </Link>
                        {note.date && (
                            <span className="text-lg text-neutral-500 dark:text-neutral-400">
                                {formatDate(note.date)}
                            </span>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default function Notes() {
    const sections = getNotesStructure();
    return (
        <div>
            <div className="flex justify-between items-baseline mt-5">
                <h2 className="text-[#0047AB] text-4xl font-bold tracking-tight dark:text-neutral-100">
                    Notes
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Curated notes organized by topic rather than time —
                    papers, books, projects and beyond.
                </p>
            </div>
            {sections.map(({ name, title, flat, groups }) => (
                <div key={name}>
                    <hr className="my-5 border-neutral-500 dark:border-neutral-500"></hr>
                    <h3 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 mb-3">
                        {title}
                    </h3>
                    {flat.length > 0 && (
                        <EntryList notes={flat} variant={name === "papers" ? "papers" : "default"} />
                    )}
                    {groups.map(({ name: group, notes }) => (
                        <div key={group} className="mt-5">
                            <p className="text-lg font-semibold mb-2">{group}</p>
                            <EntryList
                                notes={notes}
                                variant={name === "papers" ? "papers" : "default"}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
