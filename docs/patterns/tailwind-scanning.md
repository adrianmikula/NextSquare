# Tailwind CSS Scanning & Source Control

## Principle

**Tailwind v4 scans content for class strings. Control that scan explicitly with `@source` in CSS rather than relying on convention.**

By default Tailwind v4 scans the whole project. That is fine for small apps, but in a repo that includes markdown docs, skill files, and scratch content it can pick up invalid or tenant-specific strings and break the CSS build. Use `@source` / `@source not` in `app/globals.css` to constrain the scan to code that can legitimately contain classes.

## Recommended Configuration

```css
@import "tailwindcss";

@source "./app";
@source "./components";
@source "./pages";
@source "./src";

@source not "./docs";
@source not "./skills";
@source not "./content";
@source not "./content/scratch";
@source not "./node_modules";
@source not "./.next";

@theme {
  /* custom theme tokens here */
}
```

This keeps docs, skills, and CMS scratch content out of the Tailwind scan. It is now safe to include real Tailwind class examples inside markdown files.

## If You See a CSS Parse Error

If the build fails from an unexpected source, first check whether a file outside your intended scan paths contains a malformed or dynamic-looking class. Fix the content or tighten the `@source` rules. As a last resort, clear the build cache:

```bash
rm -rf .next
npm run dev
```
