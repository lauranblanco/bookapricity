# Handoff: BookApricity — identidad visual y rediseño de UI

## Overview

BookApricity es la app de reservas de recursos para clubes (pistas, salas, material) del grupo **Umbricity**. El código ya existe y funciona (`lauranblanco/bookapricity`, Next.js App Router + Tailwind + Supabase); lo que falta es la capa visual. Este paquete define la identidad propia de BookApricity —heredada de Umbricity sin copiarla— y el rediseño de las pantallas principales.

El trabajo a hacer no es funcional: **la lógica de reservas, auth y datos se conserva tal cual**. Lo que cambia es el sistema visual (color, tipografía, retícula, componentes), el logo, y tres mejoras concretas de UX que se detallan más abajo (agrupación de franjas por tramo del día, editor de horas semanales, y confirmación con *Undo*).

## About the Design Files

Los archivos de este paquete son **referencias de diseño hechas en HTML** — prototipos que muestran el aspecto y comportamiento previstos, **no código de producción para copiar y pegar**. `BookApricity.dc.html` es un board de diseño: cada pantalla vive dentro de una tarjeta con un badge (`1d`, `1h`…) y anotaciones en español; ni las tarjetas, ni los badges, ni los textos explicativos forman parte del producto.

La tarea es **recrear estos diseños dentro del codebase existente**, con sus patrones actuales: Next.js App Router, Server Components donde ya los hay, Tailwind, y los componentes cliente que ya existen (`BookSlotButton`, `CancelReservationButton`, `ResourceForm`). No introduzcas una librería de UI nueva ni reescribas la capa de datos.

Para ver el board: abre `BookApricity.dc.html` en un navegador (necesita conexión para las fuentes de Google). Los turnos están ordenados con el más reciente arriba; el turno 1 son las pantallas.

## Fidelity

**Alta fidelidad (hifi).** Colores, tipografía, tamaños, pesos y espaciados son finales y están documentados con valores exactos en este README y en `tokens/`. Recrea la UI con fidelidad de píxel usando Tailwind sobre los tokens de `tokens/tailwind.config.snippet.ts`.

Dos matices:
- Los datos son de ejemplo (Riverside Tennis Club, marc@gmail.com, 10 Sep). Usa los datos reales.
- Las tarjetas del board tienen anchos fijos (1040px escritorio, 390px móvil) para poder compararlas. En la app, el layout es fluido: contenedor con `max-w-6xl mx-auto px-6`.

---

## Design Tokens

Los valores completos están en `tokens/tokens.css` (variables CSS) y `tokens/tailwind.config.snippet.ts` (para fusionar en `theme.extend`). Resumen:

### Color

| Rol | Hex | Uso |
| --- | --- | --- |
| Umbral | `#35486B` | Acción primaria, chrome del nav admin, franja seleccionada, titulares de marca |
| Resol | `#E2683F` | Énfasis, subrayado de pestaña activa, casilla ocupada del logo, CTA sobre umbral |
| Sol | `#E8A33D` | Avisos, "1 left", past due, el sol del logo |
| Crema | `#FBF3E4` | Fondo de la app |
| Crema 100 / 200 | `#F5EEE0` / `#EBE1CE` | Cabeceras de tabla, franjas deshabilitadas o llenas |
| Tinta | `#2A2118` | Texto principal, tile del app icon, toast móvil |
| Tinta 600 / 800 | `#7A6E5D` / `#4A4136` | Texto secundario / cuerpo sobre crema |
| Bruma | `#8FA3B8` | Bordes y texto terciario. **Nunca como fondo de marca** |
| Superficie | `#FFFFFF` | Tarjetas, filas de tabla, inputs, franjas disponibles |

Semánticos: éxito `#2F6B4F` (fondo `#E6F0E9`, texto `#1F4A36`) · aviso `#E8A33D` (fondo `#FCEFD5`, texto `#7A4E09`) · error `#C0341C` (fondo `#FBE9E5`, texto `#8E2614`).

Rampas 100–900 de umbral y resol en los archivos de tokens. Proporción de marca heredada de Umbricity: **60% crema · 25% umbral · 10% sol · 5% resol**.

Líneas: regla fuerte de sección `2px solid rgba(42,33,24,.40)` · borde de contenedor `1px solid rgba(42,33,24,.20)` · separador de fila `1px solid rgba(42,33,24,.12)`.

### Tipografía

Tres familias, todas OFL. Detalle de carga en `tokens/fonts.md`.

| Familia | Peso | Dónde |
| --- | --- | --- |
| **Fredoka** | 500 (≥20px) / 600 (<20px) | h1–h4, wordmark, nombres de recurso, etiquetas de botón, números grandes |
| **Figtree** | 400 / 600 | Cuerpo, descripciones, celdas de tabla, textos de ayuda, enlaces |
| **IBM Plex Mono** | 400 / 500 | Horas, fechas, etiquetas en mayúsculas, badges, contadores, emails |

Regla: **si es un número, una hora o una etiqueta EN MAYÚSCULAS, va en mono.**

Escala usada en el board:

| Elemento | Fuente | Tamaño / line-height | Tracking |
| --- | --- | --- | --- |
| H1 hero | Fredoka 500 | 58px / .98 | −.02em |
| H2 página | Fredoka 500 | 30px / 1.1 | −.012em |
| H3 sección | Fredoka 500 | 24–26px | −.012em |
| H4 tarjeta | Fredoka 600 | 15–22px | −.01em |
| Hora en franja | Fredoka 600 → **usar mono 500** en implementación | 17–18px | −.01em |
| Cuerpo | Figtree 400 | 13–15px / 1.55 | 0 |
| Cuerpo pequeño | Figtree 400 | 12–12.5px / 1.6 | 0 |
| Etiqueta de campo | IBM Plex Mono 500 | 10px, uppercase | .1em |
| Badge | IBM Plex Mono 500 | 10px, uppercase | .09em |
| Metadato de tabla | IBM Plex Mono 500 | 10px, uppercase | .1em |

> Nota: en el board las horas de las franjas quedaron en Fredoka 600. En la implementación **pásalas a IBM Plex Mono 500** — es lo que hace que las columnas de horas se alineen entre filas. El resto del board es literal.

### Geometría

- **Radio: 0px en todo.** Sin excepción — botones, inputs, badges, tarjetas, modales.
- Espaciado: 4 / 8 / 12 / 16 / 24 / 32 / 48px.
- Sin sombras en la UI de producto (el board usa sombra solo en las tarjetas del canvas). La elevación se expresa con reglas y contraste de fondo.
- Sin degradados, sin rotaciones, sin contornos decorativos.
- Todo alineado a la izquierda, **incluidas las etiquetas dentro de botones anchos** (herencia del sistema Modernist): `justify-content: flex-start`, no centrado.

### Estados interactivos

| Estado | Tratamiento |
| --- | --- |
| Botón primario | fondo `#35486B`, texto `#FBF3E4`; hover `#293857`; activo `#1E2941` |
| Botón secundario | fondo transparente, borde `1px rgba(42,33,24,.35)`, texto tinta; hover fondo `rgba(42,33,24,.06)` |
| Botón ghost | solo texto; hover fondo `rgba(42,33,24,.06)` |
| Botón destructivo | texto/borde `#C0341C`; hover fondo `#FBE9E5` |
| CTA sobre umbral | fondo `#E2683F`, texto `#FFF`; hover `#C6512B` |
| Franja disponible | fondo `#FFF`, borde `1px #35486B`; hover fondo `#EDF0F6` + borde `#E2683F` |
| Focus (teclado) | `outline: 2px solid #35486B; outline-offset: 2px` — nunca el azul del navegador |
| Deshabilitado | opacidad .45, sin puntero |

Objetivo táctil mínimo en móvil: **44px**.

---

## Identidad de marca

### La marca

El logo es una **hoja de calendario cuyo borde inferior lleva el festón de la sombrilla de Umbricity, con el sol asomando por detrás**. La casilla en resol es siempre una y solo una: la franja reservada. El parentesco con Umbricity está en el detalle y en la paleta, no en la silueta — se lee como calendario primero y como familia Umbricity después.

Archivos en `brand/`:

| Archivo | Uso |
| --- | --- |
| `mark-color.svg` | Versión principal, sobre crema o blanco |
| `mark-negative.svg` | Sobre umbral (nav admin) |
| `mark-ink.svg` | Sobre tinta |
| `mark-24.svg` / `mark-24-negative.svg` | **De 28px para abajo** — geometría simplificada a 3 casillas |
| `mark-16.svg` | Favicon 16px — solo casilla resol y tres festones |
| `mark-one-ink.svg` | Una tinta, con aro del color del fondo entre sol y hoja |
| `app-icon-tile.svg` | Icono de app 512×512, tile tinta |
| `lockup-horizontal.svg` | Marca + wordmark + firma "an umbricity product" |

**Importante:** no escales `mark-color.svg` por debajo de 28px — usa `mark-24.svg`. Por debajo de 20px, `mark-16.svg`.

### Wordmark y firma

- Wordmark: **Fredoka 500**, tracking −.015em, color `#35486B` sobre fondo claro, `#FBF3E4` sobre umbral. Una sola palabra: `BookApricity`.
- Firma bajo el wordmark (solo home y auth, no en el nav): `AN UMBRICITY PRODUCT`, IBM Plex Mono 400, 9.5px, uppercase, tracking .2em, color `#7A6E5D`.

### Reglas heredadas de Umbricity

- El sol siempre detrás de la hoja, nunca delante.
- Área de respeto: el radio del sol (⅙ del alto de la marca) en los cuatro lados.
- Sin degradados, sombras, rotaciones ni contornos añadidos.
- Una sola casilla en resol — nunca dos, nunca ninguna.
- En una tinta, aro del color del fondo entre sol y hoja.

---

## Screens / Views

Cada pantalla del board lleva un badge; entre paréntesis, la ruta del repo.

### 1. Home pública — badge `1j` (`src/app/page.tsx`)

**Propósito:** captar admins de club; puertas a login y a crear club.

**Layout:** ancho completo sobre crema.
- Barra superior: 20px 34px, `flex justify-between`, borde inferior 2px. Izquierda: marca 26px + wordmark Fredoka 500 16px + separador vertical `1px rgba(42,33,24,.25)` + firma mono. Derecha: `Log in` (secundario) y `Create a club` (primario), gap 10px.
- Hero: grid `1.15fr 1fr`, borde inferior 2px, divisor vertical 2px entre columnas.
  - Columna izquierda (padding 52px 34px 46px): kicker mono 10px uppercase tracking .14em color `#A03D1E` → `BOOKING & MEMBERSHIP FOR CLUBS`. H1 Fredoka 500 58px/.98, tracking −.02em, `max-width:15ch` → “The court is free. Say who's on it.”. Párrafo Figtree 16px, `max-width:46ch`, color `#4A4136`. Dos botones 13px 20px. Fila de tres cifras separada por borde superior 1px: `2 min` / `1 link` / `€0` en Fredoka 500 22px, con pie Figtree 11.5px color `#7A6E5D`.
  - Columna derecha: fondo `#35486B`, padding 40px 34px. Kicker mono en `#E8A33D`. **Rejilla de 21 celdas** (7 columnas × 3 filas, gap 5px, alto 24px): las reservadas en `#E2683F`, las libres en `rgba(251,243,228,.28)`. Debajo, Fredoka 500 26px en crema: “47 slots open, 18 already taken.” Los números deben venir de datos reales o ser estáticos si no hay fuente.
- Tres columnas de features, divisores verticales 1px, padding 26px 34px: título Fredoka 600 15px + párrafo Figtree 13px.

### 2. Login — badge `1k` (`src/app/login/LoginForm.tsx`)

Tarjeta sobre crema, borde 1px, padding 28px. Marca 22px + wordmark 13px arriba. H4 Fredoka 600 22px `Log in`, subtítulo Figtree 12.5px `Admins and members, same door.` Campos con etiqueta mono 10px uppercase encima, input `#FFF` borde `1px rgba(42,33,24,.3)`, padding 11px, Figtree 13px, radio 0.

**Error de validación:** input con borde `#C0341C` + bloque de aviso: borde izquierdo 3px `#C0341C`, fondo `#FBE9E5`, padding 9px 11px, texto Figtree 12.5px `#8E2614`. Copy: `Wrong email or password. Try again.`

Botón primario a ancho completo, etiqueta **flush left**. Pie: `No club yet? Create one.`

### 3. Signup y confirmación de email — badge `1k` (`src/app/signup/SignupForm.tsx`, `src/app/auth/auth-code-error/page.tsx`)

Indicador de progreso: 7 tramos de 6px, gap 4px — los completados en `#E2683F`, el resto en `#EBE1CE`. (Es el mismo gesto de la semana que aparece en el hero y en los estados vacíos.)

Estado “revisa tu correo”: H4 22px, párrafo con el email en negrita, y caja blanca con borde 1px: `Didn't arrive in a minute? Resend · Use another email`.

Estado de error de enlace: `This link has expired or was already used. Confirmation links last one hour.` + botones `Sign up again` (primario) y `Log in` (secundario).

### 4. Join club por invitación — badge `1k` (`src/app/join/[clubId]/page.tsx`)

**Única pantalla con fondo umbral completo** — es la puerta de entrada del socio y debe sentirse distinta.

Fondo `#35486B`, padding 28px. Kicker mono 10px tracking .14em en `#E8A33D`: `YOU'VE BEEN INVITED`. H4 Fredoka 500 30px en crema, tracking −.015em: `Join {club name}`. Párrafo `rgba(251,243,228,.82)` con prueba social: `Create your member account and start booking courts. 34 members already in.`

Inputs con fondo crema y borde `rgba(251,243,228,.5)`, texto tinta. Botón `Join club` en **resol** a ancho completo (hover `#C6512B`) — es el único CTA resol de la app, porque sobre umbral el propio umbral no serviría. Enlace inferior en `#E8A33D`.

### 5. Create club (onboarding) — badge `1k` (`src/app/onboarding/create-club/CreateClubForm.tsx`)

Kicker `WELCOME TO BOOKAPRICITY`. H4 Fredoka 500 26px `Name your club`. Un solo campo, pero grande: input padding 13px, **Fredoka 600 16px** (el nombre del club merece peso). Placeholder `e.g. Riverside Tennis Club`.

Debajo de la regla, la lista de lo que viene: `01 Add your first resource` (número en resol, activo) · `02 Share the invite link` · `03 Activate your plan` (números en `#7A6E5D`). Números en Fredoka 600 12px, textos Figtree 13px.

### 6. Nav de admin — badge `1c` (`src/app/dashboard/layout.tsx`)

Barra sólida `#35486B`, alto 58px, padding lateral 26px. Marca negativa 24px + wordmark crema Fredoka 600 14px. Pestañas: `Reservations · Resources · Members · Billing`, padding 0 14px, Figtree 12.5px; la activa en Fredoka 600 blanco con **subrayado interior de 3px resol** (`box-shadow: inset 0 -3px 0 #E2683F`); las inactivas `rgba(251,243,228,.78)`, hover `rgba(255,255,255,.08)`.

Derecha: badge de estado de suscripción siempre visible (`Plan active` sobre `#2F6B4F`), email `rgba(251,243,228,.7)` 12px, y `Sign out` como botón con borde `rgba(251,243,228,.4)`.

### 7. Nav de miembro — badge `1c` (`src/app/(member)/layout.tsx`)

Misma altura y retícula, pero fondo **crema** con borde inferior 2px `#35486B`: la app se siente del club, no del panel. Marca a color 24px + **nombre del club** (no “BookApricity”) en Fredoka 600 14px tinta. Dos pestañas: `Book a slot · My reservations`, activa con el mismo subrayado resol.

**Móvil:** el nav se parte en dos filas — identidad arriba (12px 16px) y las dos pestañas debajo a ancho completo en grid de 2 columnas sobre blanco, con el subrayado resol en la activa.

### 8. Book a slot — badges `1d` (escritorio) y `1e` (móvil) (`src/app/(member)/book/page.tsx`, `src/lib/booking/slots.ts`, `src/components/BookSlotButton.tsx`)

La pantalla central del producto. Tres cambios de UX respecto al código actual:

**a) Franjas agrupadas por tramo del día.** En lugar de una lista plana de 14 botones, tres grupos: `MORNING` (< 12:00), `AFTERNOON` (12:00–17:59), `EVENING` (≥ 18:00). Cabecera de grupo: etiqueta mono 11px uppercase + línea de 1px que ocupa el resto del ancho + contador a la derecha en Figtree 11px (`3 open · 1 past`). El contador debe cuadrar con las franjas mostradas.

**b) Cada franja muestra las plazas restantes.** Es el dato que el socio necesita antes de tocar. Grid de 4 columnas en escritorio, 2 en móvil, gap 8px. Cada franja: hora arriba (**IBM Plex Mono 500**, 17px escritorio / 18px móvil) y estado abajo (mono 500 10.5px uppercase tracking .08em).

| Estado | Fondo | Borde | Texto de estado |
| --- | --- | --- | --- |
| Disponible | `#FFF` | `1px #35486B` | `N LEFT` en `#2F6B4F` |
| Última plaza | `#FFF` | `1px #E8A33D` | `1 LEFT` en `#7A4E09` |
| Llena | `#EBE1CE` | `1px rgba(42,33,24,.14)` | `FULL` en `#4A4136`, hora en `#7A6E5D` |
| Pasada | `#EBE1CE`, opacidad .55 | `1px rgba(42,33,24,.14)` | `PAST`, hora tachada |
| Seleccionada / reservada | `#35486B` | `1px #35486B` | `SELECTED` en `#E8A33D`, hora en `#FFF` |

Hover solo en disponibles: fondo `#EDF0F6`, borde `#E2683F`.

**c) Confirmación con *Undo* en lugar de paso de confirmación.** La reserva sigue siendo inmediata (un click, como ahora), pero aparece:
- **Escritorio:** panel lateral de 268px a la derecha del grid, borde 1px, cabecera umbral con `BOOKED JUST NOW` en mono crema. Dentro: nombre del recurso Fredoka 600 18px, fecha y hora Figtree 12.5px, badge `CONFIRMED`, botón ghost `Undo` en `#C0341C`, regla, y el aviso de cancelación: `Free until 12:00 today — 60 min before the slot starts.` (calculado desde el cutoff real del recurso).
- **Móvil:** barra fija abajo (`position: sticky; bottom: 0`) sobre fondo `#2A2118`, texto crema, con el resumen a la izquierda y `Undo` con borde `rgba(251,243,228,.5)` a la derecha.

`Undo` debe llamar a la misma acción de cancelar que ya existe. Si el *undo* falla, muestra el bloque de error estándar.

**Selectores superiores:** `Resource` (select 210px), `Date` (input date 160px), botón `Show slots`. Etiquetas mono encima. Debajo, tira de 7 días: cada uno con abreviatura mono 10px uppercase y número Fredoka 17px; el activo en Fredoka 600 sobre `#FFF` con subrayado resol de 3px, los demás en 400 color `#7A6E5D`. En móvil la tira es un grid de 7 columnas y el día activo se rellena en umbral con el número en crema.

Cabecera de la página: H2 `Book a slot` + metadato mono a la derecha con `Court 1 · 60 min · capacity 4`, separados por regla de 2px.

### 9. My reservations — badge `1i` (`src/app/(member)/my-reservations/page.tsx`)

Lista de tarjetas dentro de un contenedor con borde 1px; filas separadas por 1px. Cada fila: nombre del recurso Fredoka 600 15px + fecha/hora Figtree 12.5px a la izquierda, badge `CONFIRMED` arriba a la derecha (`white-space: nowrap`). Debajo: aviso de cancelación en Figtree 11.5px `#7A6E5D` y botón `Cancel` con borde `#C0341C`, **min-height 44px** en móvil.

**Estado vacío:** contenedor con borde discontinuo `1px dashed rgba(42,33,24,.35)`, la tira de 7 tramos en `#EBE1CE`, título Fredoka 600 16px `No upcoming reservations`, texto útil (`Your week is wide open. Court 1 has slots free tomorrow morning.`) y botón primario `Book a slot`. El texto del vacío debe decir algo real, no “no hay nada”.

### 10. Reservations (admin) — badge `1h` (`src/app/dashboard/page.tsx`, `src/components/CancelReservationButton.tsx`)

Cabecera: H2 `Reservations` + resumen mono a la derecha (`18 confirmed · 2 cancelled this week`), regla 2px.

Filtros: `Resource` (select 190px), `Date`, botón `Filter` primario, botón `Reset` ghost — todos alineados por su base.

Tabla a ancho completo, fondo blanco, borde 1px, `border-collapse: collapse`:
- `thead`: fondo `#F5EEE0`, borde inferior **2px**, celdas mono 10px uppercase tracking .1em color `#4A4136`, padding 9px 12px.
- Filas: padding 12px, separador 1px. Columna Resource en Fredoka 600 13px; Time con la hora en **mono 500** y la fecha en Figtree `#7A6E5D`; Member en Figtree 13px; Status con badge; acción `Cancel` ghost roja alineada a la derecha.
- Fila cancelada: fondo `#FCFAF5`, todo el texto en `#7A6E5D`, badge neutro, sin acción.

**Estado vacío** (borde discontinuo, marca a 34px con opacidad .5): `No reservations found` + `Nothing booked for Court 1 on 10 Sep. Try another date, or check the resource's available hours.` + botón `Clear filters`.

**Inventario de badges** (mono 500 10px uppercase tracking .09em, padding 4px 8px, radio 0):

| Badge | Fondo | Texto |
| --- | --- | --- |
| `CONFIRMED` | `#E6F0E9` | `#1F4A36` |
| `CANCELLED` | `#EBE1CE` | `#4A4136` |
| `PLAN ACTIVE` | `#2F6B4F` | `#FFF` |
| `PAST DUE` | `#FCEFD5` | `#7A4E09` |
| `INACTIVE` | `#FFF` + borde `1px rgba(42,33,24,.35)` | `#4A4136` |
| `CANCELLED PLAN` | `#FBE9E5` | `#8E2614` |
| `ADMIN` | `#35486B` | `#FFF` |
| `MEMBER` | `#EDF0F6` | `#293857` |

### 11. Formulario de recurso + horas semanales — badges `1f` (escritorio) y `1g` (móvil) (`src/app/dashboard/resources/ResourceForm.tsx`)

Cabecera: H3 `Edit resource` + nombre del recurso en mono a la derecha, regla 2px.

Campos en grid de 2 columnas, gap 14px: `Name`, `Capacity`, `Slot duration`, `Cancellation cutoff`.

**El editor de horas es el cambio grande.** Hoy son 7 filas de “checkbox + dos inputs de hora”. El diseño lo convierte en una vista de semana:

- Contenedor con borde 1px, fondo blanco. Cabecera: grid `112px 1fr`, fondo `#F5EEE0`, con el eje horario en mono 9.5px (`6 · 9 · 12 · 15 · 18 · 21`).
- Una fila por día, alto mínimo 44px, separador 1px. Izquierda (112px): casilla de 14px con borde 2px `#35486B` (rellena si el día está abierto) + nombre del día en Fredoka 600 12px (`#7A6E5D` si está cerrado).
- Derecha: pista con rejilla de fondo (`repeating-linear-gradient` cada 16.666% en `rgba(42,33,24,.09)`) que representa **06:00–22:00**. La ventana abierta es una barra umbral posicionada por porcentaje: `left = (from−6)/16`, `width = (to−from)/16`. Dentro de la barra, las horas en mono 500 10.5px crema, la de inicio a la izquierda y la de fin a la derecha.
- Día cerrado: la pista entera con trama diagonal `repeating-linear-gradient(45deg, #F5EEE0 0 6px, #EBE1CE 6px 12px)`.
- Al hacer clic en una barra se abren los dos `input type="time"` reales (la misma lógica y el mismo estado que hoy); los extremos deben poder arrastrarse en escritorio. **La barra es una representación, no un sustituto de los inputs** — el teclado tiene que seguir funcionando.
- Pie del contenedor sobre `#F5EEE0`: `Open 47 h per week · generates 47 slots of 60 min` (calculado en vivo) y a la derecha, en mono resol, los días cerrados (`SUNDAY CLOSED`).
- Acciones sobre la tabla: `Copy Monday to weekdays` y `Clear all` como botones ghost 11.5px.

Pie del formulario: `Save changes` (primario), `Cancel` (secundario), y `Delete resource` (ghost rojo) empujado a la derecha.

**Variante móvil (badge `1g`) — impleméntala por debajo de 640px:** primero una fila de presets (`Weekdays 9–17`, `Every day 8–22`, `Weekends only`, `Custom…`) como chips; el activo en umbral con texto crema, el resto blanco con borde. Debajo, selector de días como 7 casillas cuadradas (abiertas en umbral con letra crema, cerradas en `#EBE1CE`) y **un solo par From/To compartido** por todos los días encendidos, con un ghost `+ Different hours for one day` para pasar al detalle por día. Cubre el caso real mayoritario (mismo horario L–V) en tres toques.

### 12. Members — badges `4a` (escritorio) y `4b` (móvil) (`src/app/dashboard/members/page.tsx`, `src/app/dashboard/members/CopyInviteLink.tsx`)

**Propósito:** el admin comparte el enlace de invitación y gestiona quién es socio y quién admin.

Hoy la página es un enlace y una lista de emails. El diseño mantiene esa lógica y añade jerarquía.

**Cabecera:** H2 `Members` + metadato mono a la derecha (`34 members · 2 admins`), regla 2px.

**Bloque de invitación** (lo primero después de la cabecera, contenedor con borde 1px, fondo blanco):
- Fila superior en `flex`, sin padding en el botón: a la izquierda, etiqueta mono 10px uppercase `INVITE LINK` y debajo la URL en **IBM Plex Mono 400 14px** color tinta con `word-break: break-all`, padding 14px 16px. A la derecha, botón primario `Copy link` que ocupa **todo el alto de la fila** (`align-self: stretch`, padding lateral 22px, Fredoka 600 13px). Pegado al borde, sin margen: el botón es parte del campo.
- Fila inferior sobre `#F5EEE0`, padding 11px 16px: texto de ayuda Figtree 12.5px a la izquierda y dos ghost a la derecha — `Show QR` y `Regenerate` (este último en `#A03D1E`).
- Estado copiado: el contenedor pasa a borde `#2F6B4F` y fondo `#E6F0E9` durante 2s, con la etiqueta `COPIED TO CLIPBOARD` en `#1F4A36` (el `setTimeout` de 2s ya existe en `CopyInviteLink`). En móvil, además, botón `Share` que llama a `navigator.share` si está disponible.

**Filtros:** input `Search` (máx 280px) por email, y a su derecha un grupo de tres pestañas con recuento — `All 34` (activa: fondo umbral, texto crema, Fredoka 600 12px) / `Admins 2` / `Members 32` (blanco con borde 1px). Gap 2px entre ellas, radio 0.

**Tabla** (misma receta que la de Reservations: cabecera `#F5EEE0`, borde inferior 2px, celdas mono 10px uppercase):

| Columna | Contenido |
| --- | --- |
| Member | Email en Figtree 13px. El usuario actual lleva detrás ` · YOU` en mono 10px `#7A6E5D` |
| Role | Badge `ADMIN` (`#35486B` / blanco) o `MEMBER` (`#EDF0F6` / `#293857`) |
| Joined | Fecha en mono 500 12.5px, formato `12 Mar 2026` |
| Bookings · 30d | Entero en mono 500 13px; si es 0, color `#7A6E5D` |
| (acciones) | Ghost alineados a la derecha, `white-space: nowrap`: `Make admin` / `Make member`, y `Remove` en `#C0341C`. La fila del propio usuario no tiene acciones. |

**Estado vacío** (club recién creado, solo el admin): borde discontinuo, marca a 34px con opacidad .5, título Fredoka 600 16px `Solo estás tú` → en inglés: `You're the only one here`, texto `Share the link in the club's group chat and members sign themselves up. You don't need to add them one by one.` y botón primario `Copy invite link`.

**Móvil:** nav admin en dos filas (identidad arriba, cuatro pestañas abajo en grid de 4 columnas con etiquetas abreviadas `Reserv. · Resour. · Members · Billing`). La tabla se convierte en lista: email arriba en Figtree 13px con `text-overflow: ellipsis`, debajo metadato mono 11px `02 SEP · 7 BOOKINGS`, y el badge de rol a la derecha (`flex: none`). Las acciones de rol pasan a pulsación larga o a una pantalla de detalle — no las metas en la fila.

### 13. Billing — badges `4c` (sin plan) y `4d` (activo / impagado) (`src/app/dashboard/billing/page.tsx`, `src/app/dashboard/billing/SubscribeButton.tsx`)

**Propósito:** ver el estado de la suscripción del club y contratarla o gestionarla. El checkout es **Paddle** (`paddle.js` v2, `Checkout.open({ transactionId })`, con `createCheckoutTransaction()` en el servidor). No cambies ese flujo.

**Cabecera:** H2 `Billing` + nombre del club en mono a la derecha, regla 2px.

**Tarjeta de estado** (siempre visible, la primera): `flex`, padding 16px, borde 1px. Etiqueta mono `PLAN STATUS` y debajo el estado en **Fredoka 500 24px** capitalizado. A la derecha, el badge correspondiente.

| Estado | Borde / fondo de la tarjeta | Badge |
| --- | --- | --- |
| `inactive` | `rgba(42,33,24,.2)` / `#FFF` | `INACTIVE` (blanco, borde 1px) |
| `active` | `#2F6B4F` / `#E6F0E9`, textos en `#1F4A36` | — (se sustituye por `Manage subscription`) |
| `past_due` | `#E8A33D` / `#FCEFD5`, textos en `#7A4E09` | `PAST DUE` |

**Sin plan (`4c`):** debajo del estado, la tarjeta de venta con borde `#35486B`:
- Barra superior umbral: `Club plan` en Fredoka 500 18px crema a la izquierda, `BILLED MONTHLY` en mono 12px `#E8A33D` a la derecha. **Si algún día se muestra el precio, va en esta barra**, no en el cuerpo.
- Cuerpo: párrafo Figtree 14px con el copy actual (`Subscribe to unlock full access to BookApricity for your club.`) más la tranquilidad de que nada se pierde. Después, cuatro puntos en grid 2×2, cada uno con su ordinal mono `01`–`04` en resol.
- Botón `Subscribe` primario, Fredoka 600 15px, padding 13px 20px, etiqueta flush left. Debajo, nota Figtree 11.5px: `Pago seguro con Paddle. Se abre en una ventana sobre esta página.`

**Estados del botón** (ya existen en `SubscribeButton`, solo hay que vestirlos):
- Paddle aún no cargado (`!paddleReady`) o envío en curso: opacidad .45, `pointer-events: none`, etiqueta `Starting checkout…` mientras `isSubmitting`.
- Error: bloque estándar (borde izquierdo 3px `#C0341C`, fondo `#FBE9E5`, texto `#8E2614`) **encima** del botón, nunca en su lugar — el botón sigue disponible. Copy: `Could not start checkout. Try again in a moment.`

**Plan activo (`4d`):** tarjeta de estado en verde con `RENEWS 08 OCT 2026` en mono 12px, y botón secundario `Manage subscription` a la derecha (abre el portal de Paddle). Debajo, tabla de invoices con cabecera `INVOICES` sobre `#F5EEE0` y la nota `Desde Paddle`; una fila por factura: fecha en mono 500 12.5px, badge `PAID`, y ghost `Download`.

**Impago:** el aviso **no vive solo en Billing**. El nav admin cambia su badge de `PLAN ACTIVE` a `PAST DUE` (`#FCEFD5` / `#7A4E09`) en todas las pantallas. En Billing, banner con borde `#E8A33D` y fondo `#FCEFD5`: título Fredoka 600 15px `Payment failed on 08 Sep`, texto que dice **qué sigue funcionando y hasta cuándo** (`Members can still book. If the payment doesn't go through by 15 Sep, the club switches to read-only.`) y botón `Update payment` en **resol** (`#E2683F`, hover `#C6512B`). Es el único CTA resol del admin, por la misma razón que en Join club: sobre umbral, el umbral no destaca.

### Datos que estas dos pantallas necesitan y hoy no existen — badge `4e`

| Elemento | Tipo | Nota |
| --- | --- | --- |
| `Bookings · 30d` por socio | Query | Count de reservas confirmadas por `user_id` en 30 días |
| `Make admin` / `Make member` | Acción | Update de `users.role`; impide dejar el club sin admins |
| `Remove member` | Acción | Debe decidir qué pasa con sus reservas futuras — cancélalas y avísalo en el diálogo |
| `Regenerate invite link` | Acción | Invalida el `clubId` público anterior |
| Renovación e invoices | Paddle | API de suscripciones / portal de cliente |
| `Manage` / `Update payment` | Paddle | Portal de cliente |
| `past_due` y fecha límite | Webhook | Añadir el estado a `clubs.subscription_status` |

**Si algo de esto se queda fuera de la primera versión, quita la columna o la fila entera** — no la dejes vacía ni con un guion.

---

## Interactions & Behavior

- **Navegación:** sin cambios respecto al repo. Admin en `/dashboard/*`, socio en las rutas de `(member)`, home y auth públicas.
- **Reservar:** click en franja → reserva inmediata (comportamiento actual) → la franja pasa a estado *Selected* y aparece el panel/toast de confirmación con `Undo`. No añadir modal de confirmación.
- **Cancelar:** desde `My reservations` y desde la tabla admin, con la acción existente. Deshabilita el botón cuando ha pasado el cutoff, y explica por qué en el texto de ayuda en lugar de ocultarlo.
- **Filtros admin:** `Filter` recarga la lista; `Reset` limpia recurso y fecha. En Members, el buscador filtra en cliente (la lista de un club cabe en memoria) y las pestañas de rol son estado local.
- **Copiar enlace:** `navigator.clipboard.writeText` + estado `copied` de 2s (ya implementado). En móvil, `navigator.share` si existe.
- **Checkout:** sin cambios — `createCheckoutTransaction()` y `Paddle.Checkout.open`. Tras cerrar el checkout, revalida la página para que el estado del plan se actualice.
- **Transiciones:** solo cambios de color en hover/focus, 120ms `ease-out`. Sin animaciones de entrada, sin desplazamientos.
- **Validación:** errores en línea con el bloque de aviso descrito (borde izquierdo 3px). El error de capacidad usa el copy `That slot is already full. Pick another time.`
- **Carga:** las franjas y las tablas se renderizan en servidor; para las acciones cliente, deshabilita el botón y baja su opacidad a .45 mientras está en vuelo. Nada de spinners a pantalla completa.
- **Responsive:** un solo punto de ruptura relevante, 768px. Por debajo: nav de miembro en dos filas, franjas en 2 columnas, tabla admin en tarjetas apiladas (recurso + hora arriba, socio y estado debajo), editor de horas en la variante de presets.

## State Management

Sin estado nuevo salvo lo que exige el *Undo* y el editor visual:

- `lastBooking: { id, resourceName, date, from, to, cutoffAt } | null` — cliente, se limpia al navegar o tras ~60s. Alimenta el panel/toast.
- `selectedDay: ISODate` — la tira de 7 días; hoy por defecto; debe mantenerse sincronizada con el input `date`.
- `hours: Record<Weekday, { open: boolean; from: string; to: string }>` — ya existe en `ResourceForm`; el editor visual lo lee y escribe sin cambiar su forma.
- `editingDay: Weekday | null` — qué barra tiene los inputs de hora abiertos.
- `memberFilter: 'all' | 'admin' | 'member'` y `memberQuery: string` — cliente, en Members.
- Los contadores (`N left`, `47 h per week`, `18 confirmed`, `34 members`) son **derivados**, nunca estado. Calcúlalos de los datos ya cargados.

Sin librería de estado: `useState` en los componentes cliente existentes.

## Assets

- `brand/*.svg` — la marca BookApricity en todas sus versiones. Creados para este proyecto; úsalos tal cual, no los regeneres.
- Fuentes: Fredoka, Figtree, IBM Plex Mono desde Google Fonts vía `next/font/google` (SIL OFL, uso comercial libre). Ver `tokens/fonts.md`.
- Iconos: **Lucide** (`lucide-react`) donde hagan falta, a 16/20px, `stroke-width: 2`, color heredado. El diseño usa muy pocos: la app se apoya en tipografía y reglas, no en iconografía.
- No hay fotografía en el diseño.
- Los assets originales de Umbricity (sombrilla y sol) **no se usan dentro de la app** — solo la firma tipográfica “an umbricity product”.

## Files

| Archivo | Qué contiene |
| --- | --- |
| `BookApricity.dc.html` | El board de diseño completo. Turno 1 = pantallas (badges `1a`–`1k`), turno 2 = espécimen tipográfico, turno 3 = comparativa de logo, turno 4 = Members y Billing (`4a`–`4e`). Ábrelo en el navegador. |
| `tokens/tokens.css` | Todos los tokens como variables CSS |
| `tokens/tailwind.config.snippet.ts` | Los mismos tokens listos para `theme.extend` |
| `tokens/fonts.md` | Carga de fuentes con `next/font` y reglas de uso |
| `brand/` | Los SVG de la marca |
| `github.md` | Mapa de pantalla → archivos del repo |

## Orden de trabajo sugerido

1. Tokens y fuentes (`tailwind.config.ts`, `layout.tsx`, `globals.css`) — nada más se ve bien hasta que esto esté.
2. Primitivas: botón, input, select, badge, bloque de error, tabla. Radio 0 en todo, etiquetas flush left.
3. Los dos navs + la marca.
4. `Book a slot` — es la pantalla con más diseño nuevo (grupos, estados de franja, Undo).
5. Tabla admin y `My reservations`, incluidos los estados vacíos.
6. `ResourceForm` con el editor visual de horas (y su variante móvil).
7. Members y Billing, con sus estados vacíos, de error y de impago.
8. Home y auth.
9. Pasada de accesibilidad: focus visible en `#35486B`, contraste de badges, objetivos de 44px, `aria-pressed` en las franjas.
