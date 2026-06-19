# LoopThru Web

React, TypeScript, Tailwind CSS, React Router, and TanStack Query starter for the LoopThru landing page and review request demo.

## Prerequisites

- Node.js 22 or newer
- npm

## Install

```bash
npm install
```

On Windows PowerShell, if `npm` is blocked by the local script execution policy, use:

```bash
npm.cmd install
```

## Run Locally

```bash
npm run dev
```

PowerShell alternative:

```bash
npm.cmd run dev
```

The dev server starts at:

```text
http://127.0.0.1:5173
```

## Build

```bash
npm run build
```

PowerShell alternative:

```bash
npm.cmd run build
```

The production output is written to `dist/`.

## Preview Production Build

```bash
npm run preview
```

PowerShell alternative:

```bash
npm.cmd run preview
```

## Test

```bash
npm test
```

PowerShell alternative:

```bash
npm.cmd test
```

## Deploy on Render

This app uses React Router with browser URLs such as `/demo`. Render must rewrite
unknown paths to `index.html` so the client-side router can render those pages.

If the service is managed from this repo as a Blueprint, `render.yaml` contains
the required static-site rewrite. If the Render service was created manually, add
this rewrite in the Render dashboard:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```
