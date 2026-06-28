# ⚒️ La Forja de Héroes

**Ficha de personaje para D&D 5e en español — PWA offline-first, sin registro, sin suscripción.**

> Creada para la comunidad hispanohablante que merece jugar Dungeons & Dragons en su idioma.

---

## Índice

1. [¿Qué es?](#1-qué-es)
2. [¿Por qué existe?](#2-por-qué-existe)
3. [Objetivo](#3-objetivo)
4. [¿Cómo funciona?](#4-cómo-funciona)
5. [Instalación y requisitos](#5-instalación-y-requisitos)
6. [Cómo usar la app — guía completa](#6-cómo-usar-la-app--guía-completa)
7. [Limitaciones conocidas](#7-limitaciones-conocidas)
8. [Lo que aprendí haciendo esto](#8-lo-que-aprendí-haciendo-esto)
9. [Creador y contacto](#9-creador-y-contacto)
10. [Licencia SRD](#10-licencia-srd)

---

## 1. ¿Qué es?

**La Forja de Héroes** es una aplicación web progresiva (PWA) para gestionar fichas de personajes de **Dungeons & Dragons 5ª Edición**, completamente en español. Funciona en el navegador de tu celular, tablet o PC sin necesidad de instalar nada extra, y una vez que cargues los datos por primera vez, **funciona sin conexión a internet**.

No requiere crear una cuenta. No tiene suscripciones. No guarda tus datos en ningún servidor. Todo vive en tu propio dispositivo.

### ¿Qué incluye?

- Ficha de personaje completa y editable
- Asistente de creación guiada (Character Wizard) de 9 pasos
- Base de datos del SRD 5.1 en español:
  - Clases y subclases
  - Especies y subespecies (razas)
  - Trasfondos
  - **15,824 líneas de hechizos traducidos** (el catálogo más extenso del SRD)
  - Equipo, items mágicos, categorizaciones
  - Rasgos, competencias, condiciones, lenguajes, escuelas de magia, tipos de daño, propiedades de armas
  - En total: **41,696 líneas de datos del SRD traducidas al español**
- Biblioteca de contenido homebrew (tus propios hechizos, items y más)
- Dados integrados con animaciones
- Modo oscuro y modo claro
- Actualizaciones automáticas en segundo plano

---

## 2. ¿Por qué existe?

Existe una aplicación llamada **D&D Beyond**, desarrollada por el propio Wizards of the Coast (los creadores de D&D). Es, sin exagerar, una maravilla tecnológica: física de dados en 3D, mesas de juego virtuales completas, sesiones en tiempo real, contenido oficial actualizado, una experiencia digna de una empresa grande. Es obviamente muchísimas veces más completa que esta app.

**Pero está en inglés.**

Mis amigos no saben inglés. Yo sí, pero el problema no es solo entender; es que traducir un hechizo en plena partida te saca completamente de la inmersión. Pausar para buscar en Google qué hace *Thunderwave* o cómo funciona *Wild Shape* destruye el ritmo de la mesa.

Wizards of the Coast tiene D&D Beyond en inglés, portugués y otros idiomas. No en español. Y el español no es un idioma menor: es la **segunda lengua más hablada en el mundo por número de hablantes nativos**, con más de 480 millones de personas, presente en más de 20 países. Para ponerlo en perspectiva, hay más hispanohablantes nativos que angloparlantes nativos. Y aun así, nadie hace esto bien.

Esa fue la chispa. No para competir con WotC — eso sería absurdo — sino para llenar un hueco real que ellos no están llenando. Si pudiera unirme a ellos y construir una traducción pulcra y oficial desde adentro, lo haría sin dudarlo. Pero la vida no es tan sencilla, y mientras tanto aquí estamos.

### El trabajo detrás de los datos

Traducir 41,696 líneas de JSON no es solo copiar y pegar. Cada hechizo, cada clase, cada especie tiene descripciones, mecánicas, listas anidadas, tablas de progresión. Había partes tan largas que ni siquiera los modelos de IA podían procesarlas en un solo contexto. Todo fue línea por línea, revisando que las mecánicas tuvieran sentido en español y que los términos fueran consistentes a lo largo de todo el compendio.

---

## 3. Objetivo

Que cualquier grupo de jugadores hispanohablantes pueda sentarse a jugar D&D 5e con una herramienta digital útil, en su idioma, sin pagar nada y sin depender de internet.

Esta app fue creada para el público hispanohablante y eso no va a cambiar. No tendrá traducción a otros idiomas porque para eso ya existe D&D Beyond. El español no necesita ser la opción de segunda.

---

## 4. ¿Cómo funciona?

La Forja es una **Single Page Application** construida con React, Tailwind CSS y Babel, todo corriendo en el navegador sin pasos de compilación ni servidores propios. Funciona como una PWA gracias a un Service Worker que:

1. Descarga todos los archivos necesarios al dispositivo en la primera visita
2. A partir de ahí sirve todo desde el caché local — sin internet
3. Chequea actualizaciones en segundo plano aproximadamente 3 veces por semana
4. Avisa cuando hay una versión nueva disponible, para que tú decidas cuándo actualizar

### Almacenamiento

Todos tus personajes y configuración se guardan en **IndexedDB**, la base de datos local del navegador. No hay servidor, no hay cuenta. Tus datos son tuyos y viven en tu dispositivo.

Los datos del SRD (hechizos, clases, razas, etc.) se descargan en la primera apertura y se guardan también en IndexedDB. Después de eso, la app funciona completamente offline.

### Sin build, sin npm, sin CDN

Todo está incluido localmente: React, Tailwind, Babel, Fuse.js para búsquedas, IDB para IndexedDB, Three.js preparado para futuro uso. No hay paso de compilación. Lo que ves en el repo es exactamente lo que corre en el navegador.

---

## 5. Instalación y requisitos

### Para usarla (usuarios finales)

**No se instala nada.** Abre el navegador y ve a:

```
https://evionail.github.io/La_Forja/
```

Para tenerla como app en tu celular (Android o iOS):

1. Abre la URL en Chrome (Android) o Safari (iOS)
2. Toca el menú del navegador
3. Selecciona **"Agregar a pantalla de inicio"** o **"Instalar app"**
4. La próxima vez se abre como una app nativa, sin barra de navegador

**Primera apertura:** necesitas internet para que descargue los datos del SRD (~40MB). Después de eso, todo funciona sin conexión.

### Requisitos mínimos

| Requisito | Detalle |
|---|---|
| Navegador | Chrome 90+, Safari 15+, Firefox 90+, Edge 90+ |
| Espacio en dispositivo | ~50 MB (caché del SW + IndexedDB) |
| Internet | Solo para la primera carga y para actualizaciones |
| Cuenta o registro | No se requiere |
| Costo | Gratuito, siempre |

### Para correrla en local (desarrolladores)

No hay servidor que levantar. Basta con servir los archivos estáticos:

```bash
# Con Python
python -m http.server 8080

# Con Node (si tienes npx)
npx serve .

# Con VS Code
Instala la extensión "Live Server" y haz clic en "Go Live"
```

Luego abre `http://localhost:8080` en el navegador.

> **Nota:** El Service Worker requiere HTTPS o `localhost` para funcionar. En `file://` no carga correctamente.

---

## 6. Cómo usar la app — guía completa

### Pantalla principal (Menú)

Al abrir la app ves el menú principal con tu lista de personajes. Desde aquí puedes:

- **Nuevo héroe (rápido)** — Crea una ficha vacía que puedes rellenar manualmente
- **Asistente de creación** — Crea un personaje guiado paso a paso con datos del SRD
- **Biblioteca** — Accede al compendio de hechizos, equipo y contenido homebrew
- **Acerca de** — Información de la app y botón para revisar actualizaciones

---

### Asistente de Creación (Character Wizard)

El asistente te lleva por **9 pasos** para construir un personaje completo:

#### Paso 0 — Modo
Elige entre **Simple** (campos básicos, ideal para principiantes) o **Experto** (acceso a todas las opciones del SRD).

#### Paso 1 — Básicos
- Nombre de tu personaje
- Foto de perfil (opcional, se redimensiona automáticamente)

#### Paso 2 — Clase
Elige entre todas las clases disponibles en el SRD en español:
Bárbaro, Bardo, Clérigo, Druida, Explorador, Guerrero, Hechicero, Mago, Monje, Paladín, Pícaro y Brujo.
Cada clase muestra su dado de golpe, competencias y rasgos.

#### Paso 3 — Especie
Selecciona la especie (raza) de tu personaje con todos sus rasgos raciales en español. Incluye subespecies donde aplica.

#### Paso 4 — Trasfondo
Elige el trasfondo que define la historia previa de tu personaje. Cada trasfondo otorga competencias, equipo inicial y un rasgo de personalidad característico.

#### Paso 5 — Características
Asigna las 6 puntuaciones base (FUE, DES, CON, INT, SAB, CAR) usando el **array estándar** [15, 14, 13, 12, 10, 8]. La app aplica automáticamente los bonificadores raciales.

#### Paso 6 — Equipo
Selecciona el equipo inicial basado en tu clase y trasfondo. Todo el inventario de armas, armaduras e items viene del SRD traducido.

#### Paso 7 — Hechizos *(solo clases lanzadoras)*
Si tu clase puede lanzar hechizos, aquí eliges tus hechizos conocidos o preparados de nivel 1. Los 15,824 líneas del compendio de hechizos están disponibles con nombres, descripciones y mecánicas en español. Este paso se **salta automáticamente** para clases no lanzadoras.

#### Paso 8 — Resumen
Revisa todo antes de confirmar. Puedes volver a cualquier paso anterior usando el **stepper** en la parte superior.

Al confirmar, el asistente genera automáticamente:
- HP máximos calculados (dado de golpe máximo + modificador de CON)
- Slots de hechizos por nivel
- Competencias consolidadas de clase + trasfondo
- Salvaciones

---

### Ficha de Personaje (CharacterSheet)

La ficha tiene secciones accesibles por pestañas:

#### Identidad
Nombre, nivel, clase, especie, trasfondo, alineamiento, idiomas. Todo editable en cualquier momento.

#### Estadísticas
Las 6 características con sus modificadores calculados automáticamente. También CA, Iniciativa, Velocidad e Inspiración. Los bonificadores de competencia se calculan solos según el nivel.

#### Combate
- PG (Puntos de Golpe) actuales, máximos y temporales
- Tiradas de muerte (éxitos y fallos)
- Dados de golpe disponibles y usados
- Lista de ataques y acciones de combate

#### Hechizos
Lista de hechizos conocidos o preparados, organizados por nivel. Slots de hechizos con seguimiento de uso (marcados/desmarcados con un toque). Incluye el área de Trucos (nivel 0).

#### Inventario
Campo de texto libre para todo tu equipo, más el monedero con las 5 denominaciones: PC, PP, PE, PO, PP.

#### Notas
Espacio libre para notas de personaje, rasgos de personalidad, defectos, ideales y vínculos.

#### Lanzador de Dados
Dados integrados con animación: d4, d6, d8, d10, d12, d20, d100. Guarda el historial de tiradas de la sesión.

---

### Biblioteca

La Biblioteca es el **compendio** de toda la información del SRD accesible para consulta y para crear contenido propio.

#### Explorar el SRD
Navega por pestañas: Hechizos, Equipo, Feats, Rasgos, Especies, Clases, Subclases, etc. La búsqueda usa **Fuse.js** (búsqueda difusa), así que no necesitas escribir el nombre exacto — con poner parte del nombre o una palabra clave es suficiente.

#### Homebrew
Puedes crear tu propio contenido que se integra con el resto de la biblioteca:
- Hechizos personalizados (con todos sus campos: nivel, escuela, tiempo de lanzamiento, alcance, componentes, descripción, daño)
- Items de equipo
- Feats
- Rasgos y más

Todo el homebrew se guarda localmente en tu dispositivo y aparece junto con el contenido oficial del SRD en la biblioteca.

#### Vincular con la ficha
Desde la Biblioteca puedes agregar hechizos o ataques directamente a la ficha del personaje activo.

---

### Acerca de / Actualizaciones

En la pantalla de **Acerca de** hay un botón **"Buscar actualizaciones"** que compara tu versión instalada con la última publicada. Si hay algo nuevo te lo dice y puedes actualizar con un solo toque — sin borrar la app, sin perder datos.

La app también revisa actualizaciones automáticamente en segundo plano, aproximadamente **3 veces por semana** (cada ~56 horas). Si detecta una versión nueva aparece un aviso dorado en la parte superior que puedes cerrar o aceptar.

---

### Modo oscuro

El botón de luna/sol en la esquina superior del menú alterna entre modo claro y modo oscuro. La preferencia se guarda y se recuerda entre sesiones.

---

## 7. Limitaciones conocidas

La Forja es una herramienta de ficha de personaje, no una plataforma de juego completa. Comparada con D&D Beyond u otras soluciones de mesa virtual (VTT), estas son sus limitaciones actuales:

### Funcionalidades que no existen (y probablemente no existirán)

| Limitación | Por qué |
|---|---|
| Sesiones multijugador en tiempo real | Requeriría servidores, cuentas de usuario y sincronización — todo lo que esta app evita intencionalmente |
| Mesa de juego virtual (VTT) con mapas | Fuera del alcance del proyecto actual |
| Dados 3D con física real | Three.js está incluido pero no activo — es trabajo futuro |
| Modelos 3D del personaje | No es una prioridad, requeriría assets con licencia |
| Contenido exclusivo del PHB pago | Solo puede incluir contenido del SRD (Creative Commons). Todo lo publicado fuera del SRD es material con derechos reservados |
| Exportar la ficha a PDF | No implementado aún |
| Sincronización entre dispositivos | Sin servidor, no hay forma de sincronizar — tus datos viven solo en el dispositivo donde los creaste |
| Notificaciones push | No implementado |
| Gestión de campaña | La app gestiona personajes individuales, no campañas completas |
| Constructor de encuentros | No existe aún |
| Monstruos en español | El JSON de Monstruos no fue traducido — solo existe la versión en inglés |
| Imprimir cartas de hechizos | No implementado |
| Historial de sesiones o notas de campaña | Solo hay notas libres por personaje |
| Cuentas de usuario | Diseño intencional — sin cuentas, sin datos en servidores |
| Acceso al contenido de 2024 (PHB 2024) | Los datos están basados en el SRD 5.1 y SRD 5.2 en las partes disponibles bajo Creative Commons |

### Limitaciones técnicas

- **Primera carga requiere internet:** Los datos del SRD son ~40MB. Una vez cargados, todo funciona offline.
- **Los datos no se sincronizan entre dispositivos:** Si juegas en el celular y en la tablet, tus personajes son independientes en cada dispositivo.
- **Las imágenes de perfil solo se guardan en el dispositivo donde se cargaron.**
- **Borrar el caché del navegador borra la app** (aunque el sistema de actualizaciones OTA intenta evitar que esto sea necesario).
- **iOS Safari** tiene algunas restricciones con PWA que pueden afectar el comportamiento del Service Worker en versiones antiguas.

---

## 8. Lo que aprendí haciendo esto

Hacer una aplicación con Inteligencia Artificial es mucho más complicado de lo que la gente cree.

Al principio todo era un solo archivo de código enorme que hacía la vida imposible: cualquier cambio pequeño podía romper algo en otra parte, y encontrar el error era como buscar una aguja en un pajar de miles de líneas. Con el tiempo aprendí a modularizar — separar responsabilidades, dividir el código en archivos con propósitos claros — y eso cambió todo.

Aun así, hay algo que la gente tiende a no entender: **usar IA para programar no es darle un solo prompt y recibir una app terminada**. No funciona así. Cada funcionalidad requiere iterar, probar, ver que falla, corregir el prompt, volver a intentar, descubrir que la corrección rompió algo anterior, volver a corregir, y así durante horas. Horas reales, de verdad, no minutos.

Han pasado menos de dos meses desde que empecé y la cantidad de cambios que ha recibido esta app es impresionante. No porque sea fácil sino porque le he dedicado muchísimo tiempo. Más del que cualquiera imagina al ver el resultado.

¿Merece la misma consideración que código escrito completamente a mano? Eso es subjetivo y cada quien tendrá su opinión. Lo que sí puedo decir es que el resultado funciona, que resuelve un problema real, y que está hecho con intención, no accidentalmente. Habrá quienes critiquen que esté hecho con IA — que está bien, cada quien tiene su perspectiva. Pero si alguien cree que esto es trivial, los invito a replicarlo desde cero.

Y si encuentras algo roto: escríbeme. No siempre puedo responder rápido porque esto no es mi trabajo remunerado, pero lo intento.

---

## 9. Creador y contacto

**Evo.Dev Studio** — Desarrollado por Evionail

- Email: [evodev.studio@gmail.com](mailto:evodev.studio@gmail.com)
- Facebook: búscame como Evionail si me has visto publicar por ahí (el email es mejor para bugs)

Si quieres reportar un bug, sugerir algo, o simplemente decir que la app te fue útil, escribe al email. Lo leeré.

### Apoyo voluntario

Esta app es completamente gratuita y siempre lo será. Si te ha sido útil y quieres contribuir con algo — lo que sea, aunque sea un dólar — puedes hacerlo vía PayPal al correo **evodev.studio@gmail.com**. No es obligatorio ni esperado, pero sería recibido con mucho gusto y mucha gratitud.

---

## 10. Licencia SRD

### SRD 5.1

This work includes material taken from the **System Reference Document 5.1 ("SRD 5.1")** by Wizards of the Coast LLC and available at [https://dnd.wizards.com/resources/systems-reference-document](https://dnd.wizards.com/resources/systems-reference-document).

The SRD 5.1 is licensed under the **Creative Commons Attribution 4.0 International License** available at [https://creativecommons.org/licenses/by/4.0/legalcode](https://creativecommons.org/licenses/by/4.0/legalcode).

### SRD 2024 (5.2)

This work includes material taken from the **System Reference Document 5.2 ("SRD 5.2")** by Wizards of the Coast LLC. The SRD 5.2 is licensed under the **Creative Commons Attribution 4.0 International License** available at [https://creativecommons.org/licenses/by/4.0/legalcode](https://creativecommons.org/licenses/by/4.0/legalcode).

---

*Dungeons & Dragons, D&D, y todos los nombres, personajes, lugares e iconografía relacionados son marcas registradas de Wizards of the Coast LLC. La Forja de Héroes no está afiliada, patrocinada ni avalada por Wizards of the Coast LLC.*

*"¡Que tus tiradas sean naturales de 20!" 🎲*
