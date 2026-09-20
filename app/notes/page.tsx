import Link from "next/link";
import { formatDate } from "app/blog/utils";
import { getNotesStructure, NoteListItem } from "app/notes/utils";

function EntryList({ notes }: { notes: NoteListItem[] }) {
    return (
        <ol className="list-decimal list-outside pl-5 text-lg">
            {notes.map((note) => (
                <li key={note.slug} className="mb-2">
                    <div className="flex justify-between items-baseline">
                        <Link
                            href={`/notes/${note.slug}`}
                            className="text-lg transition-all hover:text-[#0047AB] dark:hover:text-blue-400"
                        >
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
        </ol>
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
                    Notes organized by topic rather than time — papers, books,
                    projects and beyond.
                </p>
            </div>
            {sections.map(({ name, title, flat, groups }) => (
                <div key={name}>
                    <hr className="my-5 border-neutral-500 dark:border-neutral-500"></hr>
                    <h3 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 mb-3">
                        {title}
                    </h3>
                    {flat.length > 0 && <EntryList notes={flat} />}
                    {groups.map(({ name: group, notes }) => (
                        <div key={group} className="mt-5">
                            <p className="text-lg font-medium mb-2">{group}</p>
                            <EntryList notes={notes} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
