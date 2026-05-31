// ============================================================
// LIBRARY MANAGER — La Forja v14.8 Homebrew Forms
// Cargado antes de Babel. Expone: LibraryManager (componente React global)
// Depende de: DB (index.html), Fuse (fuse.js), React (react.js),
//             LM_FORM_CONFIG (lmFormConfig.js), LMItemForm (lmForms.js)
// CSS vive en js/libraryManager.css
// ============================================================

// ── Markdown helper local (fallback si renderMarkdown global no existe) ──
const lmRenderMarkdown = (text) => {
    if (!text) return '';
    if (typeof renderMarkdown === 'function') return renderMarkdown(text);
    return String(text)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
        .replace(/\\n/g, '<br/>')
        .replace(/\n/g, '<br/>');
};

// ── Categorías ────────────────────────────────────────────────
const LM_CATS = [
    { id: 'srd_spells',        icon: '✦',  name: 'Hechizos',      store: 'srd_spells'        },
    { id: 'srd_equipment',     icon: '⚔',  name: 'Equipo',        store: 'srd_equipment'     },
    { id: 'srd_magic_items',   icon: '◈',  name: 'Ítems Mágicos', store: 'srd_magic_items'   },
    { id: 'srd_backgrounds',   icon: '📜', name: 'Trasfondos',    store: 'srd_backgrounds'   },
    { id: 'srd_feats',         icon: '★',  name: 'Dotes',         store: 'srd_feats'         },
    { id: 'srd_traits',        icon: '◉',  name: 'Rasgos',        store: 'srd_traits'        },
    { id: 'srd_conditions',    icon: '⚠',  name: 'Condiciones',   store: 'srd_conditions'    },
    { id: 'srd_proficiencies', icon: '◆',  name: 'Proficiencias', store: 'srd_proficiencies' },
];
const LM_REFS = [
    { id: 'srd_classes',           icon: '🛡', name: 'Clases',              store: 'srd_classes'           },
    { id: 'srd_subclasses',        icon: '⚔', name: 'Subclases',            store: 'srd_subclasses'        },
    { id: 'srd_weapon_mastery',    icon: '◎', name: 'Maestría de Armas',    store: 'srd_weapon_mastery'    },
    { id: 'srd_weapon_properties', icon: '◇', name: 'Propiedades de Armas', store: 'srd_weapon_properties' },
];
const LM_BREW_CATS = LM_CATS.map(c => ({ ...c, id: 'b_' + c.id, store: 'brew_' + c.id }));

const LM_FILTERS = {
    srd_spells: {
        'Escuela':  { key: 'school.name', opts: ['Abjuración','Conjuración','Adivinación','Encantamiento','Evocación','Ilusión','Nigromancia','Transmutación'] },
        'Nivel':    { key: 'level',       opts: ['0 (Truco)','1','2','3','4','5','6','7','8','9'],
                      map: v => v === 0 ? '0 (Truco)' : String(v) },
        'Clase':    { key: 'classes',     opts: ['Bardo','Brujo','Clérigo','Druida','Explorador','Hechicero','Mago','Paladín'],
                      arrayMatch: (item, val) => Array.isArray(item.classes) && item.classes.some(c => c.name === val) },
    },
    srd_equipment:   { 'Tipo':   { key: 'equipment_category.name', opts: ['Armadura','Arma','Herramienta','Munición','Paquete de aventurero'] } },
    srd_magic_items: { 'Rareza': { key: 'rarity.name', opts: ['Común','Infrecuente','Raro','Muy Raro','Legendario'] } },
    srd_feats:       { 'Tipo':   { key: 'type', opts: ['origin','general','fighting-style','epic-boon'] } },
    srd_proficiencies: { 'Tipo': { key: 'type', opts: ['Armas','Armaduras','Herramientas','Herramientas de Artesano','Instrumentos Musicales','Tiradas de Salvación','Habilidades','Otros'] } },
};

// ── Configuración de orden por categoría ─────────────────────
// Define qué botones de orden mostrar en cada categoría
const LM_SORT_CONFIG = {
    srd_spells:        ['name', 'level'],
    srd_magic_items:   ['name', 'rarity'],
    srd_equipment:     ['name'],
    srd_feats:         ['name'],
    srd_traits:        ['name'],
    srd_conditions:    ['name'],
    srd_proficiencies: ['name'],
    srd_backgrounds:   ['name'],
    srd_classes:       ['name'],
    srd_subclasses:    ['name'],
    srd_weapon_mastery:    ['name'],
    srd_weapon_properties: ['name'],
};
// Orden de rareza para magic items
const LM_RARITY_ORDER = {
    'Común': 0, 'Infrecuente': 1, 'Raro': 2, 'Muy Raro': 3, 'Legendario': 4,
    // English fallback por si algún item no fue traducido
    'Common': 0, 'Uncommon': 1, 'Rare': 2, 'Very Rare': 3, 'Legendary': 4,
    'Artifact': 5,
};

// ── Helpers ───────────────────────────────────────────────────
function lmGetNestedVal(obj, path) {
    return path.split('.').reduce((o, k) => o && o[k] !== undefined ? o[k] : undefined, obj);
}

function lmItemSubtitle(item, catId) {
    const base = (catId || '').replace('b_','').replace('srd_','');
    if (base === 'spells') {
        const lvl = item.level === 0 ? 'Truco' : `Niv ${item.level}`;
        const conc = item.concentration ? 'Concentración' : '';
        const rit = item.ritual ? 'Ritual' : '';
        return [item.school?.name, lvl, conc, rit, item.damage?.damage_dice || ''].filter(Boolean).join(' · ');
    }
    if (base === 'equipment') {
        const parts = [item.equipment_category?.name];
        if (item.cost) parts.push(`${item.cost.quantity} ${item.cost.unit}`);
        if (item.damage?.damage_dice) parts.push(`${item.damage.damage_dice} ${item.damage.damage_type?.name || ''}`);
        if (item.armor_class?.base) parts.push(`CA ${item.armor_class.base}`);
        return parts.filter(Boolean).join(' · ');
    }
    if (base === 'magic_items') {
        const parts = [item.rarity?.name, item.equipment_category?.name];
        if (item.attunement) parts.push('Sintonización');
        return parts.filter(Boolean).join(' · ');
    }
    if (base === 'feats') {
        const parts = [item.type];
        if (item.prerequisites?.length) parts.push('Con prerreq.');
        return parts.filter(Boolean).join(' · ');
    }
    if (base === 'traits') {
        const species = item.species?.map(r=>r.name).join(', ') || '';
        return species || 'Rasgo';
    }
    if (base === 'conditions') return 'Condición';
    if (base === 'proficiencies') {
        const parts = [item.type];
        if (item.classes?.length) parts.push(`${item.classes.length} clase${item.classes.length>1?'s':''}`);
        return parts.filter(Boolean).join(' · ');
    }
    if (base === 'backgrounds') {
        const stats = item.ability_scores?.map(a => a.name).join('/') || '';
        const feat = item.feat?.name || '';
        return [stats && `Stats: ${stats}`, feat && `Dote: ${feat}`].filter(Boolean).join(' · ');
    }
    if (base === 'classes')      return `Dado de golpe: d${item.hit_die || '?'}`;
    if (base === 'subclasses') {
        const cls = item.class?.name || '';
        const summary = item.summary || '';
        return [cls, summary].filter(Boolean).join(' · ');
    }
    if (base === 'weapon_mastery' || base === 'weapon_properties')
        return item.desc ? (item.desc[0] || '').substring(0,60)+'...' : '';
    return item.type || item.school?.name || '';
}

function lmItemStats(item, catId) {
    const base = (catId || '').replace('b_','').replace('srd_','');
    if (base === 'spells') {
        const stats = [];
        if (item.damage?.damage_dice) stats.push({ v: item.damage.damage_dice, l: 'Daño' });
        if (item.range) stats.push({ v: item.range, l: 'Alcance' });
        stats.push({ v: item.level === 0 ? 'T' : String(item.level), l: 'Nivel' });
        return stats;
    }
    if (base === 'equipment') {
        const stats = [];
        if (item.damage?.damage_dice) stats.push({ v: item.damage.damage_dice, l: 'Daño' });
        if (item.armor_class?.base) stats.push({ v: String(item.armor_class.base)+'+', l: 'CA' });
        if (item.cost) stats.push({ v: `${item.cost.quantity}${item.cost.unit}`, l: 'Costo' });
        if (item.weight) stats.push({ v: String(item.weight), l: 'Peso' });
        return stats.slice(0,3);
    }
    if (base === 'magic_items') return [{ v: item.rarity?.name || '?', l: 'Rareza' }];
    if (base === 'classes') return [
        { v: `d${item.hit_die||'?'}`, l: 'Dado' },
        { v: item.saving_throws?.map(s=>s.name).join('/') || '?', l: 'Salvaciones' }
    ];
    return [];
}

function lmItemDesc(item) {
    const raw = item.desc || item.description || '';
    return Array.isArray(raw) ? raw.join('\n\n') : raw;
}

async function lmGetBrew(catKey) {
    try { return (await DB.getSetting('lm_brew_' + catKey)) || []; } catch(e) { return []; }
}
async function lmSaveBrew(catKey, items) {
    await DB.setSetting('lm_brew_' + catKey, items);
}

function lmBuildFuse(items) {
    if (typeof Fuse === 'undefined') return null;
    return new Fuse(items, { keys: ['name','index','desc'], threshold: 0.35, includeScore: true, minMatchCharLength: 2 });
}

// ============================================================
// SUBCOMPONENTES (fuera del padre — hooks estables)
// ============================================================

// LMItemForm vive ahora en js/lmForms.js (cargado antes que este archivo)

const LMFilterPanel = ({ catId, activeFilters, onApply, onClose }) => {
    const { useState } = React;
    const fd = LM_FILTERS[catId] || {};
    const hasFilt = Object.keys(fd).length > 0;
    const [local, setLocal] = useState({ ...activeFilters });
    const e = React.createElement;

    return e('div', {
        className: 'lm-filtoverlay',
        onClick: ev => { if (ev.target === ev.currentTarget) onClose(); }
    },
        e('div', { className: 'lm-filtpanel' },
            e('div', { className: 'lm-fhandle' }),
            !hasFilt && e('div', { style: { textAlign:'center', opacity:.5, fontSize:13, padding:'12px 0' } },
                'Sin filtros para esta categoría.'),
            hasFilt && Object.entries(fd).map(([sec, def]) =>
                e('div', { key: sec, className: 'lm-fsec' },
                    e('div', { className: 'lm-fsectitle' }, sec),
                    e('div', { className: 'lm-fopts' },
                        def.opts.map(opt =>
                            e('span', {
                                key: opt,
                                className: `lm-fopt${(local[sec]||[]).includes(opt) ? ' on' : ''}`,
                                onClick: () => {
                                    const cur = local[sec] || [];
                                    const next = cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur, opt];
                                    setLocal({ ...local, [sec]: next });
                                }
                            }, opt)
                        )
                    )
                )
            ),
            e('div', { className: 'lm-factns' },
                e('button', { className: 'lm-fclear', onClick: () => { setLocal({}); onApply({}); } }, 'Limpiar'),
                e('button', { className: 'lm-fapply', onClick: () => onApply(local) }, 'Aplicar filtros')
            )
        )
    );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const LibraryManager = ({ onClose, darkMode }) => {
    const { useState, useEffect, useRef } = React;
    const e = React.createElement;
    const dm = darkMode ? 'lm-dark' : 'lm-light';

    const [tab, setTab]                     = useState('comp');
    const [catId, setCatId]                 = useState(null);
    const [detailItem, setDetailItem]       = useState(null);
    const [items, setItems]                 = useState([]);
    const [loading, setLoading]             = useState(false);
    const [searchQ, setSearchQ]             = useState('');
    const [activeFilters, setActiveFilters] = useState({});
    const [showFilter, setShowFilter]       = useState(false);
    const [refsOpen, setRefsOpen]           = useState(false);
    const [chips, setChips]                 = useState([]);
    const [catCounts, setCatCounts]         = useState({});
    const [toastMsg, setToastMsg]           = useState('');
    const [showForm, setShowForm]           = useState(false);
    const [editItem, setEditItem]           = useState(null);
    const [stack, setStack]                 = useState([]);
    const [sortBy, setSortBy]               = useState(null);
    const [sortDir, setSortDir]             = useState('asc');

    const toastTimer = useRef(null);
    const fuseRef    = useRef(null);

    function toast(msg) {
        setToastMsg(msg);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToastMsg(''), 2200);
    }

    useEffect(() => {
        async function loadCounts() {
            const counts = {};
            for (const cat of [...LM_CATS, ...LM_REFS]) {
                try { counts[cat.id] = (await DB.getSRD(cat.store))?.length || 0; }
                catch(err) { counts[cat.id] = 0; }
            }
            for (const cat of LM_BREW_CATS) {
                try { counts[cat.id] = (await lmGetBrew(cat.id))?.length || 0; }
                catch(err) { counts[cat.id] = 0; }
            }
            setCatCounts(counts);
        }
        loadCounts();
    }, []);

    useEffect(() => { if (catId) loadItems(catId, searchQ, activeFilters); }, [catId]);
    useEffect(() => { if (catId) loadItems(catId, searchQ, activeFilters); }, [sortBy, sortDir]);
    useEffect(() => { setSortBy(null); setSortDir('asc'); }, [catId]);

    async function loadItems(id, q, filters) {
        setLoading(true);
        try {
            let data = [];
            if (id.startsWith('b_')) {
                data = await lmGetBrew(id);
            } else {
                const cat = [...LM_CATS, ...LM_REFS].find(c => c.id === id);
                if (cat) data = await DB.getSRD(cat.store) || [];
            }
            fuseRef.current = lmBuildFuse(data);
            setItems(applySearchFilters(data, q, filters, id));
        } catch(err) {
            console.error('[LM] Error loading', id, err);
            setItems([]);
        }
        setLoading(false);
    }

    function applySearchFilters(data, q, filters, id) {
        let result = data;
        if (q && q.trim().length >= 2 && fuseRef.current) {
            result = fuseRef.current.search(q.trim()).map(r => r.item);
        } else if (q && q.trim().length >= 1) {
            const ql = q.toLowerCase();
            result = result.filter(i =>
                (i.name||'').toLowerCase().includes(ql) ||
                (i.index||'').toLowerCase().includes(ql)
            );
        }
        const fd = LM_FILTERS[id] || {};
        Object.entries(filters).forEach(([sec, vals]) => {
            if (!vals || !vals.length) return;
            const def = fd[sec]; if (!def) return;
            result = result.filter(item => {
                if (def.arrayMatch) return vals.some(v => def.arrayMatch(item, v));
                const raw = lmGetNestedVal(item, def.key);
                const mapped = def.map ? def.map(raw) : String(raw);
                return vals.includes(mapped);
            });
        });
        if (sortBy) {
            const dir = sortDir === 'asc' ? 1 : -1;
            result = [...result].sort((a, b) => {
                if (sortBy === 'name') {
                    return (a.name||'').toLowerCase().localeCompare((b.name||'').toLowerCase()) * dir;
                }
                if (sortBy === 'level') {
                    const av = a.level !== undefined ? a.level : 99;
                    const bv = b.level !== undefined ? b.level : 99;
                    return (av - bv) * dir;
                }
                if (sortBy === 'rarity') {
                    const av = LM_RARITY_ORDER[a.rarity?.name] ?? 99;
                    const bv = LM_RARITY_ORDER[b.rarity?.name] ?? 99;
                    return (av - bv) * dir;
                }
                return 0;
            });
        }
        return result;
    }

    function handleSort(field) {
        if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else { setSortBy(field); setSortDir('asc'); }
    }

    function handleSearch(q) {
        setSearchQ(q);
        if (catId) loadItems(catId, q, activeFilters);
        else if (q.length >= 2) doGlobalSearch(q);
        else if (q.length === 0) setItems([]);
    }

    async function doGlobalSearch(q) {
        setLoading(true);
        const all = [];
        const srcs = tab === 'comp' ? [...LM_CATS, ...LM_REFS] : LM_BREW_CATS;
        for (const cat of srcs) {
            try {
                const data = cat.id.startsWith('b_')
                    ? await lmGetBrew(cat.id)
                    : (await DB.getSRD(cat.store) || []);
                const ql = q.toLowerCase();
                data.filter(i =>
                    (i.name||'').toLowerCase().includes(ql) ||
                    (i.index||'').toLowerCase().includes(ql)
                ).forEach(m => all.push({ ...m, _catId: cat.id, _catName: cat.name }));
            } catch(err) {}
        }
        setItems(all.slice(0, 60));
        setLoading(false);
    }

    function getTitle() {
        if (showForm) return editItem ? 'Editar' : 'Crear';
        if (detailItem) return detailItem.name || 'Detalle';
        if (catId) {
            const all = [...LM_CATS, ...LM_REFS, ...LM_BREW_CATS];
            return all.find(c => c.id === catId)?.name || catId;
        }
        return '⚒ BIBLIOTECA';
    }

    function openCat(id) {
        setStack(s => [...s, { catId, detailItem, title: getTitle() }]);
        setCatId(id); setDetailItem(null); setSearchQ('');
        setActiveFilters({}); setChips([]); setShowFilter(false); setShowForm(false);
    }

    function openDetail(item) {
        setStack(s => [...s, { catId, detailItem, title: getTitle() }]);
        setDetailItem(item); setShowForm(false);
    }

    function goBack() {
        if (showForm) { setShowForm(false); setEditItem(null); return; }
        if (stack.length === 0) { onClose(); return; }
        const prev = stack[stack.length - 1];
        setStack(s => s.slice(0,-1));
        setCatId(prev.catId); setDetailItem(prev.detailItem);
        setSearchQ(''); setActiveFilters({}); setChips([]); setShowFilter(false);
    }

    function switchTab(t) {
        if (t === tab) return;
        setTab(t); setCatId(null); setDetailItem(null);
        setSearchQ(''); setActiveFilters({}); setChips([]);
        setStack([]); setShowFilter(false); setShowForm(false);
    }

    function handleApplyFilters(newFilters) {
        setActiveFilters(newFilters); setShowFilter(false);
        if (catId) loadItems(catId, searchQ, newFilters);
        const c = [];
        Object.entries(newFilters).forEach(([sec, vals]) =>
            vals.forEach(v => c.push({ label: `${sec}: ${v}`, sec })));
        setChips(c);
    }

    function removeChip(sec) {
        const nf = { ...activeFilters }; delete nf[sec];
        handleApplyFilters(nf);
    }

    async function handleSaveItem(formData, finalCatId) {
        // finalCatId viene del form (b_srd_spells, etc.) — si no, usar catId actual
        const id = finalCatId || catId || ('b_srd_' + tab);
        const brewItems = await lmGetBrew(id);
        if (editItem) {
            const idx = brewItems.findIndex(x => x.id === editItem.id || x.index === editItem.index);
            if (idx >= 0) brewItems[idx] = { ...editItem, ...formData };
        } else {
            // Asegurar id único interno además del index
            const newItem = { ...formData, id: formData.index || Date.now().toString() };
            brewItems.push(newItem);
        }
        await lmSaveBrew(id, brewItems);
        setCatCounts(prev => ({ ...prev, [id]: brewItems.length }));

        // Si guardó en una categoría distinta a la actual, navegar a ella
        if (finalCatId && finalCatId !== catId) {
            setCatId(finalCatId);
        } else if (catId) {
            await loadItems(catId, searchQ, activeFilters);
        }

        setShowForm(false); setEditItem(null);
        toast(editItem ? '✅ Item actualizado' : '✅ Item creado');
    }

    async function handleDeleteItem(item) {
        if (!confirm(`¿Eliminar "${item.name}"?`)) return;
        const id = catId;
        const brewItems = await lmGetBrew(id);
        const filtered = brewItems.filter(x => x.id !== item.id);
        await lmSaveBrew(id, filtered);
        setCatCounts(prev => ({ ...prev, [id]: filtered.length }));
        await loadItems(id, searchQ, activeFilters);
        goBack();
        toast('🗑 Item eliminado');
    }

    function renderCatGrid(cats, isRef) {
        return cats.map(cat => {
            const cnt = catCounts[cat.id];
            return e('div', {
                key: cat.id, className: 'lm-catcard',
                onClick: () => openCat(cat.id),
                style: isRef ? { opacity: .8 } : {}
            },
                e('div', { className: 'lm-cicon' }, cat.icon),
                e('div', { className: 'lm-cname' }, cat.name),
                e('div', { className: 'lm-ccnt' },
                    cnt === undefined ? '...' : cnt === 0 ? 'Vacío' : `${cnt} items`
                )
            );
        });
    }

    function renderItem(item) {
        const id = catId || item._catId || '';
        const isBrew = item.source === 'homebrew' || id.startsWith('b_');
        const subtitle = lmItemSubtitle(item, id);
        return e('div', {
            key: item.index || item.id || item.name,
            className: 'lm-icard', onClick: () => openDetail(item)
        },
            e('span', { className: `lm-badge ${isBrew ? 'lm-badge-brew' : 'lm-badge-srd'}` },
                isBrew ? 'BREW' : 'SRD'),
            e('div', { style: { flex: 1, minWidth: 0 } },
                e('div', { className: 'lm-iname' }, item.name),
                subtitle && e('div', { className: 'lm-isub' }, subtitle)
            ),
            e('span', { className: 'lm-iarrow' }, '›')
        );
    }

    function renderDetail() {
        const item = detailItem;
        const id = catId || '';
        const isBrew = item.source === 'homebrew' || id.startsWith('b_');
        const desc = lmItemDesc(item);
        const cleanId = id.replace(/^b_/, '').replace(/^srd_/, '');

        // Helpers para secciones
        const section = (label, content, marginTop = 14) => content
            ? e('div', { style: { marginTop } },
                e('div', { className: 'lm-dlabel' }, label),
                typeof content === 'string'
                    ? e('div', { className: 'lm-ddesc' }, content)
                    : content
            ) : null;

        const badge = (text, color) => e('span', {
            style: {
                display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                fontSize: 10, fontWeight: 700, marginRight: 5,
                background: color || 'rgba(120,113,108,.2)', color: 'inherit'
            }
        }, text);

        // ── HECHIZOS ──────────────────────────────────────────
        const renderSpellDetails = () => {
            if (cleanId !== 'spells') return null;
            const dmg = item.damage;
            const dmgBySlot = dmg?.damage_at_slot_level;
            const dmgByLevel = dmg?.damage_at_character_level;

            return e('div', null,
                (item.concentration || item.ritual) && e('div', { style: { marginBottom: 10, marginTop: 6 } },
                    item.concentration && badge('CONCENTRACIÓN', 'rgba(217,119,6,.15)'),
                    item.ritual && badge('RITUAL', 'rgba(124,58,237,.15)')
                ),

                e('div', { className: 'lm-statrow', style: { flexWrap: 'wrap' } },
                    e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval' }, item.level === 0 ? 'Truco' : item.level),
                        e('div', { className: 'lm-slbl' }, 'Nivel')
                    ),
                    e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval' }, item.school?.name || '?'),
                        e('div', { className: 'lm-slbl' }, 'Escuela')
                    ),
                    item.casting_time && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval', style: { fontSize: 12 } }, item.casting_time),
                        e('div', { className: 'lm-slbl' }, 'Lanzamiento')
                    ),
                    item.range && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval', style: { fontSize: 12 } }, item.range),
                        e('div', { className: 'lm-slbl' }, 'Alcance')
                    ),
                    item.duration && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval', style: { fontSize: 11 } }, item.duration),
                        e('div', { className: 'lm-slbl' }, 'Duración')
                    ),
                    item.components?.length > 0 && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval' }, item.components.join(', ')),
                        e('div', { className: 'lm-slbl' }, 'Componentes')
                    )
                ),

                item.material && section('Componente material', item.material, 4),

                item.classes?.length > 0 && section('Clases',
                    item.classes.map(c => c.name).join(' · '), 10),

                item.subclasses?.length > 0 && section('Subclases',
                    item.subclasses.map(s => s.name).join(' · '), 10),

                dmg?.damage_type && section(`Tipo de daño: ${dmg.damage_type.name}`,
                    dmgBySlot ? e('div', { className: 'lm-ddesc' },
                        Object.entries(dmgBySlot).map(([slot, dice]) =>
                            `Nivel ${slot}: ${dice}`).join(' · ')
                    ) : dmgByLevel ? e('div', { className: 'lm-ddesc' },
                        Object.entries(dmgByLevel).map(([lvl, dice]) =>
                            `Nivel ${lvl}: ${dice}`).join(' · ')
                    ) : '', 10),

                item.dc && section('Tirada de salvación',
                    `${item.dc.dc_type?.name || '?'} — ${item.dc.dc_success || 'ninguno'} si tiene éxito`, 10),

                item.area_of_effect && section('Área de efecto',
                    `${item.area_of_effect.type}: ${item.area_of_effect.size} pies`, 10)
            );
        };

        // ── EQUIPO ────────────────────────────────────────────
        const renderEquipmentDetails = () => {
            if (cleanId !== 'equipment') return null;

            return e('div', null,
                e('div', { className: 'lm-statrow', style: { flexWrap: 'wrap' } },
                    item.cost && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval' }, `${item.cost.quantity} ${item.cost.unit}`),
                        e('div', { className: 'lm-slbl' }, 'Costo')
                    ),
                    item.weight !== undefined && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval' }, item.weight),
                        e('div', { className: 'lm-slbl' }, 'Peso')
                    ),
                    item.damage?.damage_dice && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval' }, item.damage.damage_dice),
                        e('div', { className: 'lm-slbl' }, 'Daño')
                    ),
                    item.armor_class?.base && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval' },
                            item.armor_class.base + (item.armor_class.dex_bonus ? '+DES' : '')),
                        e('div', { className: 'lm-slbl' }, 'CA')
                    )
                ),

                item.damage?.damage_type && section('Tipo de daño',
                    item.damage.damage_type.name, 10),

                item.range && (item.range.normal || item.range.long) && section('Alcance',
                    `Normal: ${item.range.normal || '—'} pies · Largo: ${item.range.long || '—'} pies`, 10),

                item.properties?.length > 0 && section('Propiedades',
                    item.properties.map(p => p.name).join(' · '), 10),

                item.mastery?.length > 0 && section('Maestría de arma',
                    item.mastery.map(m => m.name).join(' · '), 10),

                item.str_minimum && section('Fuerza mínima', String(item.str_minimum), 10),

                item.stealth_disadvantage && section('Sigilo',
                    'Desventaja en pruebas de Sigilo', 10),

                item.equipment_category && section('Categoría',
                    item.equipment_category.name, 10)
            );
        };

        // ── ITEMS MÁGICOS ─────────────────────────────────────
        const renderMagicItemDetails = () => {
            if (cleanId !== 'magic_items') return null;

            return e('div', null,
                e('div', { className: 'lm-statrow', style: { flexWrap: 'wrap' } },
                    item.rarity?.name && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval', style: { fontSize: 13 } }, item.rarity.name),
                        e('div', { className: 'lm-slbl' }, 'Rareza')
                    ),
                    item.equipment_category?.name && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval', style: { fontSize: 13 } }, item.equipment_category.name),
                        e('div', { className: 'lm-slbl' }, 'Categoría')
                    ),
                    item.attunement && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval', style: { fontSize: 11 } }, 'Sí'),
                        e('div', { className: 'lm-slbl' }, 'Sintonización')
                    )
                ),

                item.variant && section('Variante', 'Este objeto es una variante', 10),

                item.variants?.length > 0 && section('Variantes',
                    item.variants.map(v => v.name).join(' · '), 10)
            );
        };

        // ── DOTES ─────────────────────────────────────────────
        const renderFeatDetails = () => {
            if (cleanId !== 'feats') return null;

            return e('div', null,
                item.type && section('Tipo', item.type, 6),
                item.prerequisites?.length > 0 && section('Prerrequisitos',
                    item.prerequisites.map(p =>
                        p.type === 'level' ? `Nivel ${p.level}`
                        : p.type === 'ability_score' ? `${p.ability_score?.name || '?'} ${p.minimum_score || ''}`
                        : p.type === 'feat' ? `Dote: ${p.feat?.name || '?'}`
                        : p.type || '?'
                    ).join(' · '), 10),
                item.repeatable && section('Repetible',
                    'Esta dote se puede tomar múltiples veces', 10)
            );
        };

        // ── RASGOS ────────────────────────────────────────────
        const renderTraitDetails = () => {
            if (cleanId !== 'traits') return null;

            return e('div', null,
                item.species?.length > 0 && section('Especies que lo tienen',
                    item.species.map(s => s.name).join(' · '), 6),
                item.subspecies?.length > 0 && section('Subespecies',
                    item.subspecies.map(s => s.name).join(' · '), 10),
                item.spells?.length > 0 && section('Hechizos otorgados',
                    item.spells.map(s => s.name || s.spell?.name || '?').join(' · '), 10)
            );
        };

        // ── PROFICIENCIAS ─────────────────────────────────────
        const renderProfDetails = () => {
            if (cleanId !== 'proficiencies') return null;

            return e('div', null,
                item.type && section('Tipo', item.type, 6),
                item.reference?.name && section('Referencia', item.reference.name, 10),
                item.classes?.length > 0 && section('Clases que la otorgan',
                    item.classes.map(c => c.name).join(' · '), 10),
                item.backgrounds?.length > 0 && section('Trasfondos que la otorgan',
                    item.backgrounds.map(b => b.name).join(' · '), 10)
            );
        };

        // ── CLASES ────────────────────────────────────────────
        const renderClassDetails = () => {
            if (cleanId !== 'classes') return null;

            return e('div', null,
                e('div', { className: 'lm-statrow', style: { flexWrap: 'wrap' } },
                    item.hit_die && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval' }, `d${item.hit_die}`),
                        e('div', { className: 'lm-slbl' }, 'Dado de golpe')
                    ),
                    item.primary_ability?.length > 0 && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval', style: { fontSize: 12 } },
                            item.primary_ability.map(a => a.name).join('/')),
                        e('div', { className: 'lm-slbl' }, 'Habilidad principal')
                    ),
                    item.saving_throws?.length > 0 && e('div', { className: 'lm-sbox' },
                        e('div', { className: 'lm-sval', style: { fontSize: 12 } },
                            item.saving_throws.map(s => s.name).join('/')),
                        e('div', { className: 'lm-slbl' }, 'Salvaciones')
                    )
                ),

                item.proficiencies?.length > 0 && section('Competencias automáticas',
                    item.proficiencies.map(p => p.name).join(' · '), 10),

                item.proficiency_choices?.length > 0 && section('Competencias a elegir',
                    e('div', null,
                        item.proficiency_choices.map((pc, idx) => e('div', {
                            key: idx, className: 'lm-ddesc', style: { marginBottom: 6 }
                        }, `Elige ${pc.choose}: ${pc.desc || ''}`))
                    ), 10),

                item.starting_equipment_options?.length > 0 && section('Equipamiento inicial',
                    e('div', null,
                        item.starting_equipment_options.map((opt, idx) => e('div', {
                            key: idx, className: 'lm-ddesc', style: { marginBottom: 4 }
                        }, `Opción ${idx+1}: elige ${opt.choose} de su categoría`))
                    ), 10),

                item.multi_classing?.prerequisites && section('Multiclase — Prerrequisitos',
                    item.multi_classing.prerequisites.map(p =>
                        `${p.ability_score?.name || '?'} ${p.minimum_score}`
                    ).join(' · '), 10),

                item.subclasses?.length > 0 && section('Subclases disponibles',
                    item.subclasses.map(s => s.name).join(' · '), 10)
            );
        };

        // ── SUBCLASES ─────────────────────────────────────────
        const renderSubclassDetails = () => {
            if (cleanId !== 'subclasses') return null;
            const features = item.features || [];

            return e('div', null,
                item.summary && e('div', {
                    style: { marginBottom: 12, fontStyle: 'italic', opacity: .85 }
                }, item.summary),

                features.length > 0 && section('Rasgos por nivel',
                    e('div', null,
                        features.map((f, idx) => e('div', {
                            key: idx, style: { marginBottom: 10, paddingBottom: 8 }
                        },
                            e('div', { style: { fontWeight: 700, fontSize: 13, marginBottom: 3 } },
                                `Nivel ${f.level} — ${f.name}`),
                            e('div', { className: 'lm-ddesc',
                                dangerouslySetInnerHTML: { __html: lmRenderMarkdown(f.description || '') } })
                        ))
                    ), 10)
            );
        };

        // ── TRASFONDOS ────────────────────────────────────────
        const renderBgDetails = () => {
            if (cleanId !== 'backgrounds') return null;

            return e('div', null,
                item.ability_scores?.length > 0 && section('Mejoras de característica',
                    item.ability_scores.map(a => a.name).join(' · ') + ' (asigna +2/+1 o +1/+1/+1)', 6),
                item.feat && section('Dote inicial',
                    item.feat.name + (item.feat.note ? ` (${item.feat.note})` : ''), 10),
                item.proficiencies?.length > 0 && section('Competencias',
                    item.proficiencies.map(p => p.name).join(' · '), 10),
                item.equipment_options?.length > 0 && section('Equipo inicial',
                    e('div', null,
                        item.equipment_options.map((opt, idx) => e('div', {
                            key: idx, className: 'lm-ddesc', style: { marginBottom: 4 }
                        }, opt.desc || `Opción ${idx+1}`))
                    ), 10)
            );
        };

        return e('div', { className: 'lm-detail' },
            e('div', { style: { marginBottom: 12 } },
                e('span', { className: `lm-dsrc ${isBrew ? 'lm-badge-brew' : 'lm-badge-srd'}` },
                    isBrew ? 'HOMEBREW' : 'SRD'),
                e('div', { className: 'lm-dname' }, item.name),
                e('div', { className: 'lm-dtype' },
                    item.type || item.school?.name || item.equipment_category?.name ||
                    (cleanId === 'subclasses' && item.class?.name ? `Subclase de ${item.class.name}` : '') ||
                    (cleanId === 'conditions' ? 'Condición' : '') || '')
            ),
            e('hr', { className: 'lm-hr' }),

            renderSpellDetails(),
            renderEquipmentDetails(),
            renderMagicItemDetails(),
            renderFeatDetails(),
            renderTraitDetails(),
            renderProfDetails(),
            renderClassDetails(),
            renderSubclassDetails(),
            renderBgDetails(),

            desc && e('div', { style: { marginTop: 14 } },
                e('div', { className: 'lm-dlabel' }, 'Descripción'),
                e('div', { className: 'lm-ddesc',
                    dangerouslySetInnerHTML: { __html: lmRenderMarkdown(desc) } })
            ),

            cleanId === 'spells' && item.higher_level?.length > 0 && e('div', { style: { marginTop: 12 } },
                e('div', { className: 'lm-dlabel' }, 'A niveles superiores'),
                e('div', { className: 'lm-ddesc',
                    dangerouslySetInnerHTML: { __html: lmRenderMarkdown(item.higher_level.join('\n\n')) } })
            ),

            isBrew && e('div', { className: 'lm-brewrow' },
                e('button', { className: 'lm-editbtn',
                    onClick: () => { setEditItem(item); setShowForm(true); } }, '✏ Editar'),
                e('button', { className: 'lm-delbtn',
                    onClick: () => handleDeleteItem(item) }, '🗑 Eliminar')
            )
        );
    }

    const showBack = stack.length > 0 || showForm || detailItem || catId;
    const hasActiveFilters = Object.keys(activeFilters).length > 0;
    const isBrew = catId && catId.startsWith('b_');
    const title = getTitle();

    return e('div', { className: `lm-wrap ${dm}` },
        e('div', { className: 'lm-hdr' },
            e('div', { className: 'lm-hdr-row' },
                e('button', { className: 'lm-back', onClick: goBack }, showBack ? '←' : '✕'),
                e('span', { className: 'lm-title' }, title),
                (catId || !detailItem) && e('button', {
                    className: `lm-fbtn${hasActiveFilters ? ' on' : ''}`,
                    onClick: () => setShowFilter(!showFilter)
                }, '⚙')
            ),
            !detailItem && !showForm && e('div', { className: 'lm-srow' },
                e('input', {
                    className: 'lm-sinput',
                    placeholder: catId ? `Buscar en ${title.toLowerCase()}...`
                        : tab === 'comp' ? 'Buscar en el compendio...' : 'Buscar en homebrew...',
                    value: searchQ,
                    onChange: ev => handleSearch(ev.target.value)
                })
            ),
            !catId && !detailItem && !showForm && e('div', { className: 'lm-tabs' },
                e('div', { className: `lm-tab${tab === 'comp' ? ' on' : ''}`,
                    onClick: () => switchTab('comp') }, 'Compendio'),
                e('div', { className: `lm-tab${tab === 'brew' ? ' on' : ''}`,
                    onClick: () => switchTab('brew') }, 'Homebrew')
            )
        ),

        chips.length > 0 && e('div', { className: 'lm-chips' },
            chips.map(c => e('div', {
                key: c.sec, className: 'lm-chip', onClick: () => removeChip(c.sec)
            }, c.label, e('span', { style: { opacity: .6 } }, ' ✕')))
        ),

        catId && !detailItem && !showForm && (() => {
            const cleanId = catId.replace(/^b_/, '');
            const sortOpts = LM_SORT_CONFIG[cleanId] || ['name'];
            const labels = { name: 'Nombre', level: 'Nivel', rarity: 'Rareza' };
            return e('div', { className: 'lm-sortrow' },
                e('span', { className: 'lm-sortlbl' }, 'Ordenar:'),
                ...sortOpts.map(opt => e('button', {
                    key: opt,
                    className: `lm-sortbtn${sortBy === opt ? ' on' : ''}`,
                    onClick: () => handleSort(opt)
                },
                    labels[opt],
                    sortBy === opt && e('span', null, sortDir === 'asc' ? ' ↑' : ' ↓')
                ))
            );
        })(),

        e('div', { className: 'lm-content' },
            showForm && e(LMItemForm, {
                catId: catId,                  // null si viene del home (dropdown), set si viene de categoría
                editItem: editItem,
                onSave: handleSaveItem,
                onCancel: () => { setShowForm(false); setEditItem(null); },
                onToast: toast
            }),
            !showForm && detailItem && renderDetail(),
            !showForm && !detailItem && catId && e('div', null,
                loading
                    ? e('div', { className: 'lm-loading' },
                          e('div', { className: 'lm-spinner' }),
                          e('span', { style: { fontSize: 13, opacity: .6 } }, 'Cargando...')
                      )
                    : items.length === 0
                        ? e('div', { className: 'lm-no-results' },
                              searchQ ? `Sin resultados para "${searchQ}"` : 'Esta categoría está vacía.',
                              e('br', null),
                              e('span', { style: { fontSize: 11 } },
                                  searchQ ? 'Prueba otros términos.'
                                      : isBrew ? 'Crea el primer item.' : 'Carga el SRD primero.'
                              )
                          )
                        : e('div', { className: 'lm-itemlist' }, items.map(renderItem)),
                isBrew && !loading && e('div', { className: 'lm-brewfooter' },
                    e('button', { className: 'lm-brewbtn',
                        onClick: () => { setEditItem(null); setShowForm(true); }
                    }, '+ Crear nuevo item')
                )
            ),
            !showForm && !detailItem && !catId && e('div', null,
                searchQ.length >= 2 && e('div', { className: 'lm-itemlist' },
                    loading ? e('div', { className: 'lm-loading' }, e('div', { className: 'lm-spinner' }))
                        : items.length === 0
                            ? e('div', { className: 'lm-no-results' }, `Sin resultados para "${searchQ}"`)
                            : items.map(renderItem)
                ),
                searchQ.length < 2 && e('div', null,
                    e('div', { className: 'lm-catgrid' },
                        renderCatGrid(tab === 'comp' ? LM_CATS : LM_BREW_CATS, false)
                    ),
                    tab === 'comp' && e('div', null,
                        e('div', { className: 'lm-reftoggle', onClick: () => setRefsOpen(!refsOpen) },
                            e('span', { className: 'lm-reftitle' }, 'Referencias'),
                            e('span', null, refsOpen ? '▲' : '▼')
                        ),
                        refsOpen && e('div', { className: 'lm-refgrid' },
                            LM_REFS.map(ref => e('div', {
                                key: ref.id, className: 'lm-refcard',
                                onClick: () => openCat(ref.id)
                            },
                                e('div', { className: 'lm-refname' }, ref.name),
                                e('div', { className: 'lm-refcnt' },
                                    `${catCounts[ref.id] || 0} · Solo lectura`
                                )
                            ))
                        )
                    ),
                    tab === 'brew' && e('div', { style: { padding: '0 12px 14px' } },
                        e('button', { className: 'lm-brewbtn',
                            onClick: () => { setEditItem(null); setShowForm(true); }
                        }, '+ Crear contenido homebrew')
                    ),
                    e('div', { style: { height: 10 } })
                )
            )
        ),

        showFilter && e(LMFilterPanel, {
            catId: catId, activeFilters: activeFilters,
            onApply: handleApplyFilters, onClose: () => setShowFilter(false)
        }),

        e('div', { className: `lm-toast${toastMsg ? ' show' : ''}` }, toastMsg)
    );
};