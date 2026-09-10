# Fonts

All three are SIL Open Font License — free for commercial use.

## next/font (preferred in this repo)
```ts
// src/app/fonts.ts
import { Fredoka, Figtree, IBM_Plex_Mono } from 'next/font/google';
export const fredoka = Fredoka({ subsets:['latin'], weight:['400','500','600'], variable:'--font-heading' });
export const figtree = Figtree({ subsets:['latin'], weight:['400','500','600','700'], variable:'--font-body' });
export const plexMono = IBM_Plex_Mono({ subsets:['latin'], weight:['400','500'], variable:'--font-mono' });
```
Apply `${fredoka.variable} ${figtree.variable} ${plexMono.variable}` on `<html>`, set `font-family: var(--font-body)` on body.

## Roles
| Family | Weights | Where |
| --- | --- | --- |
| Fredoka | 500 (≥20px), 600 (<20px) | h1–h4, wordmark, resource names, button labels, big numbers |
| Figtree | 400, 600 | body copy, descriptions, table cells, helper text, links |
| IBM Plex Mono | 400, 500 | times (13:00), dates, uppercase labels, badges, counts, emails |

Rule of thumb: **if it is a number, a time, or an ALL-CAPS label, it is mono.**