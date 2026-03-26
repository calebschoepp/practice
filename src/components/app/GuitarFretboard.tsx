import type { GuitarFingering } from "@/domain/types";

interface GuitarFretboardProps {
  fingering: GuitarFingering;
}

const STRING_LABELS = ["E", "B", "G", "D", "A", "E"];
const STRING_COUNT = 6;

export function GuitarFretboard({ fingering }: GuitarFretboardProps) {
  const start = fingering.startFret ?? 0;
  const maxFret = Math.max(...fingering.positions.map((p) => p.fret), start + 3);
  const fretCount = maxFret - start + 1;

  const hasOpen = fingering.positions.some((p) => p.fret === 0);

  const padLeft = 24;
  const openCol = hasOpen ? 16 : 0;
  const fretW = 40;
  const stringGap = 16;
  const dotR = 6;

  const gridLeft = padLeft + openCol;
  const gridW = fretCount * fretW;
  const gridH = (STRING_COUNT - 1) * stringGap;
  const svgW = gridLeft + gridW + 12;
  const svgH = gridH + 40;

  const topY = 20;

  function stringY(s: number) {
    // s is 1-6, 1=high E at bottom, 6=low E at top
    return topY + (6 - s) * stringGap;
  }

  function fretX(f: number) {
    // Position dot in the middle of the fret space
    const relFret = f - start;
    return gridLeft + relFret * fretW + fretW / 2;
  }

  function openX() {
    return padLeft + openCol / 2;
  }

  // Build a set for quick lookup
  const posSet = new Map<string, number | undefined>();
  for (const p of fingering.positions) {
    posSet.set(`${p.string}-${p.fret}`, p.finger);
  }

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="w-full"
      role="img"
      aria-label="Guitar fretboard diagram"
    >
      {/* String labels */}
      {Array.from({ length: STRING_COUNT }, (_, i) => {
        const s = 6 - i; // string number (6=top, 1=bottom)
        return (
          <text
            key={`label-${s}`}
            x={8}
            y={stringY(s) + 1}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-muted-foreground font-mono text-[8px]"
          >
            {STRING_LABELS[i]}
          </text>
        );
      })}

      {/* Nut (thick line at fret 0) */}
      {start === 0 && (
        <rect
          x={gridLeft - 1.5}
          y={topY - 2}
          width={3}
          height={gridH + 4}
          rx={1}
          className="fill-foreground"
        />
      )}

      {/* Position marker if starting above fret 0 */}
      {start > 0 && (
        <text
          x={gridLeft - 4}
          y={topY + gridH + 12}
          textAnchor="middle"
          className="fill-muted-foreground font-mono text-[8px]"
        >
          {start}fr
        </text>
      )}

      {/* Fret lines */}
      {Array.from({ length: fretCount + 1 }, (_, i) => (
        <line
          key={`fret-${i}`}
          x1={gridLeft + i * fretW}
          y1={topY}
          x2={gridLeft + i * fretW}
          y2={topY + gridH}
          className="stroke-border"
          strokeWidth={i === 0 && start === 0 ? 0 : 0.75}
        />
      ))}

      {/* Strings */}
      {Array.from({ length: STRING_COUNT }, (_, i) => {
        const s = 6 - i;
        const y = stringY(s);
        return (
          <line
            key={`string-${s}`}
            x1={gridLeft}
            y1={y}
            x2={gridLeft + gridW}
            y2={y}
            className="stroke-foreground/40"
            strokeWidth={1 + i * 0.3}
          />
        );
      })}

      {/* Open string markers (circles at left of nut) */}
      {hasOpen &&
        fingering.positions
          .filter((p) => p.fret === 0)
          .map((p) => (
            <circle
              key={`open-${p.string}`}
              cx={openX()}
              cy={stringY(p.string)}
              r={dotR - 1.5}
              className="fill-none stroke-foreground"
              strokeWidth={1.2}
            />
          ))}

      {/* Fretted position dots */}
      {fingering.positions
        .filter((p) => p.fret > 0)
        .map((p) => {
          const cx = fretX(p.fret);
          const cy = stringY(p.string);
          return (
            <g key={`pos-${p.string}-${p.fret}`}>
              <circle cx={cx} cy={cy} r={dotR} className="fill-primary" />
              {p.finger !== undefined && (
                <text
                  x={cx}
                  y={cy + 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-primary-foreground font-mono text-[7px] font-bold"
                >
                  {p.finger}
                </text>
              )}
            </g>
          );
        })}

      {/* Fret numbers at bottom */}
      {Array.from({ length: fretCount }, (_, i) => {
        const fretNum = start + i + 1;
        return (
          <text
            key={`fretnum-${i}`}
            x={gridLeft + i * fretW + fretW / 2}
            y={topY + gridH + 12}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[7px]"
          >
            {fretNum}
          </text>
        );
      })}
    </svg>
  );
}
