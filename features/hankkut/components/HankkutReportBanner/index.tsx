export default function HankkutReportBanner() {
  return (
    <section className="rounded-2xl bg-lime-300 px-6 py-8 md:px-10">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-bold text-navy-900">
            놓친 한끗이 있나요?
          </h2>
          <p className="mt-1 text-sm text-navy-900/70">
            제보해 주시면 다음 여행자가 좋아요.
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full bg-navy-900 px-6 py-3 text-sm font-bold text-lime-300 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 focus-visible:ring-offset-2"
        >
          제보하러 가기 →
        </button>
      </div>
    </section>
  );
}