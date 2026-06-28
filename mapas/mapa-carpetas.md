# La Forja — Mapa de Carpetas
_Última actualización: 2026-06-27 · v15.0 Character Wizard_

---

```
La_Forja_Online/
│
├── index.html                      ← App principal. SPA completa: toda la lógica
│                                     React, el motor de la ficha, la navegación
│                                     y los componentes viven aquí como JSX compilado
│                                     por Babel en runtime. Punto de entrada único.
│
├── biblioteca_forja_light.html     ← Versión standalone de la Biblioteca (uso separado,
│                                     no es la misma que se abre desde el menú principal)
│
├── La Forja OG.html                ← Versión original/legacy. Archivo histórico,
│                                     no está en producción activa.
│
├── LaForja_Roadmap.pdf             ← Hoja de ruta del proyecto (documento externo)
│
├── icono.png                       ← Ícono de la PWA (sirve como 192x192 y 512x512)
│
├── version.json                    ← Versión actual de la app para el sistema de
│                                     actualizaciones OTA. Debe coincidir con
│                                     CURRENT_VERSION en index.html. Actualizar en
│                                     cada release junto con el CACHE_NAME del SW.
│
├── js/
│   │
│   ├── ── LIBRERÍAS EXTERNAS (100% local, sin CDN, sin npm) ──────────────
│   │
│   ├── react.js                    ← React 18 (bundleado localmente)
│   ├── react-dom.js                ← ReactDOM 18
│   ├── babel.js                    ← Babel Standalone — compila JSX en el navegador
│   │                                 en tiempo de ejecución (no hay build step)
│   ├── tailwind.js                 ← Tailwind CSS (runtime, sin PostCSS)
│   ├── three.js                    ← Three.js — importado, preparado para futuro uso 3D
│   ├── fuse.js                     ← Fuse.js — búsqueda fuzzy para la Biblioteca
│   ├── idb.js                      ← IDB library — wrapper Promise de IndexedDB
│   │
│   ├── ── PWA / SERVICE WORKER ───────────────────────────────────────────
│   │
│   ├── sw.js                       ← Service Worker. Cache-first para assets, network
│   │                                 para version.json. Responde a SKIP_WAITING.
│   │                                 Cambia CACHE_NAME ('forja-vX') en cada release.
│   ├── manifest.json               ← Web App Manifest (nombre, íconos, display, scope)
│   │
│   ├── ── MÓDULOS DE LA APP ──────────────────────────────────────────────
│   │
│   ├── libraryManager.js           ← Componente React: Biblioteca de hechizos, equipo,
│   │                                 feats y contenido homebrew. Usa Fuse.js y DB.
│   ├── libraryManager.css          ← Estilos propios del LibraryManager
│   │
│   ├── lmFormConfig.js             ← Config de formularios por categoría homebrew.
│   │                                 Define qué campos pide cada tipo (hechizo,
│   │                                 equipo, feat, rasgo…) y cómo construir el objeto.
│   │
│   ├── lmForms.js                  ← Componente LMItemForm dinámico. Lee lmFormConfig
│   │                                 y renderiza el formulario correspondiente.
│   │
│   ├── homebrew-schema.js          ← Schema de ejemplo/referencia para objetos homebrew.
│   │                                 Documenta la estructura esperada (no es código activo).
│   │
│   ├── ── CHARACTER WIZARD ───────────────────────────────────────────────
│   │
│   ├── characterWizard.js          ← Orquestador del wizard (9 pasos). Maneja el state
│   │                                 central de selecciones, la navegación, el stepper
│   │                                 clickeable y los modales de confirmación.
│   │                                 Cargar DESPUÉS de cwBuilder.js y cwSteps.js.
│   │
│   ├── characterWizard.css         ← Estilos del wizard (animaciones de paso, stepper)
│   │
│   ├── cwBuilder.js                ← Función pura cwBuildCharacter(selections) → char v2.
│   │                                 Traduce las selecciones del wizard a un objeto
│   │                                 personaje completo listo para IndexedDB. Sin React.
│   │
│   ├── cwSteps.js                  ← Componentes de cada paso del wizard:
│   │                                 CWStepMode, CWStepBasics, CWStepClass,
│   │                                 CWStepSpecies, CWStepBackground, CWStepStats,
│   │                                 CWStepEquipment, CWStepSpells, CWStepSummary.
│   │                                 Cargar DESPUÉS de cwBuilder.js.
│   │
│   └── updateChecker.js            ← window.ForjaUpdater. Verifica actualizaciones
│                                     contra GitHub Pages (version.json). Límite: 56 h
│                                     entre chequeos automáticos (~3× por semana).
│                                     Limpia caches y recarga para aplicar updates.
│
├── SRD/
│   │
│   ├── en/                         ← 22 JSONs del SRD 5.1 en inglés
│   │   ├── 5e-SRD-Ability-Scores.json
│   │   ├── 5e-SRD-Alignments.json
│   │   ├── 5e-SRD-Backgrounds.json
│   │   ├── 5e-SRD-Classes.json
│   │   ├── 5e-SRD-Conditions.json
│   │   ├── 5e-SRD-Damage-Types.json
│   │   ├── 5e-SRD-Equipment-Categories.json
│   │   ├── 5e-SRD-Equipment.json
│   │   ├── 5e-SRD-Feats.json
│   │   ├── 5e-SRD-Languages.json
│   │   ├── 5e-SRD-Magic-Items.json
│   │   ├── 5e-SRD-Magic-Schools.json
│   │   ├── 5e-SRD-Monsters.json          ← Solo existe en EN (no traducido aún)
│   │   ├── 5e-SRD-Proficiencies.json
│   │   ├── 5e-SRD-Skills.json
│   │   ├── 5e-SRD-Species.json
│   │   ├── 5e-SRD-Spells.json
│   │   ├── 5e-SRD-Subclasses.json
│   │   ├── 5e-SRD-Subspecies.json
│   │   ├── 5e-SRD-Traits.json
│   │   ├── 5e-SRD-Weapon-Mastery-Properties.json
│   │   └── 5e-SRD-Weapon-Properties.json
│   │
│   └── es/                         ← 21 JSONs traducidos al español (los que usa la app)
│       ├── 5e-SRD-*-es.json        ← Misma lista que EN excepto Monsters
│       └── Prod/
│           └── 5e-SRD-Backgrounds.json  ← Versión de producción de Trasfondos
│                                          (diferente al es/ raíz — revisar cuál es canon)
│
├── Pics_Marketing/                 ← Capturas de pantalla para marketing
│   └── 2026-05-13 *.png            ← 9 screenshots de sesión de mayo 2026
│
└── mapas/                          ← Esta carpeta — documentación interna
    ├── mapa-carpetas.md            ← Este archivo
    └── mapa-flujo.md               ← Diagrama de flujo de la app
```

---

## Resumen rápido de responsabilidades

| Archivo / Carpeta | Rol |
|---|---|
| `index.html` | Todo: App React, DB layer, lógica de migración, ficha de personaje |
| `js/sw.js` | Caché offline, actualizaciones controladas |
| `js/updateChecker.js` | Detectar y aplicar actualizaciones OTA |
| `js/libraryManager.js` + `css` | Biblioteca de contenido SRD y homebrew |
| `js/lmFormConfig.js` + `lmForms.js` | Formularios dinámicos para homebrew |
| `js/characterWizard.js` | Wizard de 9 pasos (orquestador) |
| `js/cwBuilder.js` | Lógica pura de construcción de personaje |
| `js/cwSteps.js` | Componentes visuales de cada paso |
| `SRD/es/` | Datos del SRD que se cargan en IndexedDB |
| `version.json` | Señal de release para el sistema de updates |

## Notas de mantenimiento

- **En cada release** actualizar: `CURRENT_VERSION` (index.html), `CACHE_NAME` (sw.js), `version` (version.json)
- `three.js` está cargado pero no activo — para funcionalidad 3D futura
- `SRD/es/Prod/` contiene una versión alternativa de Backgrounds — verificar si reemplaza al de `SRD/es/`
- `La Forja OG.html` y `biblioteca_forja_light.html` son experimentales/legacy, no son parte del flujo principal
