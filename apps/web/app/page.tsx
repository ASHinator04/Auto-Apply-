import { APP_NAME, APP_PHASE } from "@job-agent/shared";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-2xl border border-border bg-white p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-sky-700">{APP_PHASE}</p>
        <h1 className="mt-3 text-4xl font-semibold">{APP_NAME}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          This project is in development. Phase 0B.2 establishes the engineering infrastructure
          only; product workflows will be added in later approved phases.
        </p>
      </section>
    </main>
  );
}
