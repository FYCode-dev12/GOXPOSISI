import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Disclaimer pelayanan digital independen GOXPOSISI.",
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
      <article className="glass-panel rounded-3xl p-6 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
          Catatan penting
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Disclaimer GOXPOSISI
        </h1>

        <div className="mt-8 space-y-6 text-base leading-8 text-[var(--muted)]">
          <p>
            Website ini murni merupakan proyek pelayanan digital independen yang
            dikelola secara pribadi sebagai bentuk kecintaan terhadap Firman
            Tuhan dan upaya membagikan sudut pandang yang berpusat pada Injil
            (gospel-centered). Seluruh isi tulisan merupakan hasil studi pribadi,
            refleksi autodidak, serta buah dari diskusi dan pembimbingan bersama
            pembimbing rohani.
          </p>
          <p>
            Kami menyadari sepenuhnya bahwa ruang digital memiliki keterbatasan.
            Tulisan di website ini tidak boleh dianggap sebagai pengganti dari
            kehadiran fisik, penggembalaan, konseling pastoral, penegakkan
            disiplin gereja, maupun pelayanan sakramen yang sah di dalam gereja
            lokal Anda. Tubuh Kristus dirancang untuk hidup dalam komunitas yang
            nyata, bukan sekadar konsumsi konten layar.
          </p>
          <p>
            Jika Anda menghadapi pergumulan hidup yang berat, pertanyaan
            doktrinal yang mendalam, atau keputusan besar dalam hidup, kami
            sangat menyarankan agar Anda membawanya kepada gembala, penatua,
            atau pemimpin rohani di gereja lokal tempat Anda beribadah secara
            rutin. Otoritas penilik rohani yang Tuhan tetapkan di gereja lokal
            adalah yang paling bertanggung jawab dan memiliki otoritas untuk
            membimbing jemaat secara langsung.
          </p>
        </div>
      </article>
    </main>
  );
}
