import Image from 'next/image';

export function Header() {
  return (
    <header className="w-full">
      <div className="container mx-auto max-w-4xl px-4 py-4 md:py-8">
        {/* Centered stack layout */}
        <div className="text-center space-y-2 md:space-y-3">
          {/* Main title */}
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-nesso-navy">
            Therapist Caseload Calculator
          </h1>

          {/* Powered by Nesso row - centered */}
          <div className="flex justify-center items-center gap-2 text-sm text-nesso-ink/80">
            <span>Powered by</span>
            <a
              href="https://nessoapp.com"
              target="_blank"
              rel="noopener"
              aria-label="Nesso"
              className="inline-flex items-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/assets/nesso-logo-real.svg"
                alt=""
                width={80}
                height={20}
                className="h-5"
              />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}