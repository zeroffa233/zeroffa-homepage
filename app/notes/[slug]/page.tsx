import { notFound } from "next/navigation";
import { CustomMDX } from "app/components/mdx";
import { formatDate } from "app/blog/utils";
import { getNote, getNoteList } from "app/notes/utils";

export const dynamicParams = false;

export function generateStaticParams() {
    return getNoteList().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const note = getNote(slug);
    if (!note) {
        return;
    }
    return {
        title: note.metadata.title,
        description: note.metadata.summary,
    };
}

export default async function Note({ params }) {
    const { slug } = await params;
    const note = getNote(slug);
    if (!note) {
        notFound();
    }

    return (
        <section>
            <h1 className="text-4xl font-bold tracking-tight mt-5">
                {note.metadata.title}
            </h1>
            {note.metadata.date && (
                <div className="flex justify-between items-center mt-10 mb-6 text-base text-neutral-600 dark:text-neutral-400">
                    <p>{formatDate(note.metadata.date)}</p>
                </div>
            )}
            <article className="prose">
                <CustomMDX source={note.content} />
            </article>
        </section>
    );
}
