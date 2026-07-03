---
name: Proton Billing System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3d494b'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6d797c'
  outline-variant: '#bcc9cc'
  surface-tint: '#006876'
  primary: '#006876'
  on-primary: '#ffffff'
  primary-container: '#14a3b8'
  on-primary-container: '#00333a'
  inverse-primary: '#61d6ec'
  secondary: '#286292'
  on-secondary: '#ffffff'
  secondary-container: '#94c8fe'
  on-secondary-container: '#145483'
  tertiary: '#575f67'
  on-tertiary: '#ffffff'
  tertiary-container: '#8d969e'
  on-tertiary-container: '#262f35'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a2efff'
  primary-fixed-dim: '#61d6ec'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#cfe5ff'
  secondary-fixed-dim: '#99cbff'
  on-secondary-fixed: '#001d34'
  on-secondary-fixed-variant: '#004a78'
  tertiary-fixed: '#dbe4ed'
  tertiary-fixed-dim: '#bfc8d0'
  on-tertiary-fixed: '#141d23'
  on-tertiary-fixed-variant: '#3f484f'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-desktop: 32px
  margin-mobile: 16px
---

## Brand & Style

The design system is built for an Electronic Service Provider (ESP) environment, where clarity, precision, and trust are paramount. The brand personality is authoritative yet accessible, designed to transform complex financial and technical data into actionable insights.

The visual style is **Corporate / Modern**. It prioritizes a high information density without sacrificing legibility. It utilizes a refined color palette derived from technical monitoring interfaces, employing a "data-first" philosophy. The interface uses subtle depth and clear structural hierarchies to guide the user through billing cycles, usage metrics, and account management tasks with absolute confidence.

## Colors

The color palette is anchored by a vibrant **Teal Primary**, used for key actions and progress indicators to maintain high visibility. The **Navy Secondary**, extracted from the heritage monitoring logo, is used for structural elements such as sidebars and headers to provide a sense of stability and institutional trust.

The neutral palette favors cool grays to keep the workspace feeling sterile and professional. Status colors are strictly reserved for functional feedback (success, error, warning) to ensure that the billing state of a service is never misinterpreted. Backgrounds use a tiered light-gray system to separate content areas without the need for heavy line work.

## Typography

This design system utilizes **Hanken Grotesk** across all levels. This choice provides a sharp, contemporary "tech" aesthetic that remains highly legible in data-heavy billing tables. 

Headlines use a tighter letter-spacing and heavier weights to establish a clear hierarchy. Labels are set in uppercase with increased letter-spacing to distinguish metadata from primary body content. For mobile devices, headline sizes scale down to prevent excessive line-wrapping, ensuring that financial totals and account IDs remain prominent and readable on smaller screens.

## Layout & Spacing

The layout follows a **12-column fluid grid** for desktop, optimized for complex dashboards and multi-column billing statements. 

- **Desktop:** 32px outer margins with 24px gutters between columns.
- **Tablet:** 24px outer margins, switching to an 8-column layout.
- **Mobile:** 16px outer margins, utilizing a single-column reflow for all content cards.

The spacing rhythm is strictly based on an 8px scale. This ensures vertical rhythm across different component heights, such as form inputs and buttons, which is essential for maintaining the "clean" and "organized" feel required for financial software.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Low-contrast Outlines**. Rather than aggressive shadows, the system uses background color shifts to indicate different functional zones.

- **Level 0 (Surface):** The main background using the neutral light-gray.
- **Level 1 (Card):** White surfaces with a subtle 1px border (`#DEE2E6`) to define content areas like billing summaries or usage charts.
- **Level 2 (Interactive):** When an element is hovered or active, a soft, diffused ambient shadow (Color: Navy, Opacity: 8%, Blur: 12px) is applied to suggest lift.
- **Overlays:** Modals and dropdowns use a slightly more pronounced shadow with a semi-transparent backdrop blur to maintain context while focusing user attention.

## Shapes

The shape language is defined as **Soft**. Standard components like buttons and input fields utilize a 0.25rem (4px) corner radius. Large containers, such as dashboard cards, utilize a 0.5rem (8px) radius.

This subtle rounding strikes a balance between the precision of sharp edges (often associated with technical monitoring) and the friendliness of modern SaaS applications. It ensures that the UI feels calculated and professional without appearing dated or overly rigid.

## Components

### Buttons
Primary buttons are solid Teal (`#14A3B8`) with white text, utilizing bold typography. Secondary buttons use the Navy outline or text. For billing "Pay" actions, the primary teal is the default to drive conversion.

### Input Fields
Inputs use a white background with a 1px gray border. Focus states must use a 2px Teal glow to provide clear visual feedback during data entry. Validation messages must appear immediately below the field in the Error Red color.

### Data Tables
Tables are the core of the billing application. They should feature:
- Subtle row striping (using the Neutral light-gray).
- Fixed headers for long usage lists.
- Monospaced numerical alignment for currency and usage units to ensure decimals align perfectly.

### Status Chips
Small, low-profile pills used to indicate invoice status (e.g., "Paid", "Pending", "Overdue"). These should use light tinted backgrounds of the status colors with high-contrast text for accessibility.

### Cards
Used for dashboard metrics. Cards should have a clear title in the `label-md` style and a prominent value in `headline-lg` to allow for quick scanning of account health.