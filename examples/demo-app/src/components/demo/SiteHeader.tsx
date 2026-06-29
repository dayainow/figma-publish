export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <span className="text-sm font-bold tracking-tight text-slate-900">
          figma-publish demo
        </span>
        <nav className="flex gap-4 text-sm text-slate-600">
          <a className="hover:text-brand-600" href="#features">
            Features
          </a>
          <a className="hover:text-brand-600" href="#cta">
            CTA
          </a>
        </nav>
      </div>
    </header>
  );
}
