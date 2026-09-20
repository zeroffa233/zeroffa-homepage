import { BlogPosts } from "app/components/posts";

export const metadata = {
    title: "Blog",
    description: "Read my blog.",
};

export default function Page() {
    return (
        <section>
            <div className="flex justify-between items-baseline mt-5">
                <h2 className="text-[#0047AB] text-4xl font-bold tracking-tight dark:text-neutral-100">
                    Blog
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Casual writing and updates, newest first.
                </p>
            </div>
            <hr className="my-5 border-neutral-500 dark:border-neutral-500"></hr>
            <BlogPosts />
        </section>
    );
}
