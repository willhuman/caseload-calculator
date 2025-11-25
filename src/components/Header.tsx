import Image from 'next/image';
import type { ReactNode } from 'react';

interface HeaderProps {
  rightContent?: ReactNode;
}

export function Header({ rightContent }: HeaderProps) {
  return (
    <header className="w-full">
      <div className="container mx-auto max-w-6xl px-4 py-4 md:py-8">
        <div className="relative">
          {/* Share button in top right on desktop */}
          {rightContent && (
            <div className="hidden md:block absolute top-0 right-0">
              {rightContent}
            </div>
          )}

          {/* Centered stack layout */}
          <div className="text-center space-y-2 md:space-y-3">
            {/* Main title */}
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-nesso-navy">
              Therapist Caseload Calculator
            </h1>

            {/* Powered by Nesso row - centered on desktop, with share button on mobile */}
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
              {/* Share button next to logo on mobile */}
              {rightContent && (
                <div className="md:hidden">
                  {rightContent}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}