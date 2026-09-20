import Link from "next/link";
import { formatDate } from "app/blog/utils";
import { getNoteList, getSections, NoteListItem } from "app/notes/utils";

function EntryList({ notes }: { notes: NoteListItem[] }) {
    return (
        <ul className="list-disc list-outside pl-4">
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
                    {note.summary && (
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {note.summary}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}

export default function Notes() {
    const notes = getNoteList();
    const sections = getSections();
    return (
        <div>
            <h2 className="text-[#0047AB] text-4xl font-bold tracking-tight dark:text-neutral-100 mt-5">
                Notes
            </h2>
            {sections.map(({ name, title }) => {
                const sectionNotes = notes.filter((n) => n.section === name);
                const flat = sectionNotes.filter((n) => !n.group);
                const groupNames: string[] = [];
                for (const n of sectionNotes) {
                    if (n.group && !groupNames.includes(n.group)) {
                        groupNames.push(n.group);
                    }
                }
                return (
                    <div key={name}>
                        <h3 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 mb-3">
                            {title}
                        </h3>
                        <hr className="my-5 border-neutral-500 dark:border-neutral-500"></hr>
                        {flat.length > 0 && <EntryList notes={flat} />}
                        {groupNames.map((group) => (
                            <div key={group} className="mt-5">
                                <p className="text-lg font-medium mb-2">{group}</p>
                                <EntryList
                                    notes={sectionNotes.filter((n) => n.group === group)}
                                />
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
