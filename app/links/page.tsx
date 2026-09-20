import exp from "constants";
import Link from "next/link";

function LinkItem(href: string, name: string) {
    return (
        <Link href={href} passHref>
            <p>{name}</p>
        </Link>
    );
}

export default function Links() {
    return (
        <section>
            <h2 className="text-[#0047AB] text-4xl font-bold tracking-tight dark:text-neutral-100 mt-5">
                Links
            </h2>
            <hr className="my-5"></hr>
            <h3 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 mb-3">
                Organizations
            </h3>
            <ul className="list-disc list-outside pl-4">
                <li className="mb-2">
                    <p className="font-medium">
                        <Link
                            href="https://sdiaa.tech/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline underline-offset-4"
                        >
                            DEFENSE Group
                        </Link>
                    </p>
                </li>
                <li className="mb-2">
                    <p className="font-medium">
                        <Link
                            href="https://yufeiding.ucsd.edu/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline underline-offset-4"
                        >
                            Picasso Lab
                        </Link>
                    </p>
                </li>
                <li className="mb-2">
                    <p className="font-medium">
                        <Link
                            href="https://iplusplus.club/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline underline-offset-4"
                        >
                            I++ Club
                        </Link>
                    </p>
                </li>
            </ul>
            <hr className="my-5"></hr>
            <h3 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 mb-3">
                Personal
            </h3>
            <ul className="list-disc list-outside pl-4">
                <li className="mb-2">
                    <p className="font-medium">
                        <Link
                            href="https://www.harkerhand.cn/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline underline-offset-4"
                        >
                            Harkerhand's Blog
                        </Link>
                    </p>
                </li>
                <li className="mb-2">
                    <p className="font-medium">
                        <Link
                            href="https://xelinquency.github.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline underline-offset-4"
                        >
                            Illunight's Blog
                        </Link>
                    </p>
                </li>
                <li className="mb-2">
                    <p className="font-medium">
                        <Link
                            href="https://winnie0jia7.github.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline underline-offset-4"
                        >
                            Winnie's Blog
                        </Link>
                    </p>
                </li>
            </ul>
        </section>
    );
}
