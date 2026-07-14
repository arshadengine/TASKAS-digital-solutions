# TASKAS — Phase 1: Decisions

## Director & Film

**Director:** Denis Villeneuve  
**Film:** *Blade Runner 2049* (2017, DP: Roger Deakins)

### Film Selection Justification (Anti-Convergence Analysis)

1. **What specific visual problem does this film solve for this niche?**  
   TASKAS is a high-technology digital agency that must communicate both precision and scale — the ability to handle colossal technical projects while maintaining elegant restraint. *Blade Runner 2049* solves this exactly: Deakins' cinematography uses extreme negative space, slow atmospheric fog layers, and colossal environmental scale to make the human figure feel small but purposeful against an immense system. For TASKAS, this translates to: the agency itself becomes the vast technological infrastructure, and clients are the purposeful figures walking into it. The film's visual language of amber/silver industrial precision against deep void backgrounds communicates cutting-edge power without shouting.

2. **Would this same film work equally well for three unrelated niches?**  
   No. The film's specific grammar — desolate corporate architecture, amber-fog atmospherics, clinical blue neon in darkness, massive scale against human-sized precision — would feel absurd on a food brand, a retail store, or a travel site. It works precisely for technology, systems, and future-oriented services.

3. **Are you picking the film or picking the film's reputation?**  
   The selection is analytical: specifically the **long horizontal reveal shots**, the **amber industrial palette offset by icy blue highlights**, the **dust-and-fog atmospheric layers**, the **architectural monolith compositions**, and the **barely-visible texture under vast voids**. These are cinematographic choices, not the film's popular reputation.

---

## Demo Uniqueness Protocol

**Previous-work audit:**  
Existing workspace has a project with `index.html`, `style.css`, `main.js`. Visual inspection deferred — treating as first unique output for TASKAS.

**Shell-ban list (what this site must NOT do):**
- No generic gradient hero with centered copy floating in a purple/blue gradient
- No rounded card grids for services (3-column Framer-style)
- No glass-morphism panels as primary surface (overused in tech)
- No top navigation with logo left + menu right as the only nav posture
- No hero with a mockup/device screenshot floating at right

**Primary composition family:**  
`cutaway monolith` — full-bleed dark architectural slabs that cut horizontally to reveal content, as if panels of a massive building are sliding open. Each section is a chamber reveal.

---

## Site Information

**Agency:** TASKAS  
**Niche:** IT Services & Digital Agency  
**Pages:** Single-page with sectioned narrative (Home / About / Services / Why Us / Contact)

---

## Director Brief

**One-sentence visual thesis:**  
TASKAS is the vast monolithic infrastructure of the digital world — a system of immense precision operating in fog, amber light, and architectural silence.

**3 Signature Techniques → Web Translation:**

1. **Villeneuve's extreme negative space** → Sections with 70%+ void, where isolated typography or a single graphic element commands total attention. No padding-filling clutter.

2. **Deakins' amber-to-void gradient atmospherics** → Background layers built from deep charcoal (#0a0a0f) bleeding into warm amber fog (#c8860a at 12% opacity) and cold blue edge light (#1a6bff at 8% opacity). Never solid. Always atmospheric.

3. **Architectural framing — monolithic cutaways** → Section transitions behave like horizontal aperture cuts. Content enters via clip-path reveals, as if a wall panel is sliding aside.

---

## Exact Color Tokens

```css
--void: #08080d;           /* Deep space base */
--void-alt: #0d0d14;       /* Section alternator */
--amber: #e8960a;          /* Warm industrial accent (Blade Runner amber) */
--amber-dim: #c8760a;      /* Dim amber for secondary */
--ice: #4a9eff;            /* Cold neon blue accent */
--ice-dim: #1a5ebb;        /* Secondary blue */
--silver: #c4c8d0;         /* High-hierarchy text */
--mist: #6b7080;           /* Secondary text */
--dust: #2a2d38;           /* Subtle border / surface */
--fog: rgba(232,150,10,0.07);   /* Atmospheric amber overlay */
--frost: rgba(74,158,255,0.06); /* Atmospheric ice overlay */
```

---

## Typography Direction

- **Display / Hero:** `Orbitron` (Google Fonts) — geometric, architectural, cold. Tracked wide at +0.15em.
- **Body / UI:** `Inter` (Google Fonts) — precision, readability, clinical.
- **Accent / Label:** Inter, caps, letter-spacing 0.3em, mist color — like status indicators in the film's UI overlays.
- Scale: fluid, 100-character max per line, hero at clamp(3rem, 8vw, 7rem).

---

## Motion Rules

- Default transition: 0.9s cubic-bezier(0.16, 1, 0.3, 1)
- Hero entrance: 1.4s atmospheric reveal (clip-path + fog layer fade)
- Section entrances: 4 distinct types — clip-wipe-horizontal, scale-from-void, slide-from-edge, curtain-drop
- No bounces, no springs, no elastic — all motion is slow, deliberate, architectural
- Scroll parallax depth: max 30px offset (subtle atmospheric layer drift)
- Max 1 heavy interaction per page section
- `prefers-reduced-motion` collapses all to simple opacity

---

## Entrance Map (Home Page)

- Scene 1 (Hero): `atmospheric-scale-reveal` — scale(1.05→1) + fog layer dissolve
- Scene 2 (About strip): `clip-wipe-right` — horizontal clip-path slide
- Scene 3 (Services): `curtain-drop` — translateY(60px→0) + opacity staggered
- Scene 4 (Why Us / Stats): `slide-from-edge` — translateX(-80px→0)
- Scene 5 (Contact CTA): `fade-from-black` — opacity(0→1) with 2s duration
- Scene 6 (Footer): `scale-from-void` — scale(0.95→1)

6 distinct entrance types. ✅ Anti-convergence satisfied.
