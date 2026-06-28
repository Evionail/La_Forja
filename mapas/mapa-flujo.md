# La Forja — Mapa de Flujo de la App
_Última actualización: 2026-06-27 · v15.0 Character Wizard_

---

## 1. Arranque (primera vez vs. visitas siguientes)

```
Browser abre https://evionail.github.io/La_Forja/
        │
        ▼
¿Service Worker registrado?
    │                   │
   SÍ                  NO
    │                   │
    │           Registrar sw.js
    │           Instalar caché (ASSETS)
    │                   │
    ▼                   ▼
SW intercepta fetches ←──────────────────────────┐
(cache-first, excepto version.json)               │
        │                                         │
        ▼                                         │
index.html servido (desde caché o red)            │
        │                                         │
        ▼                                         │
Carga de scripts (en orden):                      │
  tailwind.js → react.js → react-dom.js           │
  → three.js → fuse.js                            │
  → lmFormConfig.js → lmForms.js                  │
  → libraryManager.js                             │
  → cwBuilder.js → cwSteps.js                     │
  → characterWizard.js                            │
  → babel.js → updateChecker.js                   │
  → <script type="text/babel"> (se compila)       │
        │                                         │
        ▼                                         │
React renderiza <App />                           │
Loader animado aparece (2.5s mínimo)              │
        │                                         │
        ▼                                         │
INIT SEQUENCE (en paralelo con el loader):        │
  1. DB.migrateFromLocalStorage()                 │
     └─ Si había datos en localStorage →          │
        los mueve a IndexedDB y borra ls          │
  2. DB.loadSRDIfNeeded()                         │
     └─ ¿srd_loaded_v2 en settings?              │
            │              │                      │
           SÍ             NO                      │
            │              │                      │
            │        Fetch 21 JSONs del SRD       │
            │        (SRD/es/) → IndexedDB        │
            │        (barra de progreso)           │
            │              │                      │
            └──────────────┘                      │
  3. DB.getSetting('forja_dark_mode')             │
     └─ Aplicar clase dark-mode al body           │
  4. DB.getLibrary()                              │
     └─ Cargar array de stubs de personajes       │
  5. Migración legacy dnd_char_v3                 │
     └─ Si existe en localStorage → importar      │
        y mostrar alerta de recuperación          │
        │                                         │
        ▼                                         │
Loader desaparece (fade out)                      │
        │                                         │
        ▼                                         │
ForjaUpdater.checkIfNeeded(CURRENT_VERSION) ──────┘
  └─ (ver sección 6: Sistema de Actualizaciones)
```

---

## 2. Navegación principal (vistas)

```
                    ┌─────────────────────────────┐
                    │          App (root)          │
                    │   state: view, library,      │
                    │   activeCharId, darkMode,     │
                    │   updateInfo                  │
                    └─────────────┬───────────────┘
                                  │
               ┌──────────────────┼──────────────────────┐
               │                  │                       │
        view='menu'        view='wizard'          view='library'
               │                  │                       │
               ▼                  ▼                       ▼
          MainMenu          CharacterWizard         LibraryManager
          (lista de          (9 pasos de              (biblioteca de
          personajes)        creación)               hechizos/items)
               │
        ┌──────┴──────┐
        │             │
  view='sheet'   view='about'
        │             │
        ▼             ▼
  CharacterSheet  AboutScreen
  (ficha activa)  (info + updates)
```

**Transiciones posibles:**

| Desde | Acción | Hacia |
|---|---|---|
| menu | Tocar "Nuevo héroe" (quick) | sheet (personaje vacío creado) |
| menu | Tocar "Asistente de creación" | wizard |
| menu | Tocar personaje existente | sheet |
| menu | Tocar "Biblioteca" | library |
| menu | Tocar "Acerca de" | about |
| wizard | Completar paso 9 (Resumen) | sheet (personaje guardado) |
| wizard | Cerrar / Back hardware | menu (con confirmación) |
| sheet | Back hardware / botón cerrar | menu |
| library | Back / botón cerrar | menu |
| about | Volver | menu |
| cualquier vista | Back hardware (Android) | vista anterior → menu → salir app |

---

## 3. Flujo del Character Wizard (9 pasos)

```
CharacterWizard (orquestador)
        │
        ▼
Paso 0: StepMode ─────────── ¿Modo simple o experto?
        │                     (no aparece en el stepper)
        ▼
Paso 1: StepBasics ─────────  Nombre, imagen de perfil
        │                     (resizeImage → max 512px, JPEG 0.85)
        ▼
Paso 2: StepClass ──────────  Elegir clase del SRD
        │                     (DB.getSRD('srd_classes'))
        ▼
Paso 3: StepSpecies ────────  Elegir especie/raza del SRD
        │                     (DB.getSRD('srd_species'))
        ▼
Paso 4: StepBackground ─────  Elegir trasfondo del SRD
        │                     (DB.getSRD('srd_backgrounds'))
        ▼
Paso 5: StepStats ──────────  Asignar puntuaciones de características
        │                     (array [15,14,13,12,10,8] o point buy)
        ▼
Paso 6: StepEquipment ──────  Seleccionar equipo inicial
        │                     (DB.getSRD('srd_equipment'))
        ▼
Paso 7: StepSpells ─────────  ¿La clase lanza hechizos?
        │    │                  SÍ → elegir hechizos conocidos
        │   NO                  NO → auto-skip
        │    │
        └────┘
        ▼
Paso 8: StepSummary ────────  Resumen de todas las selecciones
        │
        ▼ (usuario confirma)
cwBuildCharacter(selections)   Función pura → char v2 completo:
        │                       - HP calculado (dado max + mod CON)
        │                       - Bono competencia por nivel
        │                       - Proficiencias de clase + trasfondo
        │                       - Slots de hechizos
        │                       - Inventario inicial
        ▼
DB.saveChar(id, char)          Guarda en IndexedDB
DB.saveLibrary(updatedLib)     Actualiza la lista
        │
        ▼
setView('sheet')               Abre la ficha del personaje nuevo
```

**Navegación dentro del wizard:**
- Stepper superior: permite volver a pasos ya completados (solo hacia atrás)
- Botón "Siguiente": avanza si el paso tiene validación OK
- Botón "Saltar": algunos pasos son opcionales (confirmación modal)
- Back hardware: modal "¿Abandonar creación?" → sí/no

---

## 4. Almacenamiento — IndexedDB

```
Base de datos: forja_db (versión 3)
        │
        ├── characters/          ← Personajes completos
        │   └── char_{id}        ← Schema v2 (ver sección 5)
        │
        ├── settings/            ← Configuración y datos auxiliares
        │   ├── forja_library        ← Array de stubs [{id, name, race, class, level}]
        │   ├── forja_library_master ← {spells:[], attacks:[]} (maestro de ataques/hechizos)
        │   ├── forja_dark_mode      ← boolean
        │   ├── srd_loaded_v2        ← boolean (flag de carga del SRD)
        │   ├── ls_migration_done    ← boolean (migración desde localStorage)
        │   ├── lm_brew_*            ← Contenido homebrew por categoría
        │   ├── forja_lastUpdateCheck← timestamp (sistema de actualizaciones)
        │   └── forja_updateDismissed← versión descartada por el usuario
        │
        ├── srd_classes/         ← Datos del SRD (21 stores)
        ├── srd_species/
        ├── srd_backgrounds/
        ├── srd_spells/
        ├── srd_equipment/
        ├── srd_feats/
        ├── srd_traits/
        ├── srd_subclasses/
        ├── srd_subspecies/
        ├── srd_skills/
        ├── srd_proficiencies/
        ├── srd_alignments/
        ├── srd_conditions/
        ├── srd_damage_types/
        ├── srd_equipment_categories/
        ├── srd_languages/
        ├── srd_magic_items/
        ├── srd_magic_schools/
        ├── srd_weapon_mastery/
        └── srd_weapon_properties/
```

**Capa de acceso (`DB` object en index.html):**
```
DB.getChar(id)          → IndexedDB → char v2
DB.saveChar(id, char)   → IndexedDB
DB.deleteChar(id)       → IndexedDB
DB.getLibrary()         → settings/forja_library
DB.saveLibrary(arr)     → settings/forja_library
DB.getSRD(storeName)    → cualquier store SRD (getAll)
DB.getSetting(key)      → settings/{key}
DB.setSetting(key, val) → settings/{key}
```

---

## 5. Schema del personaje (v2)

```
char {
    id                  string    'hero_1234567890'
    name                string    'Thorin el Valiente'
    alignment           string    'Legal Bueno'
    languages           string    'Común, Enano'

    race_data {                   snapshot del SRD en el momento de creación
        index, name, size, speed
        traits: [{index, name}]
        asi_bonus: [{ability, bonus}]
        subrace: {index, name}
    }

    class               string    'Guerrero'
    class_data {                  snapshot del SRD
        index, name, hit_die
        proficiencies: [{index, name}]
    }
    subclass            string

    background          string
    backgroundFeature   string
    level               number    1–20

    stats {
        str, dex, con, int, wis, cha   (números 1–30)
    }
    proficiencies       string[]  ['athletics', 'perception', …]
    savingThrows        string[]  ['str', 'con', …]

    hp {
        current, max, temp
        hitDice         string    '1d10'
        hitDiceMax, hitDiceUsed
        deathSaves: { successes: 0–3, failures: 0–3 }
    }

    ac                  number
    speed               number    30
    initiativeBonus     number    0
    inspiration         number    0

    attacks: [{
        name, bonus, damage, damageType, range, notes
    }]

    spells: [{
        index, name, level, school, castingTime,
        range, duration, components, desc
    }]

    spellSlots: {
        1: {total, used}, 2: …, …, 9: {total, used}
    }

    inventory           string    (texto libre o JSON)
    notes               string    (notas libres)

    money {
        cp, sp, ep, gp, pp
    }

    backgroundUrl       string    (URL o data URL de imagen de fondo)
    profileImage        string    (data URL, max 512px)
    bgOpacity           number    0–1
    boxTransparent      boolean

    meta {
        version         number    2
        mode            string    'simple' | 'expert'
        createdAt       string    ISO date
        lastModified: {
            stats, combat, spells, inventory, race, class_
        }
    }
}
```

---

## 6. Sistema de actualizaciones OTA

```
App arranca
        │
        ▼
ForjaUpdater.checkIfNeeded(CURRENT_VERSION)
        │
        ▼
¿Pasaron ≥56h desde último check?
        │                    │
       SÍ                   NO
        │                    │
        ▼                    └──→ null (no se hace nada)
fetch('version.json?t=…', {cache:'no-store'})
[SW excluye version.json → siempre va a red]
        │
        ▼
¿Conexión OK?
        │              │
       SÍ             NO
        │              │
        │        null (silencioso, sin error visible)
        ▼
¿data.version === CURRENT_VERSION?
        │                      │
       SÍ                     NO
        │                      │
  {hasUpdate: false}     {hasUpdate: true, version: '…'}
  (guarda timestamp,      (guarda timestamp,
   no muestra nada)        ¿está dismissed?)
                                │            │
                               SÍ           NO
                                │            │
                             no muestra  muestra UpdateBanner
                                          (barra dorada, top)
                                                │
                              ┌─────────────────┴────────────────┐
                              │                                   │
                         "Actualizar"                         "×" cerrar
                              │                                   │
                              ▼                                   ▼
                     ForjaUpdater.applyUpdate()        dismiss(version) en localStorage
                              │                        Banner desaparece
                              │                        (no vuelve hasta nueva versión)
                              ▼
                  SW.waiting?.postMessage(SKIP_WAITING)
                  caches.keys() → caches.delete() (todos)
                  location.reload(true)
                              │
                              ▼
                  App recarga → SW descarga assets frescos
                  → Nueva versión activa

──────────────────────────────────────────────
FLUJO MANUAL (botón en Acerca De):
──────────────────────────────────────────────

Usuario toca "Buscar actualizaciones"
        │
        ▼
ForjaUpdater.check(CURRENT_VERSION)  [ignora el intervalo de 56h]
        │
   ┌────┴──────────────┬──────────────────┐
   │                   │                  │
Sin conexión       Misma versión     Nueva versión
   │                   │                  │
"Sin conexión"    "✓ Tienes la       Botón cambia a
Reintentar        última versión"    "⚒️ Actualizar a vX"
                                          │
                                          ▼
                                   applyUpdate() (mismo flujo)
```

---

## 7. Ciclo de vida del Service Worker

```
DEPLOY de nueva versión
  (nuevo CACHE_NAME + nuevos assets)
        │
        ▼
Browser detecta cambio en sw.js (próxima visita o navegación)
        │
        ▼
SW nuevo: evento 'install'
  └─ caches.open(CACHE_NAME_NUEVO)
  └─ cache.addAll(ASSETS)
  └─ self.skipWaiting()  ← activa inmediatamente
        │
        ▼
SW nuevo: evento 'activate'
  └─ Borra caches viejos (todos los que ≠ CACHE_NAME_NUEVO)
  └─ self.clients.claim()  ← toma control de todas las pestañas
        │
        ▼
Fetch del usuario:
  ├─ version.json → SIEMPRE a red (excluido del caché)
  ├─ Asset en caché → responde desde caché (offline-first)
  └─ Asset nuevo → fetch red → guarda en caché → responde

Mensaje desde la app:
  {type: 'SKIP_WAITING'} → self.skipWaiting()
  (usado por applyUpdate() si hay un SW en espera)
```

---

## 8. LibraryManager — Biblioteca de contenido

```
Usuario abre "Biblioteca" (view='library')
        │
        ▼
LibraryManager monta
  ├─ Carga SRD desde IndexedDB (por categoría activa)
  ├─ Carga homebrew desde DB.getSetting('lm_brew_*')
  └─ Fuse.js indexa todos los items para búsqueda fuzzy
        │
        ▼
Navegación por pestañas:
  Hechizos | Equipo | Feats | Trasgos | Razas | Clases | …
        │
   Buscar (Fuse.js)  ←── input de búsqueda
        │
        ▼
Ver detalle de item → modal con descripción completa
        │
   ┌────┴─────────┐
   │              │
SRD oficial    Homebrew
(solo lectura) (editable, borrable)
                   │
                   ▼
             "+" Crear nuevo
                   │
                   ▼
             LMItemForm (lmForms.js)
             lee LM_FORM_CONFIG (lmFormConfig.js)
             → campos dinámicos según categoría
                   │
                   ▼
             DB.setSetting('lm_brew_b_srd_{store}', [...])
             Item guardado en IndexedDB
```

---

## 9. Flujo de datos al editar la ficha (CharacterSheet)

```
Usuario edita campo en la ficha
        │
        ▼
onChange → setChar(nuevo estado local)
        │
        ▼
¿Es un campo "pesado" (imagen, inventario largo)?
        │              │
      SÍ              NO
        │              │
  debounce 500ms   guardado inmediato
        │              │
        └──────────────┘
               │
               ▼
DB.saveChar(id, char)  [IndexedDB]
        │
        ▼
meta.lastModified.{sección} = ISO timestamp
        │
        ▼
Guardado silencioso (sin indicador visible)

Al cerrar la ficha:
  refreshLibrary()  ← recarga la lista por si cambió nombre/nivel
  setActiveCharId(null)
  setView('menu')
```

---

## Checklist de release

Cuando publiques una nueva versión, estos **3 valores deben coincidir**:

```
index.html  →  const CURRENT_VERSION = "vX.X Nombre";
js/sw.js    →  const CACHE_NAME = 'forja-vX';
version.json →  { "version": "vX.X Nombre" }
```

Si alguno no coincide, el sistema de actualizaciones fallará o no detectará la nueva versión.
