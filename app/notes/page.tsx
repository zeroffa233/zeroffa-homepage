import Link from "next/link";

export default function Notes() {
    return (
        <div>
            <h2 className="text-[#0047AB] text-4xl font-bold tracking-tight dark:text-neutral-100 mt-5">
                Notes
            </h2>
            <hr className="my-5"></hr>
            <h3 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 mb-3">
                Papers
            </h3>
            <hr className="my-5"></hr>
            <h3 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 mb-3">
                Books
            </h3>
            <hr className="my-5"></hr>
            <h3 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 mb-3">
                Code
            </h3>
            <hr className="my-5"></hr>
            <h3 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 mb-3">
                Misc
            </h3>
        </div>
    );
}
