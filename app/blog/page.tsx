import { BlogPosts } from "app/components/posts";

export const metadata = {
    title: "Blog",
    description: "Read my blog.",
};

export default function Page() {
    return (
        <section>
            <h2 className="text-[#0047AB] text-4xl font-bold tracking-tight dark:text-neutral-100 mt-5">
                Blog
            </h2>
            <hr className="my-5"></hr>
            <BlogPosts />
        </section>
    );
}
