import { notFound } from "next/navigation";

// 临时屏蔽 CV 页面：恢复时删掉下方 notFound 导出，取消注释原组件
export default function CVPage() {
    return notFound();
}

/*
export default function CVPage() {
    return (
        <section>
            <h2 className="text-[#0047AB] text-4xl font-bold tracking-tight dark:text-neutral-100 mt-5 mb-10">
                Curriculum Vitae
            </h2>
            <PdfViewerWithDownload />
        </section>
    );
}
*/

// 临时屏蔽 CV 页面：恢复时把本组件重新 export，并删掉上方 notFound 版本
function PdfViewerWithDownload() {
    const cvEnglishUrl = "/cv-english.pdf";
    const cvChineseUrl = "/cv-chinese.pdf";

    return (
        <section>
            <h2 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 my-3">
                English
            </h2>
            <div className="w-full h-[800px] overflow-hidden shadow-sm">
                <iframe
                    src={`${cvEnglishUrl}#toolbar=1&navpanes=0`} // #toolbar=1 确保显示原生工具栏（含下载图标）
                    title="PDF Viewer"
                    className="w-full h-full border-none"
                ></iframe>
            </div>
            <h2 className="text-[#0047AB] text-2xl font-bold tracking-tight dark:text-neutral-100 my-3">
                Chinese
            </h2>
            <div className="w-full h-[800px] overflow-hidden shadow-sm">
                <iframe
                    src={`${cvChineseUrl}#toolbar=1&navpanes=0`} // #toolbar=1 确保显示原生工具栏（含下载图标）
                    title="PDF Viewer"
                    className="w-full h-full border-none"
                ></iframe>
            </div>
        </section>
    );
}
