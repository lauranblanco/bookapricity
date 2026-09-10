# Prompt: Members y Billing

Úsalo si ya has hecho los pasos 1–6 del `PROMPT.md` principal (tokens, primitivas, navs, Book a slot, tablas, ResourceForm) y quieres abordar solo estas dos pantallas. Si empiezas de cero, usa `PROMPT.md`.

---

Vamos a rediseñar **Members** y **Billing** del panel de admin de BookApricity.

Lee primero, en este orden:

1. `design_handoff_bookapricity/README.md` → secciones **12. Members**, **13. Billing** y la tabla de **datos que no existen** (`4e`). Ahí están las medidas, hex, tipografía y copy exactos.
2. `design_handoff_bookapricity/BookApricity.dc.html` → busca los badges `4a` (Members escritorio), `4b` (Members móvil), `4c` (Billing sin plan), `4d` (Billing activo e impagado), `4e` (datos que faltan). **Las tarjetas, badges y anotaciones en español son andamiaje del board, no parte del producto.**
3. El código actual: `src/app/dashboard/members/page.tsx`, `members/CopyInviteLink.tsx`, `dashboard/billing/page.tsx`, `billing/SubscribeButton.tsx`, `src/lib/paddle/actions.ts`.

## Reglas

- **No toques el flujo de pago.** `createCheckoutTransaction()` + `Paddle.Checkout.open({ transactionId })` se quedan como están; solo se viste el botón y sus estados (`!paddleReady` y `isSubmitting` → opacidad .45 y etiqueta `Starting checkout…`; error en bloque encima del botón, nunca en su lugar).
- **No toques la lógica de copiado.** El `setTimeout` de 2s de `CopyInviteLink` ya funciona; lo que cambia es que durante esos 2s el contenedor pasa a borde `#2F6B4F` y fondo `#E6F0E9`.
- Alta fidelidad: hex, tamaños y pesos exactos del README. Radio 0 en todo, sin sombras, etiquetas de botón flush left.
- Tipografía: Fredoka en titulares y nombres, Figtree en cuerpo y emails, **IBM Plex Mono en la URL de invitación, fechas, contadores y etiquetas en mayúsculas**.
- El copy en inglés del README es el copy final, incluidos errores y estados vacíos.

## Orden

1. **Members escritorio** — bloque de invitación (botón pegado al campo, a todo el alto), filtros de rol con recuento, tabla con badges de rol y acciones ghost en la fila.
2. **Members: vacío y móvil** — estado "solo estás tú" con borde discontinuo y CTA de copiar; en móvil, nav de 4 pestañas abreviadas y la tabla convertida en lista.
3. **Billing sin plan** — tarjeta de estado + tarjeta de venta con barra umbral, los cuatro puntos numerados, y los tres estados del botón de Paddle.
4. **Billing activo** — tarjeta verde con fecha de renovación, `Manage subscription`, y la lista de invoices.
5. **Impago** — badge `PAST DUE` en el nav de **todas** las pantallas de admin, más el banner ámbar en Billing con `Update payment` en resol.

## Sobre lo que aún no existe

`Bookings · 30d`, `Make admin`, `Remove member`, `Regenerate link`, la fecha de renovación, los invoices y el estado `past_due` **necesitan queries, acciones o webhooks nuevos** (lista completa en el README).

Dime antes de empezar cuáles de esos vas a implementar y cuáles dejas fuera. Para los que queden fuera: **elimina la columna, la fila o el bloque entero** — nada de celdas vacías, guiones ni botones que no hacen nada.

Empieza por el paso 1 y para para que lo revise antes de seguir.
