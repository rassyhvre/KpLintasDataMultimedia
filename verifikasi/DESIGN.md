---
name: Nexus Payment Portal
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#3f4850'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#6f7881'
  outline-variant: '#bec7d2'
  surface-tint: '#006494'
  primary: '#006190'
  on-primary: '#ffffff'
  primary-container: '#007bb5'
  on-primary-container: '#fcfcff'
  inverse-primary: '#8ecdff'
  secondary: '#5355aa'
  on-secondary: '#ffffff'
  secondary-container: '#a0a3fe'
  on-secondary-container: '#333589'
  tertiary: '#595c5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#727577'
  on-tertiary-container: '#fbfdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cbe6ff'
  primary-fixed-dim: '#8ecdff'
  on-primary-fixed: '#001e30'
  on-primary-fixed-variant: '#004b71'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#0a0566'
  on-secondary-fixed-variant: '#3b3d90'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  price-display:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system for the ISP payment portal is built on the foundations of **trust, efficiency, and clarity**. As a utility service interface, the primary goal is to facilitate seamless financial transactions while providing a sense of stability and technical reliability.

The visual direction follows a **Corporate Modern** style with **Minimalist** tendencies. It avoids unnecessary decorative elements in favor of functional hierarchy, utilizing generous whitespace to reduce cognitive load during the payment process. The aesthetic is professional and "utility-first," ensuring that users can find billing information and complete payments with zero friction.

**Target Audience:** Residential and business customers who value speed, security, and clear records of their service usage and payments.

## Colors

The palette is directly derived from the PT Lintas Data Multimedia identity, focusing on a professional spectrum of blues.

- **Primary (#0093D7):** A vibrant, "ISP Blue" used for primary actions, active states, and brand recognition.
- **Secondary (#3F4195):** A deep indigo-blue used for semantic depth, navigation elements, and secondary emphasis.
- **Surface & Backgrounds:** The design utilizes a hierarchy of cool greys and whites (`#F8FAFC`) to create a layered, clean environment.
- **Semantic Colors:**
    - **Success:** Emerald green for "Paid" statuses and successful transaction confirmations.
    - **Warning/Error:** Crisp red for overdue notices or failed payment attempts.
    - **Information:** The primary blue is used for general account notifications.

## Typography

This design system uses a dual-font strategy to balance character with utility:

1.  **Manrope (Headlines & Numbers):** Chosen for its modern, geometric construction and excellent legibility in numerical data. It is used for currency displays, headers, and key brand touchpoints.
2.  **Inter (Body & UI):** A highly functional grotesque sans-serif used for all UI components, descriptions, and fine print. Its high x-height ensures readability for transaction logs and billing details.

**Financial Clarity:** Prices should always use `price-display` (Manrope Bold) to ensure the amount due is the most prominent element on the page. Labels for "Due Date" or "Invoice Number" should use `label-md` for clear categorization.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **The Logic:** A central "Dashboard Column" (max 800px) is preferred for payment flows to keep the user's focus narrow and directed.
- **Rhythm:** An 8px base unit governs all spacing.
- **Responsiveness:** 
    - **Desktop:** Wide margins and centered content modules.
    - **Tablet:** 24px margins, cards transition to full-width or 2-column stacks.
    - **Mobile:** 16px margins, compacting vertical spacing (`stack-sm`) to keep primary actions above the fold.

## Elevation & Depth

This design system employs a **Tonal Layering** approach combined with **Ambient Shadows** to create a structured hierarchy without visual clutter.

1.  **Level 0 (Canvas):** Background color (`#F8FAFC`).
2.  **Level 1 (Cards/Modules):** Pure white surfaces with a subtle, 1px border (`#E2E8F0`) and an extremely soft, low-opacity blue-tinted shadow (4px blur, 2% opacity).
3.  **Level 2 (Active/Hover):** Increased shadow depth (12px blur, 6% opacity) to indicate interactivity.
4.  **Level 3 (Overlays/Modals):** High-contrast depth with a 20% dark backdrop blur to isolate the payment confirmation process.

Depth is used sparingly to highlight the "current task," such as the active payment method selection.

## Shapes

The shape language is **Rounded**, reflecting a modern and approachable software feel while maintaining professional boundaries.

- **Main Components:** Buttons, inputs, and payment method selectors use a **0.5rem (8px)** radius.
- **Information Containers:** Large billing cards and dashboard sections use **1rem (16px)** to create a distinct visual container.
- **Status Indicators:** Chips for "Paid" or "Pending" utilize a full pill-shape (circular ends) to differentiate them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid `#0093D7` with white text. High-contrast, 0.5rem rounded corners. 
- **Secondary:** Transparent with a `#0093D7` border. Used for "Download PDF" or "View History".
- **Ghost:** No border, secondary blue text. Used for "Cancel" or "Go Back".

### Payment Selection Cards
Interactive cards for payment methods (Virtual Account, QRIS, Credit Card) should feature:
- A 1px border that thickens and changes to Primary Blue when selected.
- A subtle background tint (`#F0F9FF`) when in an active state.
- Clear iconography for the payment provider.

### Input Fields
- Structured with a persistent label above the field.
- Focused state uses a 2px Primary Blue border.
- Error states use a soft red background tint and a red border for immediate feedback.

### Status Chips
- **Paid:** Green background (10% opacity) with dark green text.
- **Unpaid:** Red background (10% opacity) with dark red text.
- **Processing:** Primary blue background (10% opacity) with blue text.

### Data Lists
Line items for invoice breakdowns should use a subtle horizontal divider (`#F1F5F9`) and maintain consistent alignment of currency values to the right.