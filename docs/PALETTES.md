# Paleta de color

Paleta definitiva de Duo LAN: negro, cobalto y lima.

```css
--color-bg: #030407;
--color-surface: #060b14;
--color-surface-2: #0a1424;
--color-border: #1558c9;
--color-text: #f4f7fb;
--color-muted: #94a3b8;
--color-accent: #b0cf5c;
--color-accent-strong: #9fbf4f;
--color-gold: #f5c451;
--color-danger: #f87171;
--color-success: #34d399;
```

## Uso

- Fondo general: `#030407`.
- Superficies y cards: `#060b14` y `#0a1424`.
- Bordes y acentos de estructura: `#1558c9`.
- CTAs, badges y highlights: `#b0cf5c`; hover: `#9fbf4f`.
- Texto principal: `#f4f7fb`; texto secundario: `#94a3b8`.
- Rango, danger, success y gold mantienen sus colores semánticos.

## Aplicación

- `apps/web/src/styles.css`: tokens de Tailwind 4.
- `apps/web/src/index.html`: `theme-color` `#030407`.
- `apps/web/public/manifest.json`: `background_color` y `theme_color` `#030407`.
- `apps/web/public/favicon.svg`: fondo `#030407`, trazo `#1558c9` y acento `#b0cf5c`.
- `apps/web/public/illustrations/*.svg`: fondos `#030407`, `#060b14`, `#0a1424`; acento `#b0cf5c`; bordes `#1558c9`.
- Templates de Resend: fondo `#030407`, superficies `#060b14` y acento `#b0cf5c`.

## Pendiente

- Regenerar los PNG de `apps/web/public/icons/` si se ajusta el isotipo.
- Revisar contraste y accesibilidad en la implementación Angular.
