// ============================================================
// LM FORM CONFIG — La Forja v14.8
// Define qué campos pide cada categoría de homebrew y cómo
// construir el objeto final con estructura compatible con SRD.
// Usado por lmForms.js. Cargar antes que lmForms.js.
// ============================================================

// ── Catálogos compartidos ────────────────────────────────────
const LM_SCHOOLS = [
    { index: 'abjuration',     name: 'Abjuración' },
    { index: 'conjuration',    name: 'Conjuración' },
    { index: 'divination',     name: 'Adivinación' },
    { index: 'enchantment',    name: 'Encantamiento' },
    { index: 'evocation',      name: 'Evocación' },
    { index: 'illusion',       name: 'Ilusión' },
    { index: 'necromancy',     name: 'Nigromancia' },
    { index: 'transmutation',  name: 'Transmutación' },
];

const LM_CLASSES_SPELL = [
    { index: 'bard',      name: 'Bardo' },
    { index: 'cleric',    name: 'Clérigo' },
    { index: 'druid',     name: 'Druida' },
    { index: 'paladin',   name: 'Paladín' },
    { index: 'ranger',    name: 'Explorador' },
    { index: 'sorcerer',  name: 'Hechicero' },
    { index: 'warlock',   name: 'Brujo' },
    { index: 'wizard',    name: 'Mago' },
];

const LM_DAMAGE_TYPES = [
    { index: 'acid',         name: 'Ácido' },
    { index: 'bludgeoning',  name: 'Contundente' },
    { index: 'cold',         name: 'Frío' },
    { index: 'fire',         name: 'Fuego' },
    { index: 'force',        name: 'Fuerza' },
    { index: 'lightning',    name: 'Relámpago' },
    { index: 'necrotic',     name: 'Necrótico' },
    { index: 'piercing',     name: 'Perforante' },
    { index: 'poison',       name: 'Veneno' },
    { index: 'psychic',      name: 'Psíquico' },
    { index: 'radiant',      name: 'Radiante' },
    { index: 'slashing',     name: 'Cortante' },
    { index: 'thunder',      name: 'Trueno' },
];

const LM_RARITIES = [
    { index: 'common',     name: 'Común' },
    { index: 'uncommon',   name: 'Infrecuente' },
    { index: 'rare',       name: 'Raro' },
    { index: 'very-rare',  name: 'Muy Raro' },
    { index: 'legendary',  name: 'Legendario' },
];

const LM_EQUIP_CATEGORIES = [
    { index: 'weapon',           name: 'Arma' },
    { index: 'armor',            name: 'Armadura' },
    { index: 'adventuring-gear', name: 'Equipo de aventurero' },
    { index: 'tools',            name: 'Herramienta' },
    { index: 'ammunition',       name: 'Munición' },
    { index: 'mounts-and-other-animals', name: 'Montura' },
    { index: 'tack-harness-drawn-vehicles', name: 'Vehículo' },
];

const LM_MAGIC_ITEM_CATEGORIES = [
    { index: 'armor',          name: 'Armadura' },
    { index: 'potion',         name: 'Poción' },
    { index: 'ring',           name: 'Anillo' },
    { index: 'rod',            name: 'Vara' },
    { index: 'scroll',         name: 'Pergamino' },
    { index: 'staff',          name: 'Báculo' },
    { index: 'wand',           name: 'Varita' },
    { index: 'weapon',         name: 'Arma' },
    { index: 'wondrous-items', name: 'Objeto maravilloso' },
];

const LM_FEAT_TYPES = [
    { value: 'origin',         label: 'Origen (Origin)' },
    { value: 'general',        label: 'General' },
    { value: 'fighting-style', label: 'Estilo de combate' },
    { value: 'epic-boon',      label: 'Don épico (Epic Boon)' },
];

const LM_PROF_TYPES = [
    { value: 'Armas',                      label: 'Armas' },
    { value: 'Armaduras',                  label: 'Armaduras' },
    { value: 'Herramientas',               label: 'Herramientas' },
    { value: "Herramientas de Artesano",   label: 'Herramientas de Artesano' },
    { value: 'Instrumentos Musicales',     label: 'Instrumentos Musicales' },
    { value: 'Tiradas de Salvación',       label: 'Tiradas de Salvación' },
    { value: 'Habilidades',                label: 'Habilidades' },
    { value: 'Otros',                      label: 'Otros' },
];

const LM_ABILITY_SCORES = [
    { index: 'str', name: 'FUE' },
    { index: 'dex', name: 'DES' },
    { index: 'con', name: 'CON' },
    { index: 'int', name: 'INT' },
    { index: 'wis', name: 'SAB' },
    { index: 'cha', name: 'CAR' },
];

// Mapping de tipos de proficiencia inglés → español (si los JSONs
// vienen en inglés). Si ya vienen en español, se usa el valor tal cual.
const LM_PROF_TYPE_MAP = {
    'Skills':                'Habilidades',
    'Saving Throws':         'Tiradas de Salvación',
    'Weapons':               'Armas',
    'Armor':                 'Armaduras',
    "Artisan's Tools":       'Herramientas de Artesano',
    'Musical Instruments':   'Instrumentos Musicales',
    'Gaming Sets':           'Sets de Juego',
    'Tools':                 'Herramientas',
    'Vehicles':              'Vehículos',
    'Other':                 'Otros',
};

// Orden en que se muestran los grupos en el multiselect agrupado
const LM_PROF_GROUP_ORDER = [
    'Habilidades',
    'Tiradas de Salvación',
    'Herramientas de Artesano',
    'Instrumentos Musicales',
    'Herramientas',
    'Sets de Juego',
    'Armas',
    'Armaduras',
    'Vehículos',
    'Otros',
];

// (LM_FEATS_FALLBACK eliminado — los selectores ahora cargan
// dinámicamente desde IndexedDB en lmForms.js → lmLoadDynamicOptions)

// ── Tipos de campo soportados ────────────────────────────────
// text, textarea, number, select, multiselect, checkbox, group_check (V/S/M)

// ── CONFIG POR CATEGORÍA ─────────────────────────────────────
const LM_FORM_CONFIG = {

    // ──── HECHIZOS ────────────────────────────────────────────
    srd_spells: {
        label: 'Hechizo',
        icon: '✦',
        essential: [
            { key: 'name',   type: 'text',     label: 'Nombre', required: true,
              placeholder: 'Ej: Llama Sagrada' },
            { key: 'level',  type: 'select',   label: 'Nivel',
              options: [
                  { value: 0, label: 'Truco (0)' },
                  ...[1,2,3,4,5,6,7,8,9].map(n => ({ value: n, label: `Nivel ${n}` }))
              ] },
            { key: 'school', type: 'select',   label: 'Escuela',
              options: LM_SCHOOLS.map(s => ({ value: s.index, label: s.name, _ref: s })) },
            { key: 'desc',   type: 'textarea', label: 'Descripción',
              placeholder: 'Describe el efecto del hechizo. Si causa daño, indícalo aquí (ej: "causa 4d6 de daño por fuego")...' },
        ],
        advanced: [
            { key: 'casting_time', type: 'text', label: 'Tiempo de lanzamiento',
              placeholder: 'Ej: 1 acción, 1 acción adicional, 1 reacción...' },
            { key: 'range',        type: 'text', label: 'Alcance',
              placeholder: 'Ej: 60 pies, Toque, Personal...' },
            { key: 'duration',     type: 'text', label: 'Duración',
              placeholder: 'Ej: Instantánea, Concentración hasta 1 minuto...' },
            { key: 'concentration', type: 'checkbox', label: 'Requiere concentración' },
            { key: 'ritual',        type: 'checkbox', label: 'Se puede lanzar como ritual' },
            { key: 'components',    type: 'group_check', label: 'Componentes',
              options: [
                  { value: 'V', label: 'Verbal (V)' },
                  { value: 'S', label: 'Somático (S)' },
                  { value: 'M', label: 'Material (M)' },
              ] },
            { key: 'material', type: 'text', label: 'Componente material',
              placeholder: 'Ej: Una pizca de azufre, un cristal pequeño...' },
            { key: 'classes', type: 'multiselect', label: 'Clases que pueden lanzarlo',
              options: LM_CLASSES_SPELL.map(c => ({ value: c.index, label: c.name, _ref: c })) },
            { key: 'damage_dice', type: 'text', label: 'Dado de daño',
              placeholder: 'Ej: 4d6, 1d8 + 3...' },
            { key: 'damage_type', type: 'select', label: 'Tipo de daño',
              options: [{ value: '', label: '— Ninguno —' },
                  ...LM_DAMAGE_TYPES.map(d => ({ value: d.index, label: d.name, _ref: d }))] },
            { key: 'higher_level', type: 'textarea', label: 'A niveles superiores',
              placeholder: 'Ej: Cuando lanzas este conjuro usando un espacio de nivel 4 o superior, el daño aumenta en 1d6 por cada nivel...' },
        ],
        buildItem: (f, isEdit, original) => ({
            index: original?.index || ('hb_' + Date.now()),
            name: f.name?.trim() || '',
            level: typeof f.level === 'number' ? f.level : parseInt(f.level) || 0,
            school: f.school ? LM_SCHOOLS.find(s => s.index === f.school) || null : null,
            casting_time: f.casting_time || '',
            range: f.range || '',
            duration: f.duration || '',
            concentration: !!f.concentration,
            ritual: !!f.ritual,
            components: Array.isArray(f.components) ? f.components : [],
            material: f.material || '',
            classes: (f.classes || []).map(idx => LM_CLASSES_SPELL.find(c => c.index === idx)).filter(Boolean),
            desc: f.desc ? f.desc.split('\n\n').filter(p => p.trim()) : [],
            higher_level: f.higher_level ? f.higher_level.split('\n\n').filter(p => p.trim()) : [],
            damage: (f.damage_dice || f.damage_type) ? {
                damage_dice: f.damage_dice || '',
                damage_type: f.damage_type ? LM_DAMAGE_TYPES.find(d => d.index === f.damage_type) || null : null,
            } : undefined,
            source: 'homebrew',
        }),
        // Para edición: convertir item SRD-shape a campos planos del formulario
        parseItem: (item) => ({
            name: item.name || '',
            level: item.level !== undefined ? item.level : 1,
            school: item.school?.index || '',
            casting_time: item.casting_time || '',
            range: item.range || '',
            duration: item.duration || '',
            concentration: !!item.concentration,
            ritual: !!item.ritual,
            components: item.components || [],
            material: item.material || '',
            classes: (item.classes || []).map(c => c.index),
            desc: Array.isArray(item.desc) ? item.desc.join('\n\n') : (item.desc || ''),
            higher_level: Array.isArray(item.higher_level) ? item.higher_level.join('\n\n') : (item.higher_level || ''),
            damage_dice: item.damage?.damage_dice || '',
            damage_type: item.damage?.damage_type?.index || '',
        }),
    },

    // ──── EQUIPO ──────────────────────────────────────────────
    srd_equipment: {
        label: 'Equipo',
        icon: '⚔',
        essential: [
            { key: 'name', type: 'text', label: 'Nombre', required: true,
              placeholder: 'Ej: Espada Larga' },
            { key: 'equipment_category', type: 'select', label: 'Categoría',
              options: LM_EQUIP_CATEGORIES.map(c => ({ value: c.index, label: c.name, _ref: c })) },
            { key: 'desc', type: 'textarea', label: 'Descripción',
              placeholder: 'Describe el equipo, sus usos o particularidades...' },
        ],
        advanced: [
            { key: 'cost_quantity', type: 'number', label: 'Costo (cantidad)', placeholder: 'Ej: 50' },
            { key: 'cost_unit', type: 'select', label: 'Unidad de costo',
              options: [
                  { value: '', label: '— Sin costo —' },
                  { value: 'pc', label: 'pc (cobre)' },
                  { value: 'pp', label: 'pp (plata)' },
                  { value: 'po', label: 'po (oro)' },
                  { value: 'pe', label: 'pe (electrum)' },
                  { value: 'pl', label: 'pl (platino)' },
              ] },
            { key: 'weight', type: 'number', label: 'Peso (libras)', placeholder: 'Ej: 3' },
            { key: 'damage_dice', type: 'text', label: 'Daño (si es arma)', placeholder: 'Ej: 1d8' },
            { key: 'damage_type', type: 'select', label: 'Tipo de daño',
              options: [{ value: '', label: '— Ninguno —' },
                  ...LM_DAMAGE_TYPES.map(d => ({ value: d.index, label: d.name, _ref: d }))] },
            { key: 'properties', type: 'text', label: 'Propiedades (separadas por coma)',
              placeholder: 'Ej: Versátil, Ligera, A dos manos' },
            { key: 'armor_class_base', type: 'number', label: 'CA base (si es armadura)', placeholder: 'Ej: 14' },
        ],
        buildItem: (f, isEdit, original) => ({
            index: original?.index || ('hb_' + Date.now()),
            name: f.name?.trim() || '',
            equipment_category: f.equipment_category
                ? LM_EQUIP_CATEGORIES.find(c => c.index === f.equipment_category) || null : null,
            cost: (f.cost_quantity && f.cost_unit) ? {
                quantity: parseInt(f.cost_quantity) || 0,
                unit: f.cost_unit,
            } : undefined,
            weight: f.weight ? parseFloat(f.weight) : undefined,
            damage: (f.damage_dice || f.damage_type) ? {
                damage_dice: f.damage_dice || '',
                damage_type: f.damage_type ? LM_DAMAGE_TYPES.find(d => d.index === f.damage_type) || null : null,
            } : undefined,
            properties: f.properties ? f.properties.split(',').map(p => ({ name: p.trim() })).filter(p => p.name) : [],
            armor_class: f.armor_class_base ? { base: parseInt(f.armor_class_base) } : undefined,
            desc: f.desc ? [f.desc] : [],
            source: 'homebrew',
        }),
        parseItem: (item) => ({
            name: item.name || '',
            equipment_category: item.equipment_category?.index || '',
            cost_quantity: item.cost?.quantity || '',
            cost_unit: item.cost?.unit || '',
            weight: item.weight !== undefined ? item.weight : '',
            damage_dice: item.damage?.damage_dice || '',
            damage_type: item.damage?.damage_type?.index || '',
            properties: (item.properties || []).map(p => p.name).join(', '),
            armor_class_base: item.armor_class?.base || '',
            desc: Array.isArray(item.desc) ? item.desc.join('\n\n') : (item.desc || ''),
        }),
    },

    // ──── ITEMS MÁGICOS ───────────────────────────────────────
    srd_magic_items: {
        label: 'Item Mágico',
        icon: '◈',
        essential: [
            { key: 'name', type: 'text', label: 'Nombre', required: true,
              placeholder: 'Ej: Espada Flamígera +1' },
            { key: 'equipment_category', type: 'select', label: 'Tipo',
              options: LM_MAGIC_ITEM_CATEGORIES.map(c => ({ value: c.index, label: c.name, _ref: c })) },
            { key: 'rarity', type: 'select', label: 'Rareza',
              options: LM_RARITIES.map(r => ({ value: r.index, label: r.name, _ref: r })) },
            { key: 'desc', type: 'textarea', label: 'Descripción',
              placeholder: 'Describe los poderes, efectos y restricciones del objeto mágico...' },
        ],
        advanced: [
            { key: 'attunement', type: 'checkbox', label: 'Requiere sintonización' },
            { key: 'attunement_note', type: 'text', label: 'Nota de sintonización',
              placeholder: 'Ej: por un druida, por una criatura buena...' },
        ],
        buildItem: (f, isEdit, original) => ({
            index: original?.index || ('hb_' + Date.now()),
            name: f.name?.trim() || '',
            equipment_category: f.equipment_category
                ? LM_MAGIC_ITEM_CATEGORIES.find(c => c.index === f.equipment_category) || null : null,
            rarity: f.rarity ? LM_RARITIES.find(r => r.index === f.rarity) || null : null,
            attunement: !!f.attunement,
            attunement_note: f.attunement_note || '',
            desc: f.desc ? [f.desc] : [],
            source: 'homebrew',
        }),
        parseItem: (item) => ({
            name: item.name || '',
            equipment_category: item.equipment_category?.index || '',
            rarity: item.rarity?.index || '',
            attunement: !!item.attunement,
            attunement_note: item.attunement_note || '',
            desc: Array.isArray(item.desc) ? item.desc.join('\n\n') : (item.desc || ''),
        }),
    },

    // ──── TRASFONDOS ──────────────────────────────────────────
    srd_backgrounds: {
        label: 'Trasfondo',
        icon: '📜',
        essential: [
            { key: 'name', type: 'text', label: 'Nombre', required: true,
              placeholder: 'Ej: Noble de la Frontera' },
            { key: 'ability_scores', type: 'multiselect', label: 'Mejoras de característica (elige 3)',
              options: LM_ABILITY_SCORES.map(a => ({ value: a.index, label: a.name, _ref: a })) },
            { key: 'feat', type: 'select', label: 'Dote inicial',
              dynamicOptions: 'feats',
              placeholder: 'Cargando dotes...' },
            { key: 'proficiencies', type: 'multiselect_grouped', label: 'Competencias',
              dynamicOptions: 'proficiencies' },
            { key: 'desc', type: 'textarea', label: 'Descripción',
              placeholder: 'Describe el trasfondo, su historia, motivaciones típicas...' },
        ],
        advanced: [
            { key: 'equipment_desc', type: 'textarea', label: 'Equipo inicial',
              placeholder: 'Ej: Elige A o B: (A) Suministros de calígrafo, libro de oraciones, 8 PO; o (B) 50 PO' },
        ],
        buildItem: (f, isEdit, original, ctx) => {
            // ctx contiene los options cargados dinámicamente para resolver refs
            const featsOpts = ctx?.dynamicOptions?.feats || [];
            const profsOpts = ctx?.dynamicOptions?.proficiencies || [];
            return {
                index: original?.index || ('hb_' + Date.now()),
                name: f.name?.trim() || '',
                ability_scores: (f.ability_scores || [])
                    .map(idx => LM_ABILITY_SCORES.find(a => a.index === idx))
                    .filter(Boolean),
                feat: f.feat
                    ? (featsOpts.find(d => d.value === f.feat)?._ref ||
                       { index: f.feat, name: f.feat })
                    : null,
                proficiencies: (f.proficiencies || []).map(idx => {
                    const opt = profsOpts.find(p => p.value === idx);
                    return opt?._ref || { index: idx, name: idx };
                }),
                equipment_options: f.equipment_desc
                    ? [{ desc: f.equipment_desc, choose: 1, type: 'equipment' }]
                    : [],
                desc: f.desc ? [f.desc] : [],
                source: 'homebrew',
            };
        },
        parseItem: (item) => ({
            name: item.name || '',
            ability_scores: (item.ability_scores || []).map(a => a.index),
            feat: item.feat?.index || '',
            proficiencies: (item.proficiencies || []).map(p => p.index || p.name),
            equipment_desc: item.equipment_options?.[0]?.desc || '',
            desc: Array.isArray(item.desc) ? item.desc.join('\n\n') : (item.desc || ''),
        }),
    },

    // ──── DOTES ───────────────────────────────────────────────
    srd_feats: {
        label: 'Dote',
        icon: '★',
        essential: [
            { key: 'name', type: 'text', label: 'Nombre', required: true,
              placeholder: 'Ej: Maestro de Hechizos' },
            { key: 'type', type: 'select', label: 'Tipo',
              options: LM_FEAT_TYPES },
            { key: 'description', type: 'textarea', label: 'Descripción',
              placeholder: 'Describe los beneficios y mecánicas de la dote...' },
        ],
        advanced: [
            { key: 'prerequisite_text', type: 'text', label: 'Prerrequisito (texto libre)',
              placeholder: 'Ej: Nivel 4+, INT 13+, capacidad de lanzar conjuros' },
            { key: 'repeatable', type: 'checkbox', label: 'Esta dote se puede tomar múltiples veces' },
        ],
        buildItem: (f, isEdit, original) => ({
            index: original?.index || ('hb_' + Date.now()),
            name: f.name?.trim() || '',
            type: f.type || 'general',
            prerequisites: f.prerequisite_text
                ? [{ type: 'text', description: f.prerequisite_text }]
                : [],
            repeatable: !!f.repeatable,
            description: f.description ? [f.description] : [],
            source: 'homebrew',
        }),
        parseItem: (item) => ({
            name: item.name || '',
            type: item.type || 'general',
            prerequisite_text: item.prerequisites?.[0]?.description
                || (item.prerequisites?.[0] ? JSON.stringify(item.prerequisites[0]) : ''),
            repeatable: !!item.repeatable,
            description: Array.isArray(item.description) ? item.description.join('\n\n') : (item.description || ''),
        }),
    },

    // ──── RASGOS ──────────────────────────────────────────────
    srd_traits: {
        label: 'Rasgo',
        icon: '◉',
        essential: [
            { key: 'name', type: 'text', label: 'Nombre', required: true,
              placeholder: 'Ej: Visión en la oscuridad' },
            { key: 'description', type: 'textarea', label: 'Descripción',
              placeholder: 'Describe el rasgo y sus efectos mecánicos...' },
        ],
        advanced: [],
        buildItem: (f, isEdit, original) => ({
            index: original?.index || ('hb_' + Date.now()),
            name: f.name?.trim() || '',
            description: f.description ? [f.description] : [],
            source: 'homebrew',
        }),
        parseItem: (item) => ({
            name: item.name || '',
            description: Array.isArray(item.description) ? item.description.join('\n\n') : (item.description || ''),
        }),
    },

    // ──── CONDICIONES ─────────────────────────────────────────
    srd_conditions: {
        label: 'Condición',
        icon: '⚠',
        essential: [
            { key: 'name', type: 'text', label: 'Nombre', required: true,
              placeholder: 'Ej: Quemado' },
            { key: 'description', type: 'textarea', label: 'Descripción',
              placeholder: 'Describe los efectos mecánicos de la condición sobre la criatura...' },
        ],
        advanced: [],
        buildItem: (f, isEdit, original) => ({
            index: original?.index || ('hb_' + Date.now()),
            name: f.name?.trim() || '',
            description: f.description ? [f.description] : [],
            source: 'homebrew',
        }),
        parseItem: (item) => ({
            name: item.name || '',
            description: Array.isArray(item.description) ? item.description.join('\n\n') : (item.description || ''),
        }),
    },

    // ──── PROFICIENCIAS ───────────────────────────────────────
    srd_proficiencies: {
        label: 'Proficiencia',
        icon: '◆',
        essential: [
            { key: 'name', type: 'text', label: 'Nombre', required: true,
              placeholder: 'Ej: Herramienta: Bisutero' },
            { key: 'type', type: 'select', label: 'Tipo',
              options: LM_PROF_TYPES },
            { key: 'description', type: 'textarea', label: 'Descripción',
              placeholder: 'Describe la proficiencia, su uso típico...' },
        ],
        advanced: [],
        buildItem: (f, isEdit, original) => ({
            index: original?.index || ('hb_' + Date.now()),
            name: f.name?.trim() || '',
            type: f.type || 'Otros',
            description: f.description ? [f.description] : [],
            source: 'homebrew',
        }),
        parseItem: (item) => ({
            name: item.name || '',
            type: item.type || 'Otros',
            description: Array.isArray(item.description) ? item.description.join('\n\n') : (item.description || ''),
        }),
    },
};

// Lista de IDs ordenada — para mostrar en el dropdown del home
const LM_FORM_CATEGORIES_ORDER = [
    'srd_spells',
    'srd_equipment',
    'srd_magic_items',
    'srd_backgrounds',
    'srd_feats',
    'srd_traits',
    'srd_conditions',
    'srd_proficiencies',
];