# La Forja — Diagramas de Flujo
_v15.0 · 2026-06-27_

> Renderizar con la extensión **Markdown Preview Mermaid Support** en VS Code,
> o pegar el bloque en [mermaid.live](https://mermaid.live)

---

## 1. Arranque de la App

```mermaid
flowchart TD
    A([Usuario abre La Forja]) --> B{Service Worker\nregistrado?}

    B -->|No| C[Registrar sw.js\nInstalar caché de assets]
    B -->|Sí| D[SW activo\ncache-first listo]
    C --> D

    D --> E[index.html\ndesde caché o red]
    E --> F[Cargar scripts en orden\nReact · Tailwind · Babel\nFuse · Módulos · updateChecker]
    F --> G[Babel compila JSX\nReact renderiza App]
    G --> H[Loader animado\nmín. 2.5 s]

    H --> I1[migrateFromLocalStorage]
    H --> I2[loadSRDIfNeeded]
    H --> I3[getSetting dark_mode]
    H --> I4[getLibrary]

    I1 --> M1{Datos en\nlocalStorage?}
    M1 -->|Sí| M1Y[Mover a IndexedDB\nBorrar localStorage]
    M1 -->|No| M1N[Skip]

    I2 --> M2{SRD ya\ncargado?}
    M2 -->|No| M2N[Fetch 21 JSONs SRD/es/\nGuardar en IndexedDB]
    M2 -->|Sí| M2Y[Skip]

    M1Y --> READY[App lista]
    M1N --> READY
    M2N --> READY
    M2Y --> READY
    I3  --> READY
    I4  --> READY

    READY --> HIDE[Loader desaparece]
    HIDE --> MENU([Vista: menu])
    HIDE --> UPD[ForjaUpdater.checkIfNeeded\nen background]
```

---

## 2. Navegación entre Vistas

```mermaid
flowchart TD
    MENU[📋 MainMenu\nLista de personajes]

    MENU -->|Nuevo héroe rápido| SHEET[📄 CharacterSheet]
    MENU -->|Asistente de creación| WIZ[🧙 CharacterWizard]
    MENU -->|Abrir personaje existente| SHEET
    MENU -->|Biblioteca| LIB[📚 LibraryManager]
    MENU -->|Acerca de| ABOUT[ℹ️ AboutScreen]

    WIZ -->|Creación completada| SHEET
    WIZ -->|Cerrar / Back confirmado| MENU

    SHEET -->|Cerrar / Back| MENU
    LIB   -->|Cerrar / Back| MENU
    ABOUT -->|Volver| MENU

    SHEET -.->|Abrir Biblioteca\ndesde hoja| LIB

    BACK([Back hardware Android]) --> BACK_LOG{Vista\nactual}
    BACK_LOG -->|modal abierto| CLOSE_MODAL[Cerrar modal]
    BACK_LOG -->|wizard| WIZ
    BACK_LOG -->|sheet / library / about| MENU
    BACK_LOG -->|menu| EXIT[Salir de la app\nCapacitor.exitApp]
```

---

## 3. Character Wizard — 9 Pasos

```mermaid
flowchart TD
    START([Abrir Asistente]) --> S0[Paso 0 · Modo\nSimple o Experto]
    S0 --> S1[Paso 1 · Básicos\nNombre e imagen de perfil]
    S1 --> S2[Paso 2 · Clase\nElegir del SRD]
    S2 --> S3[Paso 3 · Especie\nElegir del SRD]
    S3 --> S4[Paso 4 · Trasfondo\nElegir del SRD]
    S4 --> S5[Paso 5 · Stats\nArray fijo 15-14-13-12-10-8]
    S5 --> S6[Paso 6 · Equipo\nEquipamiento inicial SRD]
    S6 --> CASTER{¿La clase\nes lanzadora?}

    CASTER -->|Sí| S7[Paso 7 · Hechizos\nElegir hechizos conocidos]
    CASTER -->|No| S8

    S7 --> S8[Paso 8 · Resumen\nRevisión de todo]

    S8 -->|Confirmar| BUILD[cwBuildCharacter\nProduce char v2 completo\nHP · Slots · Proficiencias]
    S8 -->|Volver atrás| S5

    BUILD --> SAVE[DB.saveChar\nDB.saveLibrary]
    SAVE --> SHEET([📄 CharacterSheet])

    S1 -.->|Back hardware| MODAL{¿Abandonar\ncreación?}
    S2 -.->|Back hardware| MODAL
    S3 -.->|Back hardware| MODAL
    MODAL -->|Sí| MENU([📋 MainMenu])
    MODAL -->|No| STAY[Continuar]

    STEPPER([Stepper superior\nclickeable]) -.->|Ir a paso anterior| S1
    STEPPER -.->|Ir a paso anterior| S2
    STEPPER -.->|Ir a paso anterior| S3
```

---

## 4. Sistema de Actualizaciones OTA

```mermaid
flowchart TD
    T1([App arranca]) --> AUTO[ForjaUpdater\ncheckIfNeeded]
    T2([Botón en\nAcerca De]) --> MANUAL[ForjaUpdater\ncheck — ignora intervalo]

    AUTO --> TIME{¿Pasaron\nmás de 56 h?}
    TIME -->|No| NOOP[No hacer nada]
    TIME -->|Sí| FETCH

    MANUAL --> FETCH[Fetch version.json\ncache: no-store\nSW no cachea este archivo]

    FETCH --> NET{¿Hay\nconexión?}
    NET -->|No| ERR[Mostrar error\nSin conexión · Reintentar]
    NET -->|Sí| SAVE_TS[Guardar timestamp\nde última revisión]

    SAVE_TS --> CMP{¿Versión remota\ndistinta a\nCURRENT_VERSION?}
    CMP -->|No| UTDATE[Mostrar\nYa tienes la última versión]
    CMP -->|Sí| DISM{¿Usuario ya\ndescartó esta versión?}

    DISM -->|Sí| NOOP2[No mostrar banner]
    DISM -->|No| BANNER[Mostrar UpdateBanner\nbarra dorada en la parte superior]

    BANNER --> ACT{Acción\ndel usuario}
    ACT -->|✕ Cerrar| DISMISS[dismiss en localStorage\nBanner desaparece\nhasta la próxima versión]
    ACT -->|Actualizar| APPLY[applyUpdate]

    ABOUT_BTN([Botón Actualizar\nen AboutScreen]) --> APPLY

    APPLY --> SW_MSG[SW.waiting\npostMessage SKIP_WAITING]
    SW_MSG --> CLEAR[Borrar todos\nlos caches del SW]
    CLEAR --> RELOAD[location.reload]
    RELOAD --> DONE([Nueva versión activa\nSW descarga assets frescos])
```
