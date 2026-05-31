// ============================================================
// CHARACTER WIZARD BUILDER — La Forja v15.0
// Función pura: recibe las selecciones del wizard y produce un
// objeto `char` v2 listo para guardar en IndexedDB.
//
// SIN DEPENDENCIAS DE REACT. Esto es lógica de datos, no UI.
// Fácil de testear, fácil de reusar (el Character Sheet también
// podrá llamarlo cuando el usuario edite un personaje completo).
//
// USO:
//   const char = cwBuildCharacter(selections);
//   await DB.put('chars', char);
// ============================================================

// ── Stats base (mínimo legal en D&D 5e) ──────────────────────
const CW_DEFAULT_STATS = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

// ── Modificador de característica ────────────────────────────
function cwAbilityMod(score) {
    return Math.floor((score - 10) / 2);
}

// ── HP de nivel 1: dado de golpe max + mod CON ───────────────
function cwCalcHP(hitDie, conScore, level = 1) {
    const conMod = cwAbilityMod(conScore);
    return hitDie + conMod + (level - 1) * (Math.floor(hitDie / 2) + 1 + conMod);
}

// ── Bono de competencia por nivel ────────────────────────────
function cwProfBonus(level) {
    return Math.ceil(level / 4) + 1;
}

// ── Generar ID único ─────────────────────────────────────────
function cwGenerateId() {
    return 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// ============================================================
// SELECTIONS — Forma esperada del input
// ============================================================
// {
//   mode: 'simple' | 'expert',
//
//   // Paso "Básicos"
//   basics: {
//     name: 'Aragorn',
//     alignment: { index, name, abbreviation },
//     avatar: 'data:image/png;base64,...' | null,
//   },
//
//   // Paso "Clase"
//   classChoice: {
//     class: { index, name, hit_die, primary_ability, saving_throws, proficiencies, proficiency_choices, starting_equipment_options },
//     subclass: { index, name, summary, features } | null,
//   },
//
//   // Paso "Especie"
//   speciesChoice: {
//     species: { index, name, size, speed, traits },
//     subspecies: { index, name, traits } | null,
//   },
//
//   // Paso "Trasfondo"
//   backgroundChoice: {
//     background: { index, name, ability_scores, feat, proficiencies, equipment_options },
//     // El usuario decide cómo aplicar las ability bonuses (+2/+1 o +1/+1/+1)
//     ability_bonus_distribution: { str: 2, dex: 1, ... } | null,
//   },
//
//   // Paso "Stats"
//   stats: {
//     base: { str, dex, con, int, wis, cha },  // antes de bonuses del trasfondo
//     method: 'point_buy' | 'standard_array' | 'manual',
//   },
//
//   // Paso "Equipo"
//   equipment: [
//     { index, name, quantity, source: 'class' | 'background' | 'extra' },
//   ],
//
//   // Paso "Hechizos" (si la clase es lanzadora)
//   spells: {
//     cantrips: [{ index, name }],
//     known: [{ index, name }],
//   },
// }

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================
function cwBuildCharacter(s) {
    if (!s) throw new Error('cwBuildCharacter: selecciones vacías');

    const cls   = s.classChoice?.class || {};
    const sub   = s.classChoice?.subclass || null;
    const spec  = s.speciesChoice?.species || {};
    const subsp = s.speciesChoice?.subspecies || null;
    const bg    = s.backgroundChoice?.background || {};

    // ── Stats finales: base + bonus del trasfondo ─────────────
    // El bonus distribution se guarda en s.stats.bonusDistribution (lo asigna
    // el StepStats), aunque el modelo lógico es que "viene del trasfondo".
    // Soportamos también el campo legacy s.backgroundChoice.ability_bonus_distribution.
    const baseStats = { ...CW_DEFAULT_STATS, ...(s.stats?.base || {}) };
    const bonusDist = s.stats?.bonusDistribution
        || s.backgroundChoice?.ability_bonus_distribution
        || {};
    const finalStats = {
        str: (baseStats.str || 10) + (bonusDist.str || 0),
        dex: (baseStats.dex || 10) + (bonusDist.dex || 0),
        con: (baseStats.con || 10) + (bonusDist.con || 0),
        int: (baseStats.int || 10) + (bonusDist.int || 0),
        wis: (baseStats.wis || 10) + (bonusDist.wis || 0),
        cha: (baseStats.cha || 10) + (bonusDist.cha || 0),
    };

    const level = 1;
    const hitDie = cls.hit_die || 10;
    const profBonus = cwProfBonus(level);

    // ── Construir objeto compatible con DEFAULT_CHAR_V2 ───────
    const char = {
        // ── Identidad ──
        id:        cwGenerateId(),
        name:      s.basics?.name?.trim() || 'Nuevo Héroe',
        alignment: s.basics?.alignment?.name || '',
        avatar:    s.basics?.avatar || null,
        languages: '',

        // ── Especie (snapshot del SRD, editable) ──
        race_data: {
            index:              spec.index || '',
            name:               spec.name || '',
            size:               spec.size || 'Mediano',
            speed:              spec.speed || 30,
            traits:             (spec.traits || []).map(t => ({ index: t.index, name: t.name })),
            subspecies_options: (spec.subspecies || []).map(ss => ({ index: ss.index, name: ss.name })),
        },

        // ── Subespecie ──
        subrace_data: subsp ? {
            index:  subsp.index || '',
            name:   subsp.name || '',
            traits: (subsp.traits || []).map(t => ({ index: t.index, name: t.name })),
        } : { index: '', name: '', traits: [] },

        // ── Clase ──
        class_data: {
            index:            cls.index || '',
            name:             cls.name || '',
            hit_die:          hitDie,
            proficiencies:    (cls.proficiencies || []).map(p => ({ index: p.index, name: p.name })),
            saving_throws:    (cls.saving_throws || []).map(st => (st.index || st).toLowerCase().slice(0,3)),
            subclass_options: (cls.subclasses || []).map(sc => ({ index: sc.index, name: sc.name })),
        },

        // ── Subclase ──
        subclass_data: sub ? {
            index:    sub.index || '',
            name:     sub.name || '',
            summary:  sub.summary || '',
            features: (sub.features || []).map(f => ({
                level: f.level, name: f.name, description: f.description
            })),
        } : { index: '', name: '', summary: '', features: [] },

        // ── Trasfondo ──
        background_data: {
            index:           bg.index || '',
            name:            bg.name || '',
            feature:         '',
            feature_name:    '',
            proficiencies:   (bg.proficiencies || []).map(p => ({ index: p.index, name: p.name })),
            languages:       0,
            ability_bonuses: Object.entries(bonusDist).map(([ability, bonus]) => ({ ability, bonus })),
            feat:            bg.feat ? { index: bg.feat.index, name: bg.feat.name } : null,
        },

        // ── Legacy (compatibilidad hacia atrás con CharacterSheet actual) ──
        class:             cls.name || 'Guerrero',
        race:              spec.name || 'Humano',
        background:        bg.name || '',
        backgroundFeature: '',

        // ── Stats ──
        level:        level,
        stats:        finalStats,
        proficiencies: [
            ...(cls.proficiencies || []).map(p => p.name),
            ...(bg.proficiencies || []).map(p => p.name),
        ],
        savingThrows: (cls.saving_throws || []).map(st => (st.index || st).toLowerCase().slice(0,3)),

        // ── Combate ──
        ac:           10 + cwAbilityMod(finalStats.dex),
        speed:        spec.speed || 30,
        initiative:   cwAbilityMod(finalStats.dex),
        hp:           cwCalcHP(hitDie, finalStats.con, level),
        hpMax:        cwCalcHP(hitDie, finalStats.con, level),
        hpTemp:       0,
        hitDiceTotal: level,
        hitDiceUsed:  0,
        deathSaves:   { successes: 0, failures: 0 },
        profBonus:    profBonus,

        // ── Inventario y equipo ──
        // s.equipment puede venir como:
        //   - Array de items (cuando viene del skipped o legacy)
        //   - { choices: { class_0: 0, bg_0: 0, ... } } (del paso del wizard)
        // Por simplicidad, en v1 dejamos inventario vacío si vienen choices —
        // el usuario añade equipo desde la hoja. Más adelante podemos parsear
        // las opciones del SRD para auto-llenar el inventario.
        inventory: Array.isArray(s.equipment)
            ? s.equipment.map(eq => ({
                id:       'inv_' + Date.now() + Math.random().toString(36).slice(2,8),
                index:    eq.index || '',
                name:     eq.name || '',
                quantity: eq.quantity || 1,
                equipped: false,
                source:   eq.source || 'manual',
            }))
            : [],
        money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },

        // ── Ataques (arrancan vacíos — el usuario los configurará desde el inventario) ──
        attacks: [],

        // ── Hechizos ──
        spells: {
            ability:        cwGetCastingAbility(cls.index),
            saveDC:         null,
            attackBonus:    null,
            cantrips:       (s.spells?.cantrips || []).map(sp => ({
                index: sp.index, name: sp.name, source: 'srd', prepared: true
            })),
            known:          (s.spells?.known || []).map(sp => ({
                index: sp.index, name: sp.name, source: 'srd', prepared: false
            })),
            slots: {},
        },

        // ── Rasgos acumulados (de especie, subespecie, subclase, dote) ──
        features: cwCollectFeatures(spec, subsp, sub, bg),

        // ── Condiciones activas (vacío al crear) ──
        conditions: [],

        // ── Notas y metadatos ──
        notes: '',
        meta: {
            version:      2,
            mode:         s.mode || 'simple',
            createdAt:    new Date().toISOString(),
            lastModified: new Date().toISOString(),
            wizardUsed:   true,
        },
    };

    return char;
}

// ============================================================
// HELPERS
// ============================================================

// ── Característica de lanzamiento por clase ──
function cwGetCastingAbility(classIndex) {
    const map = {
        wizard:   'int',
        cleric:   'wis',
        druid:    'wis',
        ranger:   'wis',
        bard:     'cha',
        sorcerer: 'cha',
        warlock:  'cha',
        paladin:  'cha',
    };
    return map[classIndex] || null;
}

// ── Junta todos los rasgos del personaje en una sola lista ──
function cwCollectFeatures(spec, subsp, sub, bg) {
    const features = [];

    (spec?.traits || []).forEach(t => features.push({
        index:       t.index || '',
        name:        t.name,
        source:      spec.name,
        sourceIndex: spec.index || '',
        type:        'species',
        // description: se carga dinámicamente desde IndexedDB (srd_traits)
    }));

    (subsp?.traits || []).forEach(t => features.push({
        index:       t.index || '',
        name:        t.name,
        source:      subsp.name,
        sourceIndex: subsp.index || '',
        type:        'subspecies',
    }));

    (sub?.features || []).filter(f => f.level === 1).forEach(f => features.push({
        index:       f.index || '',
        name:        f.name,
        source:      sub.name,
        sourceIndex: sub.index || '',
        type:        'subclass',
        description: f.description, // ya incluida en SRD de subclases
    }));

    if (bg?.feat?.name) features.push({
        index:       bg.feat.index || '',
        name:        bg.feat.name,
        source:      bg.name,
        sourceIndex: bg.index || '',
        type:        'feat',
        // description: se carga dinámicamente desde IndexedDB (srd_feats)
    });

    return features;
}

// ============================================================
// SKIP — Crear personaje genérico cuando el usuario presiona SALTAR
// ============================================================
function cwBuildSkippedCharacter() {
    return cwBuildCharacter({
        mode: 'simple',
        basics: { name: 'Nuevo Héroe', alignment: null, avatar: null },
        classChoice: {
            class: {
                index: 'fighter',
                name: 'Guerrero',
                hit_die: 10,
                proficiencies: [],
                saving_throws: [{ index: 'str' }, { index: 'con' }],
            },
            subclass: null,
        },
        speciesChoice: {
            species: { index: 'human', name: 'Humano', size: 'Mediano', speed: 30, traits: [] },
            subspecies: null,
        },
        backgroundChoice: { background: {}, ability_bonus_distribution: null },
        stats: { base: { ...CW_DEFAULT_STATS }, method: 'manual' },
        equipment: [],
        spells: { cantrips: [], known: [] },
    });
}

// ============================================================
// CONSTANTES PÚBLICAS PARA EL WIZARD (UI)
// ============================================================
const CW_POINT_BUY_COSTS = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const CW_POINT_BUY_TOTAL = 27;
const CW_STANDARD_ARRAY  = [15, 14, 13, 12, 10, 8];
const CW_ABILITIES = [
    { key: 'str', name: 'Fuerza',        short: 'FUE' },
    { key: 'dex', name: 'Destreza',      short: 'DES' },
    { key: 'con', name: 'Constitución',  short: 'CON' },
    { key: 'int', name: 'Inteligencia',  short: 'INT' },
    { key: 'wis', name: 'Sabiduría',     short: 'SAB' },
    { key: 'cha', name: 'Carisma',       short: 'CAR' },
];

// ── Exponer al global ──
window.cwBuildCharacter        = cwBuildCharacter;
window.cwBuildSkippedCharacter = cwBuildSkippedCharacter;
window.cwAbilityMod            = cwAbilityMod;
window.cwCalcHP                = cwCalcHP;
window.cwProfBonus             = cwProfBonus;
window.cwGetCastingAbility     = cwGetCastingAbility;
window.CW_DEFAULT_STATS        = CW_DEFAULT_STATS;
window.CW_POINT_BUY_COSTS      = CW_POINT_BUY_COSTS;
window.CW_POINT_BUY_TOTAL      = CW_POINT_BUY_TOTAL;
window.CW_STANDARD_ARRAY       = CW_STANDARD_ARRAY;
window.CW_ABILITIES            = CW_ABILITIES;

// ============================================================
// MODO SIMPLE — Tablas de auto-configuración
// ============================================================

// ── Trasfondo recomendado por clase ──────────────────────────
// Solo hay 4 trasfondos en SRD 2024: Acólito, Criminal, Sabio, Soldado
const CW_SIMPLE_BG_BY_CLASS = {
    barbarian:'soldier',
    bard:     'sage',
    cleric:   'acolyte',
    druid:    'sage',
    fighter:  'soldier',
    monk:     'soldier',
    paladin:  'acolyte',
    ranger:   'soldier',
    rogue:    'criminal',
    sorcerer: 'sage',
    warlock:  'sage',
    wizard:   'sage',
};

// ── Standard Array auto-asignado por clase ───────────────────
// Cada clase recibe los 6 valores [15,14,13,12,10,8] distribuidos
// según prioridad de stats (de más a menos importante para la clase).
const CW_SIMPLE_STAT_PRIORITY = {
    barbarian: ['str', 'con', 'dex', 'wis', 'cha', 'int'],
    bard:      ['cha', 'dex', 'con', 'int', 'wis', 'str'],
    cleric:    ['wis', 'con', 'str', 'dex', 'cha', 'int'],
    druid:     ['wis', 'con', 'dex', 'int', 'str', 'cha'],
    fighter:   ['str', 'con', 'dex', 'wis', 'int', 'cha'],
    monk:      ['dex', 'wis', 'con', 'str', 'int', 'cha'],
    paladin:   ['str', 'cha', 'con', 'wis', 'dex', 'int'],
    ranger:    ['dex', 'wis', 'con', 'str', 'int', 'cha'],
    rogue:     ['dex', 'int', 'con', 'wis', 'cha', 'str'],
    sorcerer:  ['cha', 'con', 'dex', 'wis', 'int', 'str'],
    warlock:   ['cha', 'con', 'dex', 'wis', 'int', 'str'],
    wizard:    ['int', 'dex', 'con', 'wis', 'cha', 'str'],
};

// Genera stats base para modo simple usando la prioridad de la clase
function cwSimpleStandardArray(classIndex) {
    const priority = CW_SIMPLE_STAT_PRIORITY[classIndex];
    if (!priority) return { ...CW_DEFAULT_STATS };
    const stats = {};
    priority.forEach((stat, idx) => {
        stats[stat] = CW_STANDARD_ARRAY[idx]; // [15,14,13,12,10,8]
    });
    return stats;
}

// Genera bonus distribution del trasfondo: +2 a primaria, +1 a segunda
// si están en la lista de stats del trasfondo. Si no hay match exacto,
// reparte +2 al primer stat del trasfondo y +1 al segundo.
function cwSimpleBonusDistribution(classIndex, bgStats) {
    if (!bgStats || bgStats.length === 0) return {};
    const priority = CW_SIMPLE_STAT_PRIORITY[classIndex] || [];
    const bgIndexes = bgStats.map(s => (s.index || '').toLowerCase());

    const result = {};
    // Buscar la primaria de la clase entre los stats del trasfondo
    const primary   = priority.find(p => bgIndexes.includes(p));
    // Buscar la segunda más importante
    const secondary = priority.find(p => bgIndexes.includes(p) && p !== primary);

    if (primary)   result[primary] = 2;
    if (secondary) result[secondary] = 1;

    // Si no hubo match (caso raro), reparte 2/1 a los dos primeros del trasfondo
    if (!primary && bgIndexes[0]) result[bgIndexes[0]] = 2;
    if (!secondary && bgIndexes[1] && bgIndexes[1] !== bgIndexes[0]) {
        result[bgIndexes[1]] = 1;
    }
    return result;
}

window.CW_SIMPLE_BG_BY_CLASS     = CW_SIMPLE_BG_BY_CLASS;
window.CW_SIMPLE_STAT_PRIORITY   = CW_SIMPLE_STAT_PRIORITY;
window.cwSimpleStandardArray     = cwSimpleStandardArray;
window.cwSimpleBonusDistribution = cwSimpleBonusDistribution;