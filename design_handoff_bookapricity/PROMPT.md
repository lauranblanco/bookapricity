# Prompt para Claude Code

Copia y pega esto en Claude Code, con la carpeta `design_handoff_bookapricity/` dentro del repo (o accesible desde él).

---

Estoy rediseñando **BookApricity**, la app de reservas para clubes del grupo Umbricity. El código ya funciona; lo que falta es la capa visual y tres mejoras de UX concretas.

En `design_handoff_bookapricity/` tienes el paquete de diseño completo. **Léelo entero antes de escribir código**, en este orden:

1. `README.md` — la especificación. Contiene los tokens, la identidad, y una sección por pantalla con medidas, colores, tipografía y copy exactos.
2. `tokens/tailwind.config.snippet.ts` y `tokens/fonts.md` — lo primero que hay que aplicar.
3. `BookApricity.dc.html` — el board de diseño. Ábrelo o léelo como HTML: cada pantalla es una tarjeta con un badge (`1d`, `1h`…) y anotaciones en español. **Las tarjetas, los badges y las anotaciones son andamiaje del board, no parte del producto.**

## Reglas del encargo

- Los archivos HTML son **referencia de diseño, no código a copiar**. Recrea los diseños en el codebase existente: Next.js App Router, Tailwind, Supabase, Server Components donde ya los hay, y los componentes cliente que ya existen (`BookSlotButton`, `CancelReservationButton`, `ResourceForm`). No metas una librería de UI nueva.
- **No toques la lógica de negocio ni la capa de datos**: reservas, auth, permisos, queries y rutas se quedan como están. Las tres mejoras de UX del README se construyen encima de la lógica actual, sin cambiar su contrato.
- Es **alta fidelidad**: usa los hex, tamaños y pesos exactos del README. Si un valor no aparece, deriva del token más cercano en lugar de inventarlo.
- **Radio 0 en absolutamente todo.** Sin sombras en la UI de producto. Etiquetas de botón alineadas a la izquierda, no centradas.
- Tipografía: Fredoka en titulares y marca, Figtree en cuerpo, IBM Plex Mono en horas, números y etiquetas en mayúsculas. Si es un número, una hora o una etiqueta EN MAYÚSCULAS, va en mono.
- Los datos del board son de ejemplo (Riverside Tennis Club, 10 Sep, marc@gmail.com). Usa los datos reales de la app.
- El copy en inglés del board es el copy final; respétalo tal cual, incluidos los textos de error y de estado vacío.

## Plan

Trabaja en este orden y **para al final de cada paso para que yo lo revise** antes de seguir:

1. **Fundamentos** — fuentes con `next/font/google`, tokens en `tailwind.config.ts`, resets en `globals.css`, favicon y app icon desde `brand/`.
2. **Primitivas** — botón (primario / secundario / ghost / destructivo), input, select, badge, bloque de error, tabla. Un archivo por primitiva, siguiendo la convención de componentes que ya use el repo.
3. **Los dos navs** — admin sobre umbral sólido, miembro sobre crema con regla de 2px. Misma retícula, subrayado resol de 3px en la pestaña activa.
4. **Book a slot** — la pantalla con más diseño nuevo: franjas agrupadas por tramo del día, plazas restantes por franja, y confirmación con *Undo* (panel lateral en escritorio, barra fija en móvil) en lugar de un paso de confirmación.
5. **Reservations (admin) y My reservations** — tabla, filtros, badges, y los estados vacíos con su copy.
6. **ResourceForm** — el editor visual de horas semanales, con la variante de presets por debajo de 640px. Los `input type="time"` reales tienen que seguir funcionando con teclado.
7. **Home y auth** — home, login, signup, join club, create club.
8. **Accesibilidad** — focus visible `2px solid #35486B` con offset 2px en todo lo interactivo, objetivos de 44px en móvil, `aria-pressed` en las franjas, contraste de badges.

Empieza por el paso 1. Antes de escribir nada, dime qué has entendido del sistema visual y señálame cualquier punto donde el diseño choque con un patrón que ya exista en el codebase — prefiero resolver esos conflictos antes que descubrirlos a mitad.
