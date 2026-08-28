import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import moxieImg from "@/imports/grid-item-01.jpg"
import ah2Img from "@/imports/grid-item-02.jpg"
import mozillaImg from "@/imports/grid-item-03.jpg"
import madeImg from "@/imports/grid-item-04.jpg"
import juneteenthImg from "@/imports/grid-item-05.jpg"

type CaseStudy = {
  id: string
  nav: string
  title: string
  client: string
  year: string
  discipline: string
  img: string
  alt: string
  summary: string
  blurb: string
  // object-position for the cropped portrait frame (defaults to center).
  pos?: string
  // Scattered intro placement, as fractions of the viewport, measured from
  // the "Intro" frames. wf = width fraction of viewport width; ar = height/width.
  lx: number
  ty: number
  wf: number
  ar: number
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "moxie",
    nav: "MOXIE",
    title: "Moxie",
    client: "Moxie Beauty",
    year: "2025",
    discipline: "Brand System · Art Direction",
    img: moxieImg,
    alt: "Beauty portrait — a blonde model applying makeup",
    summary:
      "A brand system built around a distinct point of view — confident, editorial, and unmistakably its own.",
    blurb:
      "UX/UI Design, Creative Direction, and Brand Architecture for innovative beauty technology",
    lx: 0.057,
    ty: 0.116,
    wf: 0.178,
    ar: 0.613,
  },
  {
    id: "ah2",
    nav: "AH2",
    title: "AH2",
    client: "After Hours",
    year: "2024",
    discipline: "Packaging · Campaign",
    img: ah2Img,
    alt: "A cocktail held over a tufted leather sofa",
    summary:
      "Low light, high craft. A spirits campaign shot on leather and brass for a program built after hours.",
    blurb:
      "Art Direction and Campaign Photography for an after-hours craft cocktail program",
    lx: 0.506,
    ty: 0.062,
    wf: 0.153,
    ar: 0.613,
  },
  {
    id: "mozilla",
    nav: "MOZILLA",
    title: "Mozilla",
    client: "Mozilla",
    year: "2024",
    discipline: "Environmental · Photography",
    img: mozillaImg,
    alt: "A figure walking past the Mozilla logo on a wood wall",
    summary:
      "Documenting a workplace as a product — an environmental series on how an open-web company actually works.",
    blurb:
      "Environmental Photography and Visual Storytelling for an open-web workplace brand",
    pos: "left center",
    lx: 0.14,
    ty: 0.418,
    wf: 0.2,
    ar: 0.613,
  },
  {
    id: "made",
    nav: "MADE",
    title: "Made",
    client: "Made Studio",
    year: "2023",
    discipline: "Editorial · Portraiture",
    img: madeImg,
    alt: "Low-key portrait of a woman holding a pendant",
    summary:
      "A portrait series for a maker collective — the quiet intensity of people who make things by hand.",
    blurb:
      "Creative Direction and Editorial Portraiture for an independent maker collective",
    lx: 0.589,
    ty: 0.389,
    wf: 0.111,
    ar: 0.613,
  },
  {
    id: "sf-juneteenth",
    nav: "SF JUNETEENTH",
    title: "SF Juneteenth",
    client: "City of San Francisco",
    year: "2023",
    discipline: "Event · Documentary",
    img: juneteenthImg,
    alt: "Black-and-white archival photograph of men at a bar",
    summary:
      "Documentary coverage of a citywide Juneteenth celebration — joy, community, and history after dark.",
    blurb:
      "Documentary Photography and Art Direction for a citywide Juneteenth celebration",
    pos: "right center",
    lx: 0.07,
    ty: 0.653,
    wf: 0.1275,
    ar: 0.613,
  },
]

// Inset of the white content frame, as a fraction of the viewport. The hovered
// work bleeds full-frame in the margin revealed around the card.
const FRAME_X = 0.03
const FRAME_Y = 0.052

const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)"
const HOVER_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const STAGGER_MS = 300
const SETTLE_MS = 1700
const MOVE_MS = 800
const HOVER_IN_MS = 400
const HOVER_OUT_MS = 350

function useStage() {
  const [size, setSize] = useState({ w: 1440, h: 900 })
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return size
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduce(mq.matches)
    const on = () => setReduce(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return reduce
}

const FULL_NAME = "MELINA JONES"
// Indices of the two initials within FULL_NAME ("M" and "J").
const INITIAL_A = 0
const INITIAL_B = 7

function Landing({ onOpen }: { onOpen: (i: number) => void }) {
  const { w, h } = useStage()
  const reduce = usePrefersReducedMotion()
  const [entered, setEntered] = useState(false)
  const [settled, setSettled] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  // Remember the last hovered index so the metadata block can fade out in place.
  const [lastActive, setLastActive] = useState(0)
  useEffect(() => {
    if (active !== null) setLastActive(active)
  }, [active])

  // Hover intent: clearing is deferred a beat so moving between targets (thumb→
  // thumb, thumb↔nav) cancels the pending clear instead of flickering through
  // the null "un-dim" state. Only a real exit clears the highlight.
  const clearTimer = useRef<number | null>(null)
  const hoverOn = (i: number) => {
    if (clearTimer.current) {
      clearTimeout(clearTimer.current)
      clearTimer.current = null
    }
    setActive(i)
  }
  const hoverOff = () => {
    if (clearTimer.current) clearTimeout(clearTimer.current)
    clearTimer.current = window.setTimeout(() => {
      setActive(null)
      clearTimer.current = null
    }, 40)
  }

  // Name intro: 0 = nothing, 1 = "M", 2 = "M J", 3 = full name expanded.
  const [nameStep, setNameStep] = useState(0)
  const [raiseTransform, setRaiseTransform] = useState<string>("none")
  const [dockTransform, setDockTransform] = useState<string>("none")
  const [docking, setDocking] = useState(false) // adopt header metrics, then FLIP
  // The header's *actual* computed metrics, captured at dock time so the giant
  // name becomes geometrically identical (line-height is inherited, so we can't
  // assume "normal"). A single uniform scale then lands both axes exactly.
  const [dockLine, setDockLine] = useState<number>(1.15)
  const [dockLS, setDockLS] = useState<string>("0.06em")
  const [dockWeight, setDockWeight] = useState<number>(700)
  const [introReady, setIntroReady] = useState(false) // name docked → page begins
  const bigNameRef = useRef<HTMLDivElement>(null)
  const headerNameRef = useRef<HTMLDivElement>(null)
  const raiseDyRef = useRef(0) // how far the name was raised, to recover layout top

  // Lift the centered initials straight up so their top sits on the header line.
  const raise = () => {
    const a = bigNameRef.current?.getBoundingClientRect()
    const b = headerNameRef.current?.getBoundingClientRect()
    if (!a || !b) return
    const dy = b.top - a.top
    raiseDyRef.current = dy
    setRaiseTransform(`translateY(${dy}px)`)
  }

  // Kick off the dock: first the giant name instantly adopts the header's exact
  // typographic metrics (weight, tracking, line-height). The FLIP measurement
  // then happens in the layout effect below, once those metrics are applied.
  const dock = () => {
    const hEl = headerNameRef.current
    if (!bigNameRef.current || !hEl) {
      setIntroReady(true)
      return
    }
    // Capture the header's real rendered metrics so the giant name can match
    // them proportionally (em-based) before the FLIP is measured.
    const hs = getComputedStyle(hEl)
    const hFont = parseFloat(hs.fontSize)
    const lineRatio = parseFloat(hs.lineHeight) / hFont
    const lsEm = parseFloat(hs.letterSpacing) / hFont
    setDockLine(Number.isFinite(lineRatio) ? lineRatio : 1.15)
    setDockLS(Number.isFinite(lsEm) ? `${lsEm}em` : "normal")
    setDockWeight(parseInt(hs.fontWeight, 10) || 700)
    setDocking(true)
  }

  // FLIP the raised name down/left onto the header slot, matching its size.
  // Runs after `docking` flips the name to header metrics, so the two texts are
  // now geometrically similar — a single uniform scale lands both width and
  // height exactly. The current rect already includes the raise, so we recover
  // the layout top to compute the vertical delta.
  useLayoutEffect(() => {
    if (!docking) return
    const cur = bigNameRef.current?.getBoundingClientRect()
    const b = headerNameRef.current?.getBoundingClientRect()
    if (!cur || !b) {
      setIntroReady(true)
      return
    }
    const layoutTop = cur.top - raiseDyRef.current
    const scale = b.height / cur.height
    const dx = b.left - cur.left
    const dy = b.top - layoutTop
    setDockTransform(`translate(${dx}px, ${dy}px) scale(${scale})`)
  }, [docking])

  // Sequence — the name is a title card that must clear the stage before any
  // content arrives:
  //  1) initials rise on the header line, 2) name spells out gigantic and holds,
  //  3) the name docks up into its resting header slot, emptying the center,
  //  4) only THEN do the thumbnails scatter in and settle into the row — so the
  //     giant "MELINA JONES" is never cluttered by fading-in images.
  useEffect(() => {
    if (reduce) {
      setNameStep(3)
      setEntered(true)
      setSettled(true)
      setIntroReady(true)
      return
    }
    const J_AT = 1000 // M holds alone ~0.5s, then J cartwheels in
    const RAISE_AT = 1480 // initials travel up to the header line
    const EXPAND_AT = 1900 // full name spells out at the top
    const DOCK_AT = EXPAND_AT + 950 // hold the title card, then dock to header
    const READY_AT = DOCK_AT + 900 // crossfade to the real header as it settles
    const ENTER_AT = DOCK_AT + 960 // images begin only once the center is clear
    const SETTLE_AT = ENTER_AT + SETTLE_MS
    const timers = [
      setTimeout(() => setNameStep(1), 500),
      setTimeout(() => setNameStep(2), J_AT),
      setTimeout(() => raise(), RAISE_AT),
      setTimeout(() => setNameStep(3), EXPAND_AT),
      // Dock first — clears the center before any content appears.
      setTimeout(() => dock(), DOCK_AT),
      // Crossfade to the real header the moment the FLIP settles (transform is
      // 920ms) — no dead pause at large size before the handoff.
      setTimeout(() => setIntroReady(true), READY_AT),
      // Thumbnails scatter in and settle only after the name has left the center.
      setTimeout(() => setEntered(true), ENTER_AT),
      setTimeout(() => setSettled(true), SETTLE_AT),
    ]
    return () => timers.forEach(clearTimeout)
  }, [reduce])

  const { items, frame } = useMemo(() => {
    // Final layout — uniform images in a single horizontal row, centered on
    // the page. Images keep the source aspect (no crop); the row scales down
    // to fit within a comfortable share of the viewport width.
    // All geometry is relative to the inset white panel, not the full viewport.
    const pw = w * (1 - 2 * FRAME_X)
    const ph = h * (1 - 2 * FRAME_Y)
    const frame = { left: w * FRAME_X, top: h * FRAME_Y, width: pw, height: ph }
    const n = CASE_STUDIES.length
    const PORTRAIT_AR = 1.3 // height / width — editorial portrait frame
    // The row is inset from the full-bleed gutters so it reads as a composed
    // element rather than a banner — ~17% narrower than the stage, still centered.
    const spanW = pw * (1 - 2 * 0.056) * 0.83
    let gap = pw * 0.02
    let imgW = (spanW - (n - 1) * gap) / n
    let imgH = imgW * PORTRAIT_AR
    // Reserve a top zone (header + relocated menu) and a bottom zone (manifesto),
    // and make sure the 1.25× hover zoom fits inside the remaining band so it
    // never overlaps any text.
    const bandTop = ph * 0.24
    const bandBottom = ph * 0.18
    const band = ph - bandTop - bandBottom
    const maxImgH = band / 1.25
    if (imgH > maxImgH) {
      const s = maxImgH / imgH
      imgW *= s
      imgH *= s
      gap *= s
    }
    const totalW = n * imgW + (n - 1) * gap
    const rowX = (pw - totalW) / 2
    const rowY = bandTop + band / 2 - imgH / 2 // centered in the clear band
    const items = CASE_STUDIES.map((cs, i) => {
      const introW = cs.wf * pw
      return {
        intro: {
          left: cs.lx * pw,
          top: cs.ty * ph,
          width: introW,
          height: introW * cs.ar,
        },
        final: {
          left: rowX + i * (imgW + gap),
          top: rowY,
          width: imgW,
          height: imgH,
        },
      }
    })
    return { items, frame }
  }, [w, h])

  return (
    <div className="relative h-full w-full overflow-hidden bg-white text-[#111110]">
      {/* Content panel — holds all of the page chrome; positioned children are
          relative to this card. */}
      <div
        className="absolute z-[1] overflow-hidden bg-white"
        style={{
          left: frame.left,
          top: frame.top,
          width: frame.width,
          height: frame.height,
        }}
      >
      {/* Header — fixed, never animates */}
      <header className="pointer-events-none absolute left-0 top-0 z-30 flex w-full items-start justify-between px-[5.6%] pt-[1.25rem]">
        <div
          ref={headerNameRef}
          className="pointer-events-auto text-[clamp(13px,1.05vw,17px)] font-bold uppercase tracking-[0.06em]"
          style={{
            opacity: introReady ? 1 : 0,
            transition: "opacity 260ms ease-out",
          }}
        >
          Melina Jones
        </div>
        <div className="flex flex-col items-end">
          <div
            className="pointer-events-auto text-[clamp(13px,1.05vw,17px)] font-bold uppercase tracking-[0.06em]"
            style={{
              opacity: introReady ? 1 : 0,
              transition: "opacity 400ms ease-out 120ms",
            }}
          >
            Portfolio
          </div>

          {/* Case-study menu — stacked beneath Portfolio, linked 1:1 to the row */}
          <nav
            className="pointer-events-auto mt-[1.8vh] flex flex-col items-end gap-[0.9vh]"
            aria-label="Case studies"
            onMouseLeave={hoverOff}
            onBlur={hoverOff}
          >
            {CASE_STUDIES.map((cs, i) => {
              const isActive = active === i
              const dimmed = active !== null && !isActive
              return (
                <button
                  key={cs.id}
                  type="button"
                  onMouseEnter={() => hoverOn(i)}
                  onFocus={() => hoverOn(i)}
                  onClick={() => onOpen(i)}
                  className="relative cursor-pointer text-right text-[clamp(13px,1.05vw,17px)] uppercase leading-none tracking-[0.04em] outline-none focus-visible:underline"
                  style={{
                    opacity: settled ? 1 : 0,
                    // Dim via a fixed color (not group opacity) so every item
                    // resolves to the exact same gray regardless of label length.
                    color: dimmed ? "#a9a8a6" : "#111110",
                    // Emphasis is pure transform (GPU-composited, no reflow).
                    transformOrigin: "right center",
                    transform: `translateX(${settled ? 0 : 8}px) scale(${
                      isActive ? 1.25 : 1
                    })`,
                    willChange: "transform, opacity",
                    transition: [
                      `opacity 400ms ${HOVER_EASE} ${settled ? i * 50 : 0}ms`,
                      `color 400ms ${HOVER_EASE}`,
                      `transform ${isActive ? HOVER_IN_MS : HOVER_OUT_MS}ms ${HOVER_EASE} ${settled ? 0 : i * 50}ms`,
                    ].join(", "),
                  }}
                >
                  {/* Weight change is a crossfade between two copies, not an
                      animated font-weight — so glyph widths never shift layout. */}
                  <span className="relative inline-block">
                    <span
                      className="block"
                      style={{
                        fontWeight: 600,
                        opacity: isActive ? 0 : 1,
                        transition: `opacity 300ms ${HOVER_EASE}`,
                      }}
                    >
                      {cs.nav}
                    </span>
                    <span
                      aria-hidden
                      className="absolute right-0 top-0 block whitespace-nowrap"
                      style={{
                        fontWeight: 700,
                        opacity: isActive ? 1 : 0,
                        transition: `opacity 300ms ${HOVER_EASE}`,
                      }}
                    >
                      {cs.nav}
                    </span>
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Scattered → stacked image system */}
      <div className="absolute inset-0 z-10">
        {CASE_STUDIES.map((cs, i) => {
          const g = items[i]
          if (!g) return null
          const target = settled ? g.final : g.intro
          const isActive = active === i
          const dimmed = active !== null && !isActive
          const introDelay = entered && !settled ? i * STAGGER_MS : 0
          // Neighbors slide outward by exactly the amount the hovered frame
          // grows on one side (12.5% of its width), so every gap stays even.
          const shift =
            settled && active !== null && !isActive
              ? (i < active ? -1 : 1) * g.final.width * 0.125
              : 0
          return (
            <button
              key={cs.id}
              type="button"
              aria-label={`Open case study: ${cs.title}`}
              onMouseEnter={() => hoverOn(i)}
              onMouseLeave={hoverOff}
              onFocus={() => hoverOn(i)}
              onBlur={hoverOff}
              onClick={() => onOpen(i)}
              className="absolute block cursor-pointer overflow-hidden bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#111110]"
              style={{
                left: target.left,
                top: target.top,
                width: target.width,
                height: target.height,
                opacity: entered ? 1 : 0,
                // Hovered frame scales from its center; the others slide aside
                // to preserve the gap. Every frame shares the same transform
                // shape (translate + scale) so enter/exit interpolate as one
                // clean matrix — no hitch on the way back to rest.
                transform: `translateX(${shift}px) scale(${isActive ? 1.25 : 1})`,
                transformOrigin: "center center",
                willChange: "transform",
                zIndex: isActive ? 20 : 10,
                transition: [
                  `left ${MOVE_MS}ms ${EASE_OUT}`,
                  `top ${MOVE_MS}ms ${EASE_OUT}`,
                  `width ${MOVE_MS}ms ${EASE_OUT}`,
                  `height ${MOVE_MS}ms ${EASE_OUT}`,
                  `opacity 600ms ease-out ${introDelay}ms`,
                  `transform ${isActive ? HOVER_IN_MS : HOVER_OUT_MS}ms ${HOVER_EASE}`,
                ].join(", "),
              }}
            >
              <div
                className="h-full w-full"
                style={{
                  opacity: dimmed ? 0.55 : 1,
                  transition: `opacity ${isActive ? HOVER_IN_MS : HOVER_OUT_MS}ms ${HOVER_EASE}`,
                }}
              >
                <img
                  src={cs.img}
                  alt={cs.alt}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: cs.pos ?? "center" }}
                  draggable={false}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Metadata reveal — appears above the hovered image on hover */}
      {(() => {
        const idx = active ?? lastActive
        const r = items[idx]?.final
        if (!r) return null
        const cs = CASE_STUDIES[idx]
        const shown = settled && active !== null
        return (
          <div
            className="pointer-events-none absolute z-30"
            style={{
              // Flush with the hovered image's left edge. On hover it scales to
              // 125% from center, so its left edge shifts left by 12.5% of width.
              left: r.left - r.width * 0.125,
              // A narrow measure (~60% of the thumbnail width) so the caption
              // reads as a tight editorial column rather than a full-width line.
              width: r.width * 0.6,
              // Clear the image even when it scales to 125% (grows 12.5% upward
              // from center) plus a comfortable margin.
              top: r.top - r.height * 0.125 - 16,
              transform: "translateY(-100%)",
              opacity: shown ? 1 : 0,
              transition: `opacity ${shown ? HOVER_IN_MS : HOVER_OUT_MS}ms ${HOVER_EASE}`,
            }}
          >
            <p className="text-left uppercase text-[clamp(9px,0.66vw,11px)] font-normal leading-[1.3] tracking-[-0.01em] text-[#111110] [font-family:'IBM_Plex_Mono',monospace]">
              {cs.blurb}
            </p>
          </div>
        )
      })()}

      {/* Manifesto — spans the full frame width, flush with the header
          gutters, justified, first line indented. Never animates. */}
      <div
        className="pointer-events-none absolute bottom-[5.5%] left-[5.6%] right-[5.6%] z-30 text-[clamp(11px,1.05vw,19px)] uppercase leading-[1.35] tracking-[0.01em]"
        style={{
          opacity: settled ? 1 : 0,
          transition: "opacity 500ms ease-out 200ms",
        }}
      >
        <p className="text-left font-bold pl-[clamp(24px,6%,150px)]">
          What I <em className="italic">do</em> have is a distinct point of
          view. And it matters.
        </p>
        <p className="mt-[0.35em] text-justify font-medium text-[#111110]/90">
          I work the way I&apos;m built: foundation-first, craft-driven, and
          uncompromising. Before anything is deployed, it&apos;s interrogated,
          shaped by 14+ years of building brand systems and design frameworks
          for brands like Mozilla, Sephora, Method, and Expedia. That foundation
          is informed by on-the-ground research, how people navigate, feel, and
          decide in real environments, translated into design that instructs
          emotion before it requests action — across every environment it
          inhabits — on screen or in the room.
        </p>
      </div>
      </div>
      {/* end framed white panel */}

      {/* Name intro — giant centered name that expands from the initials, then
          docks into the header slot as the page comes to life. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
        style={{
          opacity: introReady ? 0 : 1,
          transition: "opacity 300ms ease-out",
        }}
      >
        <div
          ref={bigNameRef}
          className="whitespace-nowrap text-[clamp(2rem,10.5vw,9.5rem)] uppercase text-[#111110]"
          style={{
            // At dock, snap to the header's exact metrics (no transition on these
            // so the FLIP measurement captures the final proportions). A single
            // uniform scale then maps this text onto the header perfectly.
            fontWeight: docking ? dockWeight : 800,
            letterSpacing: docking ? dockLS : "-0.03em",
            lineHeight: docking ? dockLine : 1.12,
            transformOrigin: "top left",
            transform: dockTransform !== "none" ? dockTransform : raiseTransform,
            transition: `transform 920ms ${EASE_OUT}`,
          }}
        >
          {[...FULL_NAME].map((ch, i) => {
            const isA = i === INITIAL_A
            const isB = i === INITIAL_B
            const isInitial = isA || isB
            const display = ch === " " ? " " : ch
            const expanded = isInitial || nameStep >= 3
            const visible = isA
              ? nameStep >= 1
              : isB
                ? nameStep >= 2
                : nameStep >= 3
            // Left-to-right stagger across the non-initial letters.
            const order = i - (i > INITIAL_A ? 1 : 0) - (i > INITIAL_B ? 1 : 0)
            const delay = isInitial ? 0 : order * 45
            return (
              <span
                key={i}
                style={{
                  display: "inline-grid",
                  gridTemplateColumns: expanded ? "1fr" : "0fr",
                  transition: `grid-template-columns 660ms ${EASE_OUT} ${delay}ms`,
                }}
              >
                {isA ? (
                  // The M rises up out of a surface — its box bottom is the line.
                  <span
                    style={{
                      display: "block",
                      overflow: "hidden",
                      whiteSpace: "pre",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        transform: visible
                          ? "translateY(0%)"
                          : "translateY(118%)",
                        transition: `transform 950ms ${EASE_OUT}`,
                      }}
                    >
                      {display}
                    </span>
                  </span>
                ) : (
                  <span
                    style={{
                      display: "block",
                      minWidth: 0,
                      // Initials never collapse; let the J's spin overflow freely.
                      overflow: isInitial ? "visible" : "hidden",
                      opacity: visible ? 1 : 0,
                      whiteSpace: "pre",
                      transformOrigin: "center center",
                      transform: isB
                        ? visible
                          ? "rotate(0deg)"
                          : "rotate(-360deg)"
                        : "none",
                      transition: isB
                        ? `opacity 720ms ease-out ${delay}ms, transform 780ms ${EASE_OUT} ${delay}ms`
                        : `opacity 560ms ease-out ${delay}ms`,
                    }}
                  >
                    {display}
                  </span>
                )}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CaseStudyPage({ cs, onBack }: { cs: CaseStudy; onBack: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [cs.id])
  return (
    <div
      ref={scrollRef}
      className="h-full w-full animate-[fadeUp_450ms_cubic-bezier(0.16,1,0.3,1)] overflow-y-auto bg-white text-[#111110]"
    >
      <div className="flex items-center justify-between px-[5.6%] pt-[3.6%]">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer text-[13px] font-bold uppercase tracking-[0.06em] transition-opacity hover:opacity-60"
        >
          ← Index
        </button>
        <div className="text-[13px] font-bold uppercase tracking-[0.06em] text-[#111110]/45">
          {cs.year}
        </div>
      </div>

      <div className="px-[5.6%] pb-24 pt-14 md:pt-20">
        <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#111110]/45">
          {cs.discipline}
        </div>
        <h1 className="mt-4 max-w-[14ch] text-[clamp(2.5rem,7vw,6rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
          {cs.title}
        </h1>
        <p className="mt-6 max-w-[46ch] text-[15px] font-medium leading-[1.55] text-[#111110]/70">
          {cs.summary}
        </p>

        <div className="mt-12 aspect-[16/10] w-full overflow-hidden bg-[#eceae6]">
          <img src={cs.img} alt={cs.alt} className="h-full w-full object-cover" />
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-y-6 border-t border-[#111110]/10 pt-8 sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111110]/40">
              Client
            </dt>
            <dd className="mt-1 text-[15px] font-semibold">{cs.client}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111110]/40">
              Year
            </dt>
            <dd className="mt-1 text-[15px] font-semibold">{cs.year}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111110]/40">
              Discipline
            </dt>
            <dd className="mt-1 text-[15px] font-semibold">{cs.discipline}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export default function App() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="h-full w-full">
      {openIndex === null ? (
        <Landing onOpen={setOpenIndex} />
      ) : (
        <CaseStudyPage
          cs={CASE_STUDIES[openIndex]}
          onBack={() => setOpenIndex(null)}
        />
      )}
    </div>
  )
}
