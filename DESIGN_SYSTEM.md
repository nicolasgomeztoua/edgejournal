# EdgeJournal Design System

## "The Terminal" Design Language

A high-end trading terminal aesthetic meets brutalist design. Obsidian blacks with electric chartreuse accents, monospace typography for data, and sharp geometric shapes.

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Obsidian Black** | `#050505` | Primary background |
| **Electric Chartreuse** | `#d4ff00` | Primary accent, CTAs, highlights |
| **Ice Blue** | `#00d4ff` | Secondary accent, AI elements |
| **Pure White** | `#fafafa` | Primary text |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Profit Green** | `#00ff88` | Positive values, success states |
| **Loss Red** | `#ff3b3b` | Negative values, errors, destructive |
| **Breakeven Gold** | `#ffd700` | Neutral, warnings |

### Surface Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Card** | `#0a0a0a` | Card backgrounds |
| **Secondary** | `#141414` | Input fields, secondary surfaces |
| **Muted** | `#1a1a1a` | Subtle backgrounds |
| **Border** | `#1f1f1f` | Borders, dividers |

### Chart Colors

| Name | Hex |
|------|-----|
| Chart 1 | `#d4ff00` |
| Chart 2 | `#00d4ff` |
| Chart 3 | `#ff6b00` |
| Chart 4 | `#a855f7` |
| Chart 5 | `#ff3b3b` |

---

## Typography

### Font Stack

```css
/* Display & Body - Syne: distinctive, editorial, geometric */
--font-sans: 'Syne', ui-sans-serif, system-ui, sans-serif;

/* Monospace (for data, code, labels) */
--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
```

> **Note:** Syne has distinctive letterforms. The "g" has a unique descender - ensure adequate line-height (1.15+ for headings, 1.6+ for body) to prevent clipping.

### Type Scale

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Display XL | `text-9xl` (8rem) | 700 | Hero headlines |
| Display L | `text-6xl` (3.75rem) | 700 | Section headers |
| Display M | `text-5xl` (3rem) | 700 | Large headings |
| Title | `text-xl` (1.25rem) | 600 | Card titles |
| Body | `text-base` (1rem) | 400 | Body text |
| Small | `text-sm` (0.875rem) | 400 | Supporting text |
| Micro | `text-xs` (0.75rem) | 500 | Labels, badges |

### Typography Guidelines

- **Headlines**: Use `font-bold` with tight tracking (`tracking-tight`)
- **Labels/Data**: Use `font-mono text-xs uppercase tracking-wider`
- **Body Text**: Use regular weight with relaxed line-height
- **Monospace**: Reserve for numbers, code, and data-heavy UI

---

## Spacing

We use Tailwind's default spacing scale. Key patterns:

| Pattern | Tailwind | Pixels |
|---------|----------|--------|
| Section padding | `py-32` | 128px |
| Component gap | `gap-6` | 24px |
| Card padding | `p-6` | 24px |
| Button padding | `px-8 py-3` | 32px × 12px |
| Inline gap | `gap-3` | 12px |

### Container

```css
.container {
  max-width: 72rem; /* max-w-6xl */
  padding-inline: 1.5rem; /* px-6 */
  margin-inline: auto;
}
```

---

## Border Radius

Brutalist-inspired minimal rounding:

| Size | Value | Usage |
|------|-------|-------|
| `rounded` | 4px | Cards, buttons |
| `rounded-sm` | 2px | Small elements |
| `rounded-full` | 50% | Dots, avatars |

---

## Effects & Visual Treatments

### Glow Effects

```css
.glow-primary {
  box-shadow: 0 0 60px rgba(212, 255, 0, 0.15);
}

.text-glow-primary {
  text-shadow: 0 0 40px rgba(212, 255, 0, 0.5);
}
```

### Background Patterns

```css
/* Grid pattern */
.grid-bg {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 80px 80px;
}

/* Noise overlay (applied to root) */
.noise-overlay {
  opacity: 0.03;
  /* SVG noise texture */
}
```

### Borders

- Default: `border border-white/5` or `border border-white/10`
- Hover: `hover:border-white/20`
- Accent: `border-primary/20` or `border-primary/50`

---

## Components

### Buttons

**Primary**
```html
<button class="h-12 px-8 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider rounded">
  Button Text
</button>
```

**Outline**
```html
<button class="h-12 px-8 border border-white/10 bg-transparent hover:border-white/20 font-mono text-xs uppercase tracking-wider rounded">
  Button Text
</button>
```

### Cards

**Standard Card**
```html
<div class="rounded border border-white/5 bg-white/[0.01] p-6 hover:border-white/10">
  <!-- content -->
</div>
```

**Highlighted Card**
```html
<div class="rounded border border-primary/20 bg-primary/[0.02] p-6 hover:border-primary/40">
  <!-- content -->
</div>
```

### Terminal Window

```html
<div class="rounded border border-white/10 bg-black/80 overflow-hidden">
  <!-- Header -->
  <div class="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-3">
    <div class="flex gap-2">
      <div class="h-3 w-3 rounded-full bg-loss/60"></div>
      <div class="h-3 w-3 rounded-full bg-breakeven/60"></div>
      <div class="h-3 w-3 rounded-full bg-profit/60"></div>
    </div>
    <span class="font-mono text-xs text-muted-foreground">title</span>
  </div>
  <!-- Content -->
  <div class="p-6">
    <!-- content -->
  </div>
</div>
```

### Badges/Pills

```html
<div class="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.02] px-4 py-2">
  <span class="h-2 w-2 rounded-full bg-profit pulse-dot"></span>
  <span class="font-mono text-xs uppercase tracking-wider text-muted-foreground">
    Label
  </span>
</div>
```

---

## Animation

### Keyframes Available

| Name | Usage |
|------|-------|
| `pulse-dot` | Pulsing indicator dots |
| `ticker` | Horizontal scrolling ticker |
| `fade-in-up` | Entry animation |
| `blink` | Cursor blinking |
| `glitch` | Glitch effect on hover |
| `rotate-border` | Animated gradient border |

### Usage

```css
.pulse-dot {
  animation: pulse-dot 2s ease-in-out infinite;
}

.ticker-scroll {
  animation: ticker 30s linear infinite;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}
```

### Staggered Animations

```html
<div class="stagger-children">
  <div>Item 1</div> <!-- delay: 0.1s -->
  <div>Item 2</div> <!-- delay: 0.2s -->
  <div>Item 3</div> <!-- delay: 0.3s -->
</div>
```

---

## Logo

### Mark
A stylized "E" in a square container with the primary color background.

```html
<svg viewBox="0 0 32 32" class="h-8 w-8">
  <rect class="fill-primary" height="32" rx="2" width="32" />
  <path class="fill-primary-foreground" d="M8 8h16v3H11v5h11v3H11v5h13v3H8V8z" />
</svg>
```

### Wordmark
```html
<span class="font-mono text-sm font-medium uppercase tracking-tight">
  Edge<span class="text-primary">Journal</span>
</span>
```

---

## CSS Variables Reference

```css
:root {
  /* Core */
  --background: #050505;
  --foreground: #fafafa;
  --primary: #d4ff00;
  --primary-foreground: #050505;
  --accent: #00d4ff;
  --accent-foreground: #050505;
  
  /* Surfaces */
  --card: #0a0a0a;
  --secondary: #141414;
  --muted: #1a1a1a;
  --muted-foreground: #737373;
  --border: #1f1f1f;
  
  /* Semantic */
  --destructive: #ff3b3b;
  --profit: #00ff88;
  --loss: #ff3b3b;
  --breakeven: #ffd700;
}
```

---

## Design Principles

1. **Terminal Aesthetic**: Draw inspiration from trading terminals, IDEs, and command-line interfaces
2. **High Contrast**: Use the chartreuse accent sparingly for maximum impact
3. **Data-First**: Prioritize data visibility and readability over decorative elements
4. **Sharp & Precise**: Minimal border-radius, precise spacing, clean lines
5. **Dark-First**: Designed for extended use in low-light conditions
6. **Motion with Purpose**: Use animation to guide attention, not distract

---

## File Structure

```
src/
├── styles/
│   └── globals.css          # All CSS variables, utilities, and effects
├── app/
│   ├── layout.tsx           # Font loading, providers
│   └── (marketing)/
│       └── _components/     # Landing page components
│           ├── navbar.tsx
│           ├── hero.tsx
│           ├── features.tsx
│           ├── ai-showcase.tsx
│           ├── pricing.tsx
│           ├── cta.tsx
│           └── footer.tsx
└── components/
    └── ui/                  # Shadcn UI components (styled to match)
```

