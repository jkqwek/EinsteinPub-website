import type { ReactNode } from "react"

type FormulaPattern = { image: string; size: string }

// Default pattern (Events): a repeating tile of rotated formulas
const eventsPattern: FormulaPattern = {
  image: `url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='20' y='50' font-family='serif' font-size='40' fill='%23fabc55' transform='rotate(-15 20 50)'%3EE=mc%C2%B2%3C/text%3E%3Ctext x='150' y='120' font-family='serif' font-size='60' fill='%23fabc55' transform='rotate(10 150 120)'%3E%E2%88%91%3C/text%3E%3Ctext x='200' y='40' font-family='serif' font-size='35' fill='%23fabc55' transform='rotate(25 200 40)'%3E%CF%80r%C2%B2%3C/text%3E%3Ctext x='40' y='220' font-family='serif' font-size='50' fill='%23fabc55' transform='rotate(-5 40 220)'%3E%E2%88%AB%3C/text%3E%3Ctext x='180' y='260' font-family='serif' font-size='25' fill='%23fabc55' transform='rotate(15 180 260)'%3E%E2%88%9A-1%3C/text%3E%3C/svg%3E")`,
  size: "350px 350px",
}

// Page background shared by Events and Gallery: dark green fade, faint gold grid, and a tiled formula
// pattern that a page can swap for its own
export function FormulaBackdrop({ children, pattern = eventsPattern }: { children: ReactNode; pattern?: FormulaPattern }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0f2118] to-forest">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(250,188,85,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(250,188,85,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-screen"
        style={{ backgroundImage: pattern.image, backgroundSize: pattern.size }}
      />

      {children}
    </div>
  )
}
