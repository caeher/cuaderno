import { LegalNav } from "@/components/site/legal-nav"

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        <LegalNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
