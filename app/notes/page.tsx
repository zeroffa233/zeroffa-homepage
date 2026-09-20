import Link from "next/link";
import { formatDate } from "app/blog/utils";
import { getNotesStructure, NoteListItem } from "app/notes/utils";

function EntryList({ notes }: { notes: NoteListItem[] }) {
    return (
        <ol className="list-decimal list-outside pl-5">
            {notes.map((note) => (
                <li key={note.slug} className="mb-2">
                    <Link
                        href={`/notes/${note.slug}`}
                        className="transition-all hover:text-[#0047AB] dark:hover:text-blue-400"
                    >
                        {note.title}
                    </Link>
                    {note.date && (
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            {" "}
                            {formatDate(note.date)}
                        </span>
                    )}
                </li>
            ))}
        </ol>
    );
}

export default function Notes() {
    const sections = getNotesStructure();
    return (
        <div>
            <h2 className="text-[#0047AB] text-4xl font-bold tracking-tight dark:text-neutral-100 mt-5">
                Notes
            </h2>
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
