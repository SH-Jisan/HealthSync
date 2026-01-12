# HealthSync Design System & Theme

This directory contains the central styling architecture for the HealthSync application. It is designed to provide a consistent, premium UI across all pages.

## File Structure

- **`design_tokens.css`**: The source of truth for all variables.
  - **Colors**: Primary brand (Teal/Green), Secondary, Neutral, and Semantic colors.
  - **Typography**: Font sizes and families.
  - **Effects**: Shadows, Border Radius, and Animation curves.
  - **Spacing**: Global spacing and sizing constants.

- **`ui_templates.css`**: Ready-to-use utility classes for common UI patterns.
  - **Glassmorphism**: `.t-card-glass`, `.t-glass-nav`.
  - **Buttons**: `.t-btn-primary`, `.t-btn-secondary`.
  - **Layout**: `.t-section-padding`, `.t-grid-auto`.
  - **Typography**: `.t-section-title`, `.t-text-gradient`.

## Usage Guide

To use the theme in your components, simply use the `t-` prefixed classes or the CSS variables defined in `:root`.

### Example: Creating a new Feature Section

```tsx
import styles from './MyPage.module.css'; // Your local overrides if needed

export default function MyPage() {
  return (
    <section className="t-section-padding">
        {/* Title */}
        <div className="text-center mb-10">
            <h2 className="t-section-title">My Premium Section</h2>
            <div className="t-title-underline"></div>
        </div>

        {/* Grid */}
        <div className="t-grid-auto">
            {/* Card */}
            <div className="t-card-glass p-6">
                <h3 className="text-xl font-bold mb-2">Feature 1</h3>
                <p className="text-gray-600">Description here...</p>
            </div>
        </div>
    </section>
  );
}
```

### Extending variables
You can access variables in your CSS Modules:

```css
.myComponent {
    color: var(--primary);
    box-shadow: var(--shadow-lg);
    transition: transform 0.3s var(--ease-spring);
}
```
