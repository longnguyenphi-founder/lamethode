import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import ReportView from "@/components/report/ReportView";
import { ARCHETYPES, type ArchetypeCode } from "@/lib/quiz/questions";
import { getReport, getReportImages } from "@/lib/report/content";
import { THEMES } from "@/lib/report/themes";

export const metadata: Metadata = { title: "Báo cáo nguyên mẫu" };

export default function ReportPage(props: PageProps<"/report">) {
  return (
    <Suspense fallback={<ReportFallback />}>
      <ReportBody searchParams={props.searchParams} />
    </Suspense>
  );
}

async function ReportBody({ searchParams }: Pick<PageProps<"/report">, "searchParams">) {
  const { p, s } = await searchParams;
  const primary = typeof p === "string" ? ARCHETYPES[p as ArchetypeCode] : undefined;
  const secondary = typeof s === "string" ? (ARCHETYPES[s as ArchetypeCode] ?? null) : null;
  const report = primary ? getReport(primary.slug) : null;
  const theme = primary ? THEMES[primary.slug] : undefined;

  if (!primary || !report || !theme) {
    return (
      <ReportFallback>
        <h1 className="font-display text-3xl">Chưa có báo cáo</h1>
        <p className="mt-3 text-sm text-aura-ink-muted">Hãy hoàn thành bài khảo sát để nhận báo cáo của bạn.</p>
        <Link href="/quiz" className="mt-6 inline-block rounded-2xl bg-gradient-to-br from-aura-rose to-aura-clay px-6 py-3 text-sm font-medium text-aura-ink">
          Làm bài khảo sát
        </Link>
      </ReportFallback>
    );
  }

  return <ReportView report={report} theme={theme} images={getReportImages(report.slug)} secondary={secondary} />;
}

function ReportFallback({ children }: { children?: React.ReactNode }) {
  return (
    <div className="aura-canvas flex min-h-dvh flex-1 items-center justify-center px-4 py-10 font-sans text-aura-ink">
      <div className="w-full max-w-[560px] rounded-[2rem] border border-aura-glass-border bg-aura-glass px-6 py-10 text-center backdrop-blur-[20px] sm:px-10">
        {children ?? <p className="text-sm text-aura-ink-muted">Đang mở báo cáo…</p>}
      </div>
    </div>
  );
}
