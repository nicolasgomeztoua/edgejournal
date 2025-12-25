# EdgeJournal Design System

## "The Terminal" Design Language

A high-end trading terminal aesthetic meets brutalist design. Obsidian blacks with electric chartreuse accents, monospace typography for data, and sharp geometric shapes. Every element should feel like it belongs in a professional trading terminal.

---

## Design Philosophy

### Core Principles

1. **Terminal-First**: Every UI element should feel like it came from a trading terminal or command-line interface
2. **Data-Dense**: Prioritize information density over whitespace—traders want to see their data
3. **High Contrast**: Use color sparingly but with maximum impact when used
4. **Dark by Default**: Designed for extended use in low-light conditions
5. **Monospace Everything**: Labels, buttons, navigation, stats—all use monospace
6. **Brutalist Precision**: Sharp edges, minimal border-radius, precise spacing

### The "Lightning in a Bottle" Formula

What makes the homepage feel special:
- **Terminal window chrome** (traffic light dots) on preview cards
- **Command prompt characters** (`$`, `→`, `>`) for interactive elements
- **Typewriter effects** with blinking cursors for AI/dynamic content
- **Ultra-subtle backgrounds** (`bg-white/[0.01]`) that create depth without distraction
- **Gradient glow orbs** that create atmosphere without being distracting
- **Monospace uppercase tracking-wider** on all interactive elements

---

## Color Palette

### Primary Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| **Obsidian Black** | `#050505` | `--background` | Primary background |
| **Electric Chartreuse** | `#d4ff00` | `--primary` | Primary accent, CTAs, highlights |
| **Ice Blue** | `#00d4ff` | `--accent` | Secondary accent, AI elements |
| **Pure White** | `#fafafa` | `--foreground` | Primary text |

### Semantic Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| **Profit Green** | `#00ff88` | `--profit` | Positive P&L, success states |
| **Loss Red** | `#ff3b3b` | `--loss` | Negative P&L, errors, destructive |
| **Breakeven Gold** | `#ffd700` | `--breakeven` | Neutral, warnings |

### Surface Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Card** | `#0a0a0a` | Card backgrounds |
| **Secondary** | `#141414` | Input fields, secondary surfaces |
| **Muted** | `#1a1a1a` | Subtle backgrounds |
| **Border** | `#1f1f1f` | Borders, dividers |

### Opacity Scale (Critical!)

Use these opacity values consistently for subtle layering:

| Pattern | Usage |
|---------|-------|
| `bg-white/[0.01]` | Barely visible card background |
| `bg-white/[0.02]` | Subtle card/element background |
| `bg-white/[0.05]` | More visible background |
| `border-white/5` | Default subtle border |
| `border-white/10` | Medium visibility border |
| `border-white/20` | High visibility border (hover states) |
| `bg-primary/[0.02]` | Highlighted element background |
| `bg-primary/5` | Accent background |
| `bg-primary/10` | Strong accent background |
| `border-primary/20` | Highlighted border |
| `border-primary/40` | Highlighted hover border |
| `border-primary/50` | Active/selected border |

---

## Typography

### Font Stack

```css
/* Display & Body - Geist Sans (loaded via Next.js) */
--font-sans: 'Geist Sans', ui-sans-serif, system-ui, sans-serif;

/* Monospace - JetBrains Mono (for EVERYTHING interactive) */
--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
```

### The Golden Rule: Monospace for UI

**Use `font-mono` for:**
- All buttons and CTAs
- Navigation links
- Labels and captions
- Data values (prices, stats, percentages)
- Badges and pills
- Form labels
- Section headers (the small ones above headlines)
- Table headers
- Input placeholders

**Use `font-sans` for:**
- Large headlines (h1, h2)
- Body paragraphs
- Descriptive text
- Long-form content

### Type Scale

| Element | Classes | Example |
|---------|---------|---------|
| Hero Headline | `text-6xl lg:text-7xl font-bold tracking-tight` | "Find Your Trading Edge" |
| Section Headline | `text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight` | "Everything you need to..." |
| Section Label | `font-mono text-xs text-primary uppercase tracking-wider` | "FEATURES" |
| Card Title | `font-semibold text-lg` | "Trade Journal" |
| Body Text | `font-mono text-base text-muted-foreground` | Description paragraphs |
| Supporting Text | `font-mono text-sm text-muted-foreground` | Secondary descriptions |
| Micro Label | `font-mono text-[10px] text-muted-foreground uppercase tracking-wider` | "NET P&L" |
| Data Value | `font-mono font-bold text-lg` | "$2,847.50" |
| Button Text | `font-mono text-xs uppercase tracking-wider` | "START FREE" |
| Nav Link | `font-mono text-xs uppercase tracking-wider text-muted-foreground` | "FEATURES" |

### Line Heights

```css
/* Headlines - tight to prevent excessive spacing */
h1, h2, h3 { line-height: 1.15; }

/* Body - relaxed for readability */
p { line-height: 1.6; }

/* Buttons and interactive elements */
button, a { line-height: 1.5; }

/* Monospace text */
.font-mono { line-height: 1.6; }
```

---

## Spacing

### Section Spacing

| Pattern | Value | Usage |
|---------|-------|-------|
| Section padding | `py-32` | Between major sections |
| Section header margin | `mb-16` to `mb-20` | Below section headers |
| Container max-width | `max-w-6xl` or `max-w-5xl` | Main content container |
| Container padding | `px-6` | Horizontal padding |

### Component Spacing

| Pattern | Value | Usage |
|---------|-------|-------|
| Card padding | `p-6` | Standard card |
| Card padding (dense) | `p-3` to `p-4` | Data-dense cards |
| Grid gap | `gap-3` to `gap-4` | Between grid items |
| Stack gap | `space-y-2` to `space-y-4` | Vertical stacking |
| Inline gap | `gap-2` to `gap-3` | Inline elements |

---

## Components

### Buttons

**Primary Button**
```html
<button class="h-12 px-8 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider rounded">
  Start Free
  <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
</button>
```

**Outline Button**
```html
<button class="h-12 px-8 border border-white/10 bg-transparent hover:border-white/20 font-mono text-xs uppercase tracking-wider rounded">
  Watch Demo
</button>
```

**Small Button**
```html
<button class="h-9 px-4 font-mono text-xs uppercase tracking-wider">
  Button
</button>
```

### Cards

**Standard Card**
```html
<div class="rounded border border-white/5 bg-white/[0.01] p-6 hover:border-white/10 transition-all">
  <!-- content -->
</div>
```

**Highlighted Card**
```html
<div class="rounded border border-primary/20 bg-primary/[0.02] p-6 hover:border-primary/40 transition-all">
  <!-- content -->
</div>
```

**Data Card (Dense)**
```html
<div class="rounded border border-white/5 bg-white/[0.02] p-3">
  <div class="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
    Label
  </div>
  <div class="font-mono font-bold text-lg">$2,847.50</div>
  <div class="font-mono text-[10px] text-muted-foreground">47 trades</div>
</div>
```

### Terminal Window

The signature element—use this for any preview/demo content:

```html
<div class="overflow-hidden rounded border border-white/10 bg-black/80 shadow-2xl">
  <!-- Terminal header with traffic light dots -->
  <div class="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-2">
    <div class="flex items-center gap-2">
      <div class="h-2.5 w-2.5 rounded-full bg-loss/60" />
      <div class="h-2.5 w-2.5 rounded-full bg-breakeven/60" />
      <div class="h-2.5 w-2.5 rounded-full bg-profit/60" />
    </div>
    <span class="font-mono text-[10px] text-muted-foreground">
      edgejournal — dashboard
    </span>
    <div class="w-14" /> <!-- Spacer for centering -->
  </div>
  
  <!-- Terminal content -->
  <div class="p-6">
    <!-- content -->
  </div>
</div>
```

### Status Badge

```html
<div class="inline-flex items-center gap-3 rounded-none border border-white/10 bg-white/[0.02] px-4 py-2">
  <span class="pulse-dot h-2 w-2 rounded-full bg-profit" />
  <span class="font-mono text-xs text-muted-foreground uppercase tracking-wider">
    Now in public beta
  </span>
</div>
```

### AI/Accent Badge

```html
<div class="inline-flex items-center gap-2 rounded-none border border-accent/20 bg-accent/5 px-4 py-2">
  <Sparkles class="h-4 w-4 text-accent" />
  <span class="font-mono text-xs text-accent uppercase tracking-wider">
    AI-Powered
  </span>
</div>
```

### Section Header Pattern

Every section should follow this structure:

```html
<div class="mb-16 max-w-2xl">
  <!-- Label -->
  <span class="mb-4 inline-block font-mono text-xs text-primary uppercase tracking-wider">
    Features
  </span>
  
  <!-- Headline -->
  <h2 class="font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight">
    Everything you need to{" "}
    <span class="text-primary">find your edge</span>
  </h2>
  
  <!-- Subheadline -->
  <p class="mt-6 font-mono text-base text-muted-foreground">
    A complete toolkit for serious traders who want to consistently improve.
  </p>
</div>
```

### Navigation Link

```html
<a class="font-mono text-xs text-muted-foreground uppercase tracking-wider transition-colors hover:text-primary" href="#">
  Features
</a>
```

### Data Row (Trade List Item)

```html
<div class="flex items-center justify-between rounded bg-white/[0.02] px-2 py-1">
  <div class="flex items-center gap-2">
    <span class="font-mono text-[10px] text-muted-foreground">ES</span>
    <span class="font-mono text-[10px] text-profit">LONG</span>
  </div>
  <span class="font-mono font-medium text-[10px] text-profit">+$425.00</span>
</div>
```

### Stat Display

```html
<div class="text-center">
  <div class="font-mono font-bold text-3xl sm:text-4xl text-primary">
    +32%
  </div>
  <div class="mt-2 font-mono text-xs text-muted-foreground uppercase tracking-wider">
    Avg Win Rate Gain
  </div>
</div>
```

### Feature Icon Container

```html
<!-- Standard -->
<div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded bg-white/5">
  <Icon class="h-5 w-5 text-muted-foreground" />
</div>

<!-- Highlighted -->
<div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded bg-primary/10">
  <Icon class="h-5 w-5 text-primary" />
</div>
```

### Tags/Pills

```html
<span class="rounded border border-white/10 bg-white/[0.02] px-2 py-1 font-mono text-xs">
  Breakout
</span>
```

### Progress Bar

```html
<div class="h-2 overflow-hidden rounded-full bg-white/5">
  <div class="h-full w-3/4 bg-gradient-to-r from-primary to-accent" />
</div>
```

### Command Prompt Line

For AI chat or terminal-style interfaces:

```html
<!-- User input -->
<div class="flex items-start gap-3">
  <span class="font-mono text-sm text-primary">$</span>
  <span class="font-mono text-sm">Your command here</span>
</div>

<!-- AI response -->
<div class="flex items-start gap-3">
  <span class="font-mono text-sm text-accent">→</span>
  <span class="font-mono text-sm text-muted-foreground">Response here</span>
</div>
```

---

## Interactive States

### Hover States

| Element | Default | Hover |
|---------|---------|-------|
| Card border | `border-white/5` | `border-white/10` |
| Highlighted card | `border-primary/20` | `border-primary/40` |
| Nav link | `text-muted-foreground` | `text-primary` |
| Button with arrow | normal | `group-hover:translate-x-1` |

### Focus States

```css
.focus-ring:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

---

## Backgrounds & Effects

### Grid Background

```html
<div class="grid-bg absolute inset-0 opacity-50" />
```

```css
.grid-bg {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 80px 80px;
}
```

### Gradient Orbs

Floating blur orbs that create atmosphere:

```html
<!-- Primary glow (left) -->
<div class="absolute top-1/4 -left-32 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />

<!-- Accent glow (right) -->
<div class="absolute bottom-1/4 -right-32 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[120px]" />
```

### Scanlines (Subtle)

```html
<div class="scanlines pointer-events-none absolute inset-0" />
```

### Text Glow

```html
<span class="text-glow-primary text-primary">Trading Edge</span>
<span class="text-glow-accent text-accent">your trading</span>
```

### Gradient Overlays

Bottom fade for content cutoff:
```html
<div class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
```

Section gradient:
```html
<div class="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
```

---

## Animations

### Keyframes Available

| Name | Class | Usage |
|------|-------|-------|
| `pulse-dot` | `.pulse-dot` | Status indicator dots |
| `ticker` | `.ticker-scroll` | Horizontal scrolling ticker |
| `fade-in-up` | `.animate-fade-in-up` | Entry animations |
| `blink` | `.cursor-blink::after` | Typing cursor |
| `glitch` | `.glitch-hover:hover` | Glitch effect on hover |
| `rotate-border` | `.animated-border` | Animated gradient border |

### Staggered Animations

```html
<div class="stagger-children">
  <div>Item 1</div> <!-- delay: 0.1s -->
  <div>Item 2</div> <!-- delay: 0.2s -->
  <div>Item 3</div> <!-- delay: 0.3s -->
</div>
```

### Typewriter Effect (React)

```tsx
function TypewriterText({ text, speed = 15 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {!isComplete && <span className="animate-pulse text-primary">▌</span>}
    </span>
  );
}
```

### Animated Counter (React)

```tsx
function AnimatedCounter({ end, suffix = "", prefix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easeOut));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}
```

---

## Data Visualization

### Bar Chart Gradient

```html
<div class="flex-1 rounded-t bg-gradient-to-t from-primary/60 to-primary/30" style="height: 80%" />
```

### Positive/Negative Chart Bars

```tsx
const isPositive = value >= 0;
return (
  <div
    className={`flex-1 rounded-t transition-all ${
      isPositive
        ? "bg-gradient-to-t from-primary/60 to-primary/30"
        : "bg-gradient-to-t from-loss/60 to-loss/30"
    }`}
    style={{ height: `${Math.abs(value)}%` }}
  />
);
```

### P&L Display Pattern

```tsx
const formatPnl = (value: number) => {
  const prefix = value >= 0 ? "+$" : "-$";
  return `${prefix}${Math.abs(value).toLocaleString("en-US", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

<span className={`font-mono font-bold ${value >= 0 ? "text-profit" : "text-loss"}`}>
  {formatPnl(value)}
</span>
```

---

## Logo

### Mark

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

## Page Layouts

### Marketing Section

```html
<section class="relative py-32">
  <!-- Background effects -->
  <div class="grid-bg absolute inset-0 opacity-50" />
  
  <div class="relative mx-auto max-w-6xl px-6">
    <!-- Section header -->
    <div class="mb-16 max-w-2xl">
      <span class="mb-4 inline-block font-mono text-xs text-primary uppercase tracking-wider">
        Section Label
      </span>
      <h2 class="font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight">
        Headline with <span class="text-primary">accent</span>
      </h2>
      <p class="mt-6 font-mono text-base text-muted-foreground">
        Subheadline description text.
      </p>
    </div>
    
    <!-- Content -->
    <!-- ... -->
  </div>
</section>
```

### App Dashboard Layout

```html
<div class="min-h-screen bg-background">
  <!-- Sidebar -->
  <aside class="fixed left-0 top-0 h-full w-64 border-r border-border bg-sidebar">
    <!-- ... -->
  </aside>
  
  <!-- Main content -->
  <main class="ml-64 p-6">
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="font-bold text-2xl tracking-tight">Page Title</h1>
      <p class="font-mono text-sm text-muted-foreground">Description</p>
    </div>
    
    <!-- Grid of data cards -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <!-- Stat cards -->
    </div>
    
    <!-- Content area -->
    <div class="rounded border border-white/5 bg-white/[0.01] p-6">
      <!-- ... -->
    </div>
  </main>
</div>
```

---

## Quick Reference Cheat Sheet

### Must-Have Classes for Consistency

```
BUTTONS:        font-mono text-xs uppercase tracking-wider
NAV LINKS:      font-mono text-xs uppercase tracking-wider text-muted-foreground
LABELS:         font-mono text-[10px] text-muted-foreground uppercase tracking-wider
DATA VALUES:    font-mono font-bold text-lg
CARD BG:        bg-white/[0.02] border border-white/5 rounded
HIGHLIGHTED:    bg-primary/[0.02] border border-primary/20 rounded
PROFIT:         text-profit (green)
LOSS:           text-loss (red)
SECTION:        py-32 relative
CONTAINER:      max-w-6xl mx-auto px-6
```

### Color Usage Rules

1. **Primary (Chartreuse)**: CTAs, important highlights, section labels, active states
2. **Accent (Ice Blue)**: AI features, secondary highlights, info states
3. **Profit (Green)**: Positive P&L, success, confirmations
4. **Loss (Red)**: Negative P&L, errors, destructive actions
5. **Breakeven (Gold)**: Neutral states, warnings
6. **Muted-foreground**: All secondary text, descriptions, placeholders

### Border Radius Rules

- Cards: `rounded` (4px)
- Small elements: `rounded-sm` (2px)
- Buttons: `rounded` (4px)
- Pills/badges: `rounded` (4px) or `rounded-full` for circles
- Never use large border radius (`rounded-lg`, `rounded-xl`)

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
  
  /* Radius */
  --radius: 4px;
}
```

---

## File Structure

```
src/
├── styles/
│   └── globals.css          # All CSS variables, utilities, and effects
├── app/
│   ├── layout.tsx           # Font loading (Geist Sans, JetBrains Mono)
│   ├── (marketing)/
│   │   └── _components/     # Landing page components (reference)
│   └── (protected)/
│       └── _components/     # App components (apply design system here)
└── components/
    └── ui/                  # Shadcn UI components (styled to match)
```
