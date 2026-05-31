// ============================================================
// CHARACTER WIZARD STEPS — La Forja v15.0
// Componentes de cada paso del Wizard. Reciben props del padre
// y reportan cambios. NO manejan navegación (eso es del padre).
//
// Cada Step expone una constante global: CWStepXxx
//
// Cargar DESPUÉS de: cwBuilder.js
// Cargar ANTES de: characterWizard.js
// ============================================================

// ============================================================
// HELPERS COMPARTIDOS
// ============================================================

// ── Redimensionar imagen a max 512x512 antes de guardar ──────
// Funciona en iOS PWA, Android PWA y desktop. Devuelve data URL.
async function cwResizeImage(file, maxSize = 512, quality = 0.85) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('Archivo no es una imagen'));
            return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onload = ev => {
            const img = new Image();
            img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
            img.onload = () => {
                let w = img.width, h = img.height;
                if (w > h && w > maxSize) {
                    h = Math.round(h * (maxSize / w));
                    w = maxSize;
                } else if (h > maxSize) {
                    w = Math.round(w * (maxSize / h));
                    h = maxSize;
                }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                // Fondo blanco para JPEGs (por si la imagen tenía transparencia)
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, w, h);
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ============================================================
// CWAvatarPicker — Selector de retrato
// Props: { value, onChange(dataUrl | null) }
// ============================================================
const CWAvatarPicker = ({ value, onChange }) => {
    const { useRef, useState } = React;
    const e = React.createElement;
    const inputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleFile(file) {
        if (!file) return;
        setError(null);
        setLoading(true);
        try {
            const dataUrl = await cwResizeImage(file);
            onChange(dataUrl);
        } catch (err) {
            console.error('[Avatar] Error:', err);
            setError('No se pudo procesar la imagen');
        }
        setLoading(false);
    }

    function handleInputChange(ev) {
        const file = ev.target.files && ev.target.files[0];
        if (file) handleFile(file);
        ev.target.value = ''; // permite re-seleccionar el mismo archivo
    }

    function handleDrop(ev) {
        ev.preventDefault();
        const file = ev.dataTransfer.files && ev.dataTransfer.files[0];
        if (file) handleFile(file);
    }

    return e('div', { className: 'cw-avatar-wrap' },
        // Input file oculto
        e('input', {
            ref: inputRef,
            type: 'file',
            accept: 'image/*',
            style: { display: 'none' },
            onChange: handleInputChange,
        }),

        // Preview o botón
        value
            ? e('div', { className: 'cw-avatar-with-actions' },
                e('div', { className: 'cw-avatar-preview' },
                    e('img', { src: value, alt: 'Retrato' })
                ),
                e('div', { className: 'cw-avatar-actions' },
                    e('button', {
                        className: 'cw-avatar-btn cw-avatar-change',
                        onClick: () => inputRef.current?.click(),
                    }, '🔄 Cambiar imagen'),
                    e('button', {
                        className: 'cw-avatar-btn cw-avatar-remove',
                        onClick: () => onChange(null),
                    }, '🗑 Quitar imagen')
                )
            )
            : e('div', {
                className: 'cw-avatar-empty',
                onClick: () => inputRef.current?.click(),
                onDragOver: ev => ev.preventDefault(),
                onDrop: handleDrop,
            },
                loading
                    ? e('div', { className: 'cw-avatar-loading' },
                          e('div', { className: 'cw-spinner-sm' }),
                          e('span', null, 'Procesando...')
                      )
                    : e('div', null,
                          e('div', { className: 'cw-avatar-icon' }, '📷'),
                          e('div', { className: 'cw-avatar-label' }, '+ Elegir imagen'),
                          e('div', { className: 'cw-avatar-hint' }, 'Toca aquí o arrastra')
                      )
            ),

        error && e('div', { className: 'cw-avatar-error' }, error)
    );
};

// ============================================================
// CWStepMode — Selección de Modo Simple vs Experto
// Props: { onSelect(mode) }
// ============================================================
const CWStepMode = ({ onSelect }) => {
    const e = React.createElement;

    return e('div', { className: 'cw-step cw-step-mode' },
        e('div', { className: 'cw-mode-header' },
            e('div', { className: 'cw-mode-emoji' }, '🎲'),
            e('h1', { className: 'cw-mode-title' }, 'Nuevo Héroe'),
            e('p', { className: 'cw-mode-subtitle' }, '¿Cómo quieres crear tu personaje?')
        ),

        e('div', { className: 'cw-mode-cards' },
            // ── Card Simple ──
            e('div', {
                className: 'cw-mode-card cw-mode-card-simple',
                onClick: () => onSelect('simple'),
            },
                e('div', { className: 'cw-mode-card-icon' }, '⚡'),
                e('h2', { className: 'cw-mode-card-title' }, 'Modo Simple'),
                e('p', { className: 'cw-mode-card-desc' },
                    'Te guiamos paso a paso eligiendo solo lo esencial. ',
                    'Equipo, stats y subclase se asignan con valores recomendados. ',
                    'Ideal si es tu primer personaje o quieres jugar rápido.'
                ),
                e('div', { className: 'cw-mode-card-time' },
                    e('span', null, '⏱  ~3 minutos')
                )
            ),

            // ── Card Experto ──
            e('div', {
                className: 'cw-mode-card cw-mode-card-expert',
                onClick: () => onSelect('expert'),
            },
                e('div', { className: 'cw-mode-card-icon' }, '🎯'),
                e('h2', { className: 'cw-mode-card-title' }, 'Modo Experto'),
                e('p', { className: 'cw-mode-card-desc' },
                    'Control total sobre cada decisión. Eliges subclase, ',
                    'distribuyes stats con point buy, escoges cada pieza ',
                    'de equipo y hechizo.'
                ),
                e('div', { className: 'cw-mode-card-time' },
                    e('span', null, '⏱  ~10-15 minutos')
                )
            )
        ),

        e('div', { className: 'cw-mode-note' },
            '💡 ',
            e('span', null,
                'Sea cual sea el modo, podrás editar todo después en la hoja de personaje.'
            )
        )
    );
};

// ============================================================
// CWStepBasics — Información básica (nombre, retrato, alineamiento)
// Props: { data, onChange(updates) }
// ============================================================
const CWStepBasics = ({ data, onChange }) => {
    const { useState, useEffect } = React;
    const e = React.createElement;

    const [alignments, setAlignments] = useState([]);
    const [showAlignHelp, setShowAlignHelp] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const a = await DB.getSRD('srd_alignments') || [];
                setAlignments(a);
            } catch (err) {
                console.error('[CWStepBasics] No se pudieron cargar alineamientos', err);
            }
        })();
    }, []);

    const d = data || {};

    // Encuentra el alineamiento seleccionado para mostrar descripción
    const selectedAlign = alignments.find(a => a.index === (d.alignment?.index || ''));

    function update(field, value) {
        onChange({ ...d, [field]: value });
    }

    return e('div', { className: 'cw-step cw-step-basics' },
        e('div', { className: 'cw-step-header' },
            e('div', { className: 'cw-step-emoji' }, '👤'),
            e('h1', { className: 'cw-step-title' }, 'Información básica'),
            e('p', { className: 'cw-step-subtitle' },
                'Empecemos con lo más importante: ¿quién es tu personaje?')
        ),

        // ── Nombre ─────────────────────────────────────────
        e('div', { className: 'cw-field' },
            e('label', { className: 'cw-label' },
                'Nombre',
                e('span', { className: 'cw-required' }, ' *')
            ),
            e('input', {
                type: 'text',
                className: 'cw-input',
                placeholder: 'Ej: Aragorn, Elara Vientorrojo, Grumblesnort...',
                value: d.name || '',
                onChange: ev => update('name', ev.target.value),
                maxLength: 50,
            }),
            e('div', { className: 'cw-hint' },
                'Puedes cambiarlo después en la hoja de personaje.')
        ),

        // ── Retrato ────────────────────────────────────────
        e('div', { className: 'cw-field' },
            e('label', { className: 'cw-label' }, 'Retrato (opcional)'),
            e(CWAvatarPicker, {
                value: d.avatar || null,
                onChange: v => update('avatar', v),
            }),
            e('div', { className: 'cw-hint' },
                'Imagen desde tu dispositivo. Se ajustará automáticamente.')
        ),

        // ── Alineamiento ───────────────────────────────────
        e('div', { className: 'cw-field' },
            e('label', { className: 'cw-label' }, 'Alineamiento (opcional)'),
            alignments.length === 0
                ? e('div', { className: 'cw-input', style: { opacity: .55 } },
                      'Cargando alineamientos...')
                : e('select', {
                    className: 'cw-input cw-select',
                    value: d.alignment?.index || '',
                    onChange: ev => {
                        const al = alignments.find(a => a.index === ev.target.value);
                        update('alignment', al
                            ? { index: al.index, name: al.name, abbreviation: al.abbreviation }
                            : null);
                    },
                },
                    e('option', { value: '' }, '— Selecciona —'),
                    alignments.map(a => e('option', { key: a.index, value: a.index },
                        `${a.name} (${a.abbreviation})`
                    ))
                ),

            // Descripción del alineamiento seleccionado
            selectedAlign && e('div', { className: 'cw-align-desc' },
                e('strong', null, selectedAlign.name + ': '),
                selectedAlign.description
            ),

            // Toggle "¿Qué es el alineamiento?"
            e('button', {
                className: 'cw-toggle-help',
                onClick: () => setShowAlignHelp(!showAlignHelp),
            }, showAlignHelp ? '▼ Ocultar ayuda' : '▶ ¿Qué es el alineamiento?'),

            showAlignHelp && e('div', { className: 'cw-help-box' },
                e('p', null,
                    'El alineamiento describe la perspectiva moral y ética de tu personaje. ',
                    'Se expresa en dos ejes:'
                ),
                e('ul', null,
                    e('li', null, e('strong', null, 'Legal/Caótico:'),
                        ' Cuánto respeta tu personaje las reglas, leyes y autoridad.'),
                    e('li', null, e('strong', null, 'Bueno/Maligno:'),
                        ' Cuánto valora tu personaje el bienestar de los demás.')
                ),
                e('p', null,
                    'No tiene efecto mecánico — es solo una guía narrativa que ayuda a ',
                    'interpretar tu personaje. Si dudas, elige ',
                    e('strong', null, 'Neutral'), ' y decide más adelante.'
                )
            )
        )
    );
};

// ── Validador — usado por el padre para saber si se puede avanzar
function cwValidateBasics(d) {
    if (!d || !d.name || !d.name.trim()) {
        return { valid: false, error: 'El nombre del personaje es obligatorio.' };
    }
    if (d.name.trim().length > 50) {
        return { valid: false, error: 'El nombre es demasiado largo (máx. 50 caracteres).' };
    }
    return { valid: true };
}

// ============================================================
// CWSelectionCard — Card grande estilo BG3 con expansión al tocar
// Compartido por StepClass, StepSpecies, StepBackground
// Props: { item, isSelected, isExpanded, onToggle, onConfirm,
//          renderSummary, renderDetail, confirmLabel }
// ============================================================
const CWSelectionCard = ({ item, isSelected, isExpanded, onToggle, onConfirm,
                          renderSummary, renderDetail, confirmLabel }) => {
    const e = React.createElement;

    return e('div', {
        className: `cw-sel-card${isSelected ? ' cw-sel-selected' : ''}${isExpanded ? ' cw-sel-expanded' : ''}`,
        onClick: onToggle,
    },
        e('div', { className: 'cw-sel-card-summary' }, renderSummary(item)),

        isExpanded && e('div', {
            className: 'cw-sel-card-detail',
            onClick: ev => ev.stopPropagation(), // no colapsar al tocar dentro del detalle
        },
            renderDetail(item),
            e('button', {
                className: 'cw-sel-confirm-btn',
                onClick: ev => { ev.stopPropagation(); onConfirm(item); },
            }, confirmLabel || `Elegir ${item.name}`)
        )
    );
};

// ============================================================
// CWStepClass — Selección de clase (+ subclase si modo experto)
// Props: { data, onChange, mode }
// ============================================================
const CWStepClass = ({ data, onChange, mode }) => {
    const { useState, useEffect } = React;
    const e = React.createElement;

    const [classes, setClasses] = useState([]);
    const [allSubclasses, setAllSubclasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const [cls, sub] = await Promise.all([
                    DB.getSRD('srd_classes'),
                    DB.getSRD('srd_subclasses'),
                ]);
                setClasses(cls || []);
                setAllSubclasses(sub || []);
            } catch (err) {
                console.error('[CWStepClass] error cargando', err);
            }
            setLoading(false);
        })();
    }, []);

    const d = data || {};
    const selectedClass = d.class || null;

    function handleConfirm(cls) {
        // Encontrar subclases disponibles para esta clase
        const subclasses = allSubclasses.filter(sc => sc.class?.index === cls.index);
        const classWithSubs = { ...cls, subclasses };
        // En modo simple: subclase queda null (se elige al nivel 3 según SRD)
        // En modo experto: el usuario puede elegir abajo (otra UI)
        onChange({ class: classWithSubs, subclass: null });
        setExpandedId(null);
    }

    // ── Render del resumen de cada card ─────────────────────
    function renderClassSummary(cls) {
        // primary_ability en SRD 2024 puede ser un objeto { desc, ability_scores }
        // o un array directo en SRD 2014. Soportamos ambos.
        let primary = '';
        if (Array.isArray(cls.primary_ability)) {
            primary = cls.primary_ability.map(a => a.name || a).join('/');
        } else if (cls.primary_ability?.ability_scores) {
            primary = cls.primary_ability.ability_scores.map(a => a.name || a).join('/');
        } else if (cls.primary_ability?.desc) {
            primary = cls.primary_ability.desc;
        }
        const saves = (cls.saving_throws || []).map(s => (s.name || s).substring(0,3).toUpperCase()).join('/');
        const icon = CW_CLASS_ICONS[cls.index] || '⚔';
        return e('div', null,
            e('div', { className: 'cw-sel-icon' }, icon),
            e('div', { className: 'cw-sel-name' }, cls.name),
            e('div', { className: 'cw-sel-tags' },
                e('span', { className: 'cw-sel-tag' }, `d${cls.hit_die}`),
                primary && e('span', { className: 'cw-sel-tag' }, primary),
                saves && e('span', { className: 'cw-sel-tag cw-sel-tag-muted' }, `Salv: ${saves}`)
            )
        );
    }

    // ── Render del detalle expandido ────────────────────────
    function renderClassDetail(cls) {
        const subsForCls = allSubclasses.filter(sc => sc.class?.index === cls.index);
        return e('div', null,
            cls.proficiencies?.length > 0 && e('div', { className: 'cw-sel-section' },
                e('div', { className: 'cw-sel-section-label' }, 'Competencias automáticas'),
                e('div', { className: 'cw-sel-section-text' },
                    cls.proficiencies.map(p => p.name).join(' · '))
            ),
            cls.proficiency_choices?.length > 0 && e('div', { className: 'cw-sel-section' },
                e('div', { className: 'cw-sel-section-label' }, 'Habilidades a elegir'),
                cls.proficiency_choices.map((pc, i) => e('div', {
                    key: i, className: 'cw-sel-section-text', style: { marginBottom: 4 }
                }, `Elige ${pc.choose}: ${pc.desc || ''}`))
            ),
            subsForCls.length > 0 && e('div', { className: 'cw-sel-section' },
                e('div', { className: 'cw-sel-section-label' },
                    `Subclases disponibles (${subsForCls.length})`),
                e('div', { className: 'cw-sel-section-text' },
                    subsForCls.map(s => s.name).join(' · ')),
                e('div', { className: 'cw-sel-note' },
                    'Tu subclase se eligirá al alcanzar el nivel 3.')
            )
        );
    }

    if (loading) {
        return e('div', { className: 'cw-step' },
            e('div', { className: 'cw-loading' },
                e('div', { className: 'cw-spinner-sm' }),
                e('span', null, 'Cargando clases...')
            )
        );
    }

    return e('div', { className: 'cw-step cw-step-class' },
        e('div', { className: 'cw-step-header' },
            e('div', { className: 'cw-step-emoji' }, '⚔️'),
            e('h1', { className: 'cw-step-title' }, 'Elige tu clase'),
            e('p', { className: 'cw-step-subtitle' },
                'Tu clase define cómo luchas, qué habilidades dominas y tu rol en el grupo.')
        ),

        e('div', { className: 'cw-sel-grid' },
            classes.map(cls => e(CWSelectionCard, {
                key: cls.index,
                item: cls,
                isSelected: selectedClass?.index === cls.index,
                isExpanded: expandedId === cls.index,
                onToggle: () => setExpandedId(expandedId === cls.index ? null : cls.index),
                onConfirm: handleConfirm,
                renderSummary: renderClassSummary,
                renderDetail: renderClassDetail,
                confirmLabel: `✓ Elegir ${cls.name}`,
            }))
        )
        // ── Subclases se eligen al nivel 3 según SRD 2024 — no se ofrecen en wizard de creación
    );
};

// Iconos por clase (D&D 5e clases del SRD)
const CW_CLASS_ICONS = {
    barbarian: '🪓',
    bard:      '🎵',
    cleric:    '🛡️',
    druid:     '🌿',
    fighter:   '⚔️',
    monk:      '👊',
    paladin:   '✨',
    ranger:    '🏹',
    rogue:     '🗡️',
    sorcerer:  '🔮',
    warlock:   '👹',
    wizard:    '📖',
};

// ============================================================
// CWStepSpecies — Selección de especie + subespecie
// Props: { data, onChange }
// ============================================================
const CWStepSpecies = ({ data, onChange }) => {
    const { useState, useEffect, useRef } = React;
    const e = React.createElement;

    const [species, setSpecies] = useState([]);
    const [allSubspecies, setAllSubspecies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const subspeciesSectionRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                const [sp, ssp] = await Promise.all([
                    DB.getSRD('srd_species'),
                    DB.getSRD('srd_subspecies'),
                ]);
                setSpecies(sp || []);
                setAllSubspecies(ssp || []);
            } catch (err) {
                console.error('[CWStepSpecies] error cargando', err);
            }
            setLoading(false);
        })();
    }, []);

    const d = data || {};
    const selectedSpecies = d.species || null;

    function handleConfirmSpecies(sp) {
        // Si la especie tiene subespecies, no completamos aún — esperamos selección
        const hasSubspecies = (sp.subspecies || []).length > 0;
        onChange({
            species: sp,
            subspecies: null,
            _needsSubspecies: hasSubspecies,
        });
        setExpandedId(null);

        // Si hay subespecies, scroll suave al selector después de que renderice
        if (hasSubspecies) {
            setTimeout(() => {
                if (subspeciesSectionRef.current) {
                    subspeciesSectionRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }
            }, 100);
        }
    }

    function handleSelectSubspecies(sub) {
        // Buscar subespecie completa en allSubspecies
        const fullSub = allSubspecies.find(s => s.index === sub.index) || sub;
        onChange({ ...d, subspecies: fullSub, _needsSubspecies: false });
    }

    function renderSpeciesSummary(sp) {
        const icon = CW_SPECIES_ICONS[sp.index] || '🧬';
        const subCount = (sp.subspecies || []).length;
        return e('div', null,
            e('div', { className: 'cw-sel-icon' }, icon),
            e('div', { className: 'cw-sel-name' }, sp.name),
            e('div', { className: 'cw-sel-tags' },
                e('span', { className: 'cw-sel-tag' }, sp.size || 'Mediano'),
                e('span', { className: 'cw-sel-tag' }, `${sp.speed || 30} pies`),
                subCount > 0 && e('span', { className: 'cw-sel-tag cw-sel-tag-muted' },
                    `${subCount} subespecies`)
            )
        );
    }

    function renderSpeciesDetail(sp) {
        return e('div', null,
            sp.traits?.length > 0 && e('div', { className: 'cw-sel-section' },
                e('div', { className: 'cw-sel-section-label' }, 'Rasgos raciales'),
                e('div', { className: 'cw-sel-section-text' },
                    sp.traits.map(t => t.name).join(' · '))
            ),
            sp.subspecies?.length > 0 && e('div', { className: 'cw-sel-section' },
                e('div', { className: 'cw-sel-section-label' }, 'Subespecies'),
                e('div', { className: 'cw-sel-section-text' },
                    sp.subspecies.map(s => s.name).join(' · '))
            )
        );
    }

    if (loading) {
        return e('div', { className: 'cw-step' },
            e('div', { className: 'cw-loading' },
                e('div', { className: 'cw-spinner-sm' }),
                e('span', null, 'Cargando especies...')
            )
        );
    }

    return e('div', { className: 'cw-step cw-step-species' },
        e('div', { className: 'cw-step-header' },
            e('div', { className: 'cw-step-emoji' }, '🧬'),
            e('h1', { className: 'cw-step-title' }, 'Elige tu especie'),
            e('p', { className: 'cw-step-subtitle' },
                'Tu especie determina tu apariencia, rasgos físicos y dones naturales.')
        ),

        e('div', { className: 'cw-sel-grid' },
            species.map(sp => e(CWSelectionCard, {
                key: sp.index,
                item: sp,
                isSelected: selectedSpecies?.index === sp.index,
                isExpanded: expandedId === sp.index,
                onToggle: () => setExpandedId(expandedId === sp.index ? null : sp.index),
                onConfirm: handleConfirmSpecies,
                renderSummary: renderSpeciesSummary,
                renderDetail: renderSpeciesDetail,
                confirmLabel: `✓ Elegir ${sp.name}`,
            }))
        ),

        // ── Si la especie elegida tiene subespecies, mostrar selector ──
        selectedSpecies && (selectedSpecies.subspecies || []).length > 0 && e('div',
            { className: 'cw-subclass-section', ref: subspeciesSectionRef },
            e('h2', { className: 'cw-subclass-title' },
                `Subespecie de ${selectedSpecies.name}`),
            e('p', { className: 'cw-subclass-hint' },
                'Elige la variante que mejor describe a tu personaje.'),
            e('div', { className: 'cw-subclass-list' },
                selectedSpecies.subspecies.map(sub => {
                    const fullSub = allSubspecies.find(s => s.index === sub.index);
                    return e('button', {
                        key: sub.index,
                        className: `cw-subclass-item${d.subspecies?.index === sub.index ? ' cw-subclass-selected' : ''}`,
                        onClick: () => handleSelectSubspecies(fullSub || sub),
                    },
                        e('div', { className: 'cw-subclass-name' }, sub.name),
                        fullSub?.traits?.length > 0 && e('div', { className: 'cw-subclass-summary' },
                            fullSub.traits.map(t => t.name).join(' · '))
                    );
                })
            )
        )
    );
};

const CW_SPECIES_ICONS = {
    dragonborn: '🐉',
    dwarf:      '⛏️',
    elf:        '🏹',
    gnome:      '🔧',
    goliath:    '⛰️',
    halfling:   '🍀',
    human:      '👤',
    orc:        '💪',
    tiefling:   '😈',
};

// ============================================================
// CWStepBackground — Selección de trasfondo
// Props: { data, onChange }
// ============================================================
const CWStepBackground = ({ data, onChange }) => {
    const { useState, useEffect } = React;
    const e = React.createElement;

    const [backgrounds, setBackgrounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                // Carga SRD + homebrew
                const srd = (await DB.getSRD('srd_backgrounds')) || [];
                let brew = [];
                try {
                    brew = (await DB.getSetting('lm_brew_b_srd_backgrounds')) || [];
                } catch(e) {}
                setBackgrounds([...srd, ...brew]);
            } catch (err) {
                console.error('[CWStepBackground] error cargando', err);
            }
            setLoading(false);
        })();
    }, []);

    const d = data || {};
    const selectedBg = d.background || null;

    function handleConfirmBg(bg) {
        onChange({
            background: bg,
            ability_bonus_distribution: null, // se asigna en el paso de stats
        });
        setExpandedId(null);
    }

    function renderBgSummary(bg) {
        const isBrew = bg.source === 'homebrew';
        const abil = (bg.ability_scores || []).map(a => a.name).join('/') || '—';
        const featName = bg.feat?.name || '—';
        return e('div', null,
            e('div', { className: 'cw-sel-icon' }, '📜'),
            e('div', { className: 'cw-sel-name' },
                bg.name,
                isBrew && e('span', { className: 'cw-sel-brewbadge' }, '⚒')
            ),
            e('div', { className: 'cw-sel-tags' },
                e('span', { className: 'cw-sel-tag' }, abil),
                bg.feat && e('span', { className: 'cw-sel-tag cw-sel-tag-muted' }, `Dote: ${featName}`)
            )
        );
    }

    function renderBgDetail(bg) {
        return e('div', null,
            bg.ability_scores?.length > 0 && e('div', { className: 'cw-sel-section' },
                e('div', { className: 'cw-sel-section-label' }, 'Mejoras de característica'),
                e('div', { className: 'cw-sel-section-text' },
                    bg.ability_scores.map(a => a.name).join(' · ') +
                    ' (elegirás cómo asignar +2/+1 o +1/+1/+1 en el paso de stats)'
                )
            ),
            bg.feat && e('div', { className: 'cw-sel-section' },
                e('div', { className: 'cw-sel-section-label' }, 'Dote inicial'),
                e('div', { className: 'cw-sel-section-text' }, bg.feat.name)
            ),
            bg.proficiencies?.length > 0 && e('div', { className: 'cw-sel-section' },
                e('div', { className: 'cw-sel-section-label' }, 'Competencias'),
                e('div', { className: 'cw-sel-section-text' },
                    bg.proficiencies.map(p => p.name).join(' · '))
            ),
            bg.equipment_options?.length > 0 && e('div', { className: 'cw-sel-section' },
                e('div', { className: 'cw-sel-section-label' }, 'Equipo inicial'),
                bg.equipment_options.map((opt, i) => e('div', {
                    key: i, className: 'cw-sel-section-text', style: { marginBottom: 4 }
                }, opt.desc || `Opción ${i+1}`))
            ),
            // Descripción si la tiene (homebrew especialmente)
            bg.desc && e('div', { className: 'cw-sel-section' },
                e('div', { className: 'cw-sel-section-label' }, 'Descripción'),
                e('div', { className: 'cw-sel-section-text' },
                    Array.isArray(bg.desc) ? bg.desc.join('\n\n') : bg.desc)
            )
        );
    }

    if (loading) {
        return e('div', { className: 'cw-step' },
            e('div', { className: 'cw-loading' },
                e('div', { className: 'cw-spinner-sm' }),
                e('span', null, 'Cargando trasfondos...')
            )
        );
    }

    return e('div', { className: 'cw-step cw-step-bg' },
        e('div', { className: 'cw-step-header' },
            e('div', { className: 'cw-step-emoji' }, '📜'),
            e('h1', { className: 'cw-step-title' }, 'Elige tu trasfondo'),
            e('p', { className: 'cw-step-subtitle' },
                '¿Qué hacías antes de la aventura? Esto define competencias, dote inicial y mejoras de característica.')
        ),

        backgrounds.length === 0
            ? e('div', { className: 'cw-no-results' },
                  e('p', null, 'No hay trasfondos disponibles.'),
                  e('p', { style: { fontSize: 12, opacity: .7 } },
                      'Puedes crear uno propio en la Biblioteca → Homebrew → Trasfondos.')
              )
            : e('div', { className: 'cw-sel-grid' },
                backgrounds.map(bg => e(CWSelectionCard, {
                    key: bg.index,
                    item: bg,
                    isSelected: selectedBg?.index === bg.index,
                    isExpanded: expandedId === bg.index,
                    onToggle: () => setExpandedId(expandedId === bg.index ? null : bg.index),
                    onConfirm: handleConfirmBg,
                    renderSummary: renderBgSummary,
                    renderDetail: renderBgDetail,
                    confirmLabel: `✓ Elegir ${bg.name}`,
                }))
            )
    );
};

// ── Validadores ──────────────────────────────────────────────
function cwValidateClass(d) {
    if (!d || !d.class || !d.class.index) {
        return { valid: false, error: 'Debes elegir una clase.' };
    }
    return { valid: true };
}

function cwValidateSpecies(d) {
    if (!d || !d.species || !d.species.index) {
        return { valid: false, error: 'Debes elegir una especie.' };
    }
    // Si la especie tiene subespecies, debe haber una elegida
    if ((d.species.subspecies || []).length > 0 && !d.subspecies) {
        return { valid: false, error: `Debes elegir una subespecie de ${d.species.name}.` };
    }
    return { valid: true };
}

function cwValidateBackground(d) {
    if (!d || !d.background || !d.background.index) {
        return { valid: false, error: 'Debes elegir un trasfondo.' };
    }
    return { valid: true };
}

// ── Exponer al global ────────────────────────────────────────
// ── Exponer al global ────────────────────────────────────────
window.CWAvatarPicker       = CWAvatarPicker;
window.CWStepMode           = CWStepMode;
window.CWStepBasics         = CWStepBasics;
window.cwValidateBasics     = cwValidateBasics;
window.cwResizeImage        = cwResizeImage;
window.CWSelectionCard      = CWSelectionCard;
window.CWStepClass          = CWStepClass;
window.CWStepSpecies        = CWStepSpecies;
window.CWStepBackground     = CWStepBackground;
window.cwValidateClass      = cwValidateClass;
window.cwValidateSpecies    = cwValidateSpecies;
window.cwValidateBackground = cwValidateBackground;
window.CW_CLASS_ICONS       = CW_CLASS_ICONS;
window.CW_SPECIES_ICONS     = CW_SPECIES_ICONS;

// ============================================================
// CWStepStats — Distribución de características
// Tabs: Point Buy / Standard Array / Manual
// + Bonus del trasfondo (+2/+1 o +1/+1/+1)
// Props: { data, onChange, selections }
// ============================================================
const CWStepStats = ({ data, onChange, selections }) => {
    const e = React.createElement;

    const method = data?.method || 'point_buy';
    const base = data?.base || (method === 'point_buy'
        ? { str:8, dex:8, con:8, int:8, wis:8, cha:8 }
        : { ...CW_DEFAULT_STATS });
    const arrayAssignments = data?.arrayAssignments
        || { str:null, dex:null, con:null, int:null, wis:null, cha:null };
    const bonusDistribution = data?.bonusDistribution || {};

    const bg = selections?.backgroundChoice?.background;
    const bgStats = bg?.ability_scores || [];

    // Cantos puntos usados en point buy
    const pointBuyUsed = CW_ABILITIES.reduce((sum, a) =>
        sum + (CW_POINT_BUY_COSTS[base[a.key]] ?? 0), 0);
    const pointsLeft = CW_POINT_BUY_TOTAL - pointBuyUsed;

    // Total del bonus del trasfondo
    const bonusUsed = Object.values(bonusDistribution).reduce((a,b) => a + (b||0), 0);
    const bonusLeft = 3 - bonusUsed;

    function changeMethod(newMethod) {
        let newBase, newArray = { str:null, dex:null, con:null, int:null, wis:null, cha:null };
        if (newMethod === 'point_buy') {
            newBase = { str:8, dex:8, con:8, int:8, wis:8, cha:8 };
        } else if (newMethod === 'standard_array') {
            newBase = { str:0, dex:0, con:0, int:0, wis:0, cha:0 };
        } else {
            newBase = { ...CW_DEFAULT_STATS };
        }
        onChange({ method: newMethod, base: newBase, arrayAssignments: newArray, bonusDistribution });
    }

    function changePointBuy(stat, delta) {
        const newVal = base[stat] + delta;
        if (newVal < 8 || newVal > 15) return;
        const newBase = { ...base, [stat]: newVal };
        const newUsed = CW_ABILITIES.reduce((sum, a) =>
            sum + (CW_POINT_BUY_COSTS[newBase[a.key]] ?? 0), 0);
        if (newUsed > CW_POINT_BUY_TOTAL) return;
        onChange({ ...data, base: newBase });
    }

    function changeManual(stat, value) {
        const num = parseInt(value);
        const v = isNaN(num) ? 0 : Math.max(1, Math.min(20, num));
        onChange({ ...data, base: { ...base, [stat]: v } });
    }

    function assignArrayValue(stat, arrayIdx) {
        const newAssignments = { ...arrayAssignments };
        // Si este idx ya estaba asignado a otra stat, quitárselo
        if (arrayIdx !== '') {
            const idxNum = Number(arrayIdx);
            Object.keys(newAssignments).forEach(k => {
                if (newAssignments[k] === idxNum) newAssignments[k] = null;
            });
            newAssignments[stat] = idxNum;
        } else {
            newAssignments[stat] = null;
        }
        // Recalcular base
        const newBase = { str:0, dex:0, con:0, int:0, wis:0, cha:0 };
        Object.keys(newAssignments).forEach(k => {
            if (newAssignments[k] !== null) {
                newBase[k] = CW_STANDARD_ARRAY[newAssignments[k]];
            }
        });
        onChange({ ...data, arrayAssignments: newAssignments, base: newBase });
    }

    function setBonus(stat, value) {
        const v = Math.max(0, Math.min(2, value));
        const newBonus = { ...bonusDistribution, [stat]: v };
        // Limpiar la entrada si es 0
        if (v === 0) delete newBonus[stat];
        // Validar suma <= 3
        const total = Object.values(newBonus).reduce((a,b) => a + (b||0), 0);
        if (total > 3) return;
        onChange({ ...data, bonusDistribution: newBonus });
    }

    function getStatFinal(stat) {
        return (base[stat] || 0) + (bonusDistribution[stat] || 0);
    }

    function bgStatKey(bgStat) {
        // Prefiere el campo 'index' que siempre es canónico (str/dex/con/int/wis/cha)
        if (bgStat?.index) return bgStat.index.toLowerCase();

        // Fallback por nombre (soporta inglés y español completo)
        const map = {
            'Strength': 'str',     'Fuerza': 'str',     'FUE': 'str',
            'Dexterity': 'dex',    'Destreza': 'dex',   'DES': 'dex',
            'Constitution': 'con', 'Constitución': 'con','CON': 'con',
            'Intelligence': 'int', 'Inteligencia': 'int','INT': 'int',
            'Wisdom': 'wis',       'Sabiduría': 'wis',  'SAB': 'wis',
            'Charisma': 'cha',     'Carisma': 'cha',    'CAR': 'cha',
        };
        const name = bgStat?.name || bgStat || '';
        return map[name] || name.toString().substring(0,3).toLowerCase();
    }

    const bgStatKeys = bgStats.map(s => bgStatKey(s));

    return e('div', { className: 'cw-step cw-step-stats' },
        e('div', { className: 'cw-step-header' },
            e('div', { className: 'cw-step-emoji' }, '🎲'),
            e('h1', { className: 'cw-step-title' }, 'Características'),
            e('p', { className: 'cw-step-subtitle' },
                'Distribuye los valores de tus 6 atributos principales.')
        ),

        // ── Tabs de método ────────────────────────────────────
        e('div', { className: 'cw-stat-tabs' },
            ['point_buy', 'standard_array', 'manual'].map(m =>
                e('button', {
                    key: m,
                    className: `cw-stat-tab${method === m ? ' on' : ''}`,
                    onClick: () => changeMethod(m),
                }, m === 'point_buy' ? 'Point Buy'
                  : m === 'standard_array' ? 'Standard Array'
                  : 'Manual')
            )
        ),

        // ── Contador (Point Buy) ──────────────────────────────
        method === 'point_buy' && e('div', { className: 'cw-stat-counter' },
            e('span', null,
                'Puntos restantes: ',
                e('strong', { style: { color: pointsLeft === 0 ? '#10b981' : (pointsLeft < 0 ? '#dc2626' : 'inherit') } },
                    `${pointsLeft}/${CW_POINT_BUY_TOTAL}`)
            ),
            e('span', { className: 'cw-stat-counter-hint' },
                'Cada stat va de 8 a 15')
        ),

        // ── Standard Array — visualizar valores disponibles ───
        method === 'standard_array' && e('div', { className: 'cw-array-row' },
            e('span', { className: 'cw-array-label' }, 'Array:'),
            CW_STANDARD_ARRAY.map((val, idx) => {
                const used = Object.values(arrayAssignments).includes(idx);
                return e('span', {
                    key: idx,
                    className: `cw-array-val${used ? ' cw-array-used' : ''}`,
                }, val);
            })
        ),

        // ── 6 stats ──────────────────────────────────────────
        e('div', { className: 'cw-stats-grid' },
            CW_ABILITIES.map(ab => {
                const baseVal = base[ab.key];
                const bonusVal = bonusDistribution[ab.key] || 0;
                const finalVal = getStatFinal(ab.key);
                const mod = cwAbilityMod(finalVal);
                const isInBg = bgStatKeys.includes(ab.key);

                return e('div', {
                    key: ab.key,
                    className: `cw-stat-row${isInBg ? ' cw-stat-row-bg' : ''}`,
                },
                    e('div', { className: 'cw-stat-info' },
                        e('div', { className: 'cw-stat-short' }, ab.short),
                        e('div', { className: 'cw-stat-fullname' }, ab.name)
                    ),

                    // Control según método
                    method === 'point_buy' && e('div', { className: 'cw-stat-control' },
                        e('button', {
                            className: 'cw-stat-btn',
                            disabled: baseVal <= 8,
                            onClick: () => changePointBuy(ab.key, -1),
                        }, '−'),
                        e('div', { className: 'cw-stat-value' }, baseVal),
                        e('button', {
                            className: 'cw-stat-btn',
                            disabled: baseVal >= 15 || pointsLeft <= 0,
                            onClick: () => changePointBuy(ab.key, +1),
                        }, '+')
                    ),

                    method === 'standard_array' && e('div', { className: 'cw-stat-control' },
                        e('select', {
                            className: 'cw-input cw-select cw-stat-array-select',
                            value: arrayAssignments[ab.key] !== null
                                ? String(arrayAssignments[ab.key]) : '',
                            onChange: ev => assignArrayValue(ab.key, ev.target.value),
                        },
                            e('option', { value: '' }, '—'),
                            CW_STANDARD_ARRAY.map((val, idx) => {
                                const usedByOther = Object.entries(arrayAssignments)
                                    .some(([k, v]) => k !== ab.key && v === idx);
                                return e('option', {
                                    key: idx, value: idx,
                                    disabled: usedByOther,
                                }, `${val}${usedByOther ? ' (asignado)' : ''}`);
                            })
                        )
                    ),

                    method === 'manual' && e('div', { className: 'cw-stat-control' },
                        e('input', {
                            type: 'number',
                            className: 'cw-input cw-stat-manual-input',
                            value: baseVal,
                            min: 1, max: 20,
                            onChange: ev => changeManual(ab.key, ev.target.value),
                        })
                    ),

                    // Bonus + final + mod
                    e('div', { className: 'cw-stat-result' },
                        bonusVal > 0 && e('span', { className: 'cw-stat-bonus' }, `+${bonusVal}`),
                        e('span', { className: 'cw-stat-final' },
                            '= ', finalVal),
                        e('span', { className: 'cw-stat-mod' },
                            ` (${mod >= 0 ? '+' : ''}${mod})`)
                    )
                );
            })
        ),

        // ── Bonus del trasfondo ───────────────────────────────
        bgStats.length > 0 && e('div', { className: 'cw-bg-bonus' },
            e('h2', { className: 'cw-bg-bonus-title' },
                '🎯 Mejoras de tu trasfondo'),
            e('p', { className: 'cw-bg-bonus-hint' },
                `Distribuye 3 puntos entre las características de tu trasfondo `,
                e('strong', null, bg?.name || ''),
                '. Puedes hacer +2/+1 o +1/+1/+1, máximo +2 en una stat.'),

            e('div', { className: 'cw-bg-bonus-row' },
                e('span', { className: 'cw-stat-counter-hint' },
                    `Puntos restantes: ${bonusLeft}/3`)
            ),

            e('div', { className: 'cw-bg-bonus-grid' },
                bgStats.map(bgStat => {
                    const key = bgStatKey(bgStat);
                    const val = bonusDistribution[key] || 0;
                    return e('div', { key: key, className: 'cw-bg-bonus-item' },
                        e('div', { className: 'cw-bg-bonus-name' }, bgStat.name),
                        e('div', { className: 'cw-stat-control' },
                            [0, 1, 2].map(n => e('button', {
                                key: n,
                                className: `cw-bg-bonus-btn${val === n ? ' on' : ''}`,
                                disabled: n > val && (bonusUsed - val + n) > 3,
                                onClick: () => setBonus(key, n),
                            }, `+${n}`))
                        )
                    );
                })
            )
        )
    );
};

// ── Validator ────────────────────────────────────────────────
function cwValidateStats(data, selections) {
    if (!data) return { valid: false, error: 'Configura las características.' };

    const bg = selections?.backgroundChoice?.background;
    const bgStats = bg?.ability_scores || [];
    const bonusUsed = Object.values(data.bonusDistribution || {}).reduce((a,b) => a + (b||0), 0);

    if (data.method === 'point_buy') {
        const used = CW_ABILITIES.reduce((sum, a) =>
            sum + (CW_POINT_BUY_COSTS[(data.base || {})[a.key]] ?? 0), 0);
        if (used !== CW_POINT_BUY_TOTAL) {
            return { valid: false, error: `Usa exactamente los ${CW_POINT_BUY_TOTAL} puntos del Point Buy.` };
        }
    } else if (data.method === 'standard_array') {
        const assignments = data.arrayAssignments || {};
        const filled = Object.values(assignments).filter(v => v !== null).length;
        if (filled !== 6) {
            return { valid: false, error: 'Asigna todos los valores del Standard Array.' };
        }
    } else {
        // Manual: solo verificar que no haya 0s
        const hasZeros = CW_ABILITIES.some(a => !(data.base || {})[a.key] || data.base[a.key] < 1);
        if (hasZeros) return { valid: false, error: 'Todos los stats deben ser ≥ 1.' };
    }

    // Bonus del trasfondo: si hay stats en el trasfondo, deben sumar 3
    if (bgStats.length > 0 && bonusUsed !== 3) {
        return { valid: false, error: 'Distribuye los 3 puntos del bonus del trasfondo.' };
    }

    return { valid: true };
}

// ============================================================
// CWStepEquipment — Selección de equipo inicial
// Props: { data, onChange, selections }
// ============================================================
const CWStepEquipment = ({ data, onChange, selections }) => {
    const e = React.createElement;

    const cls = selections?.classChoice?.class;
    const bg = selections?.backgroundChoice?.background;

    const classOptions = cls?.starting_equipment_options || [];
    const bgOptions = bg?.equipment_options || [];

    const choices = data?.choices || {};

    function selectChoice(scope, optIdx) {
        // scope = 'class_0', 'class_1', 'bg_0' etc.
        onChange({ ...data, choices: { ...choices, [scope]: optIdx } });
    }

    // ── Render de una opción del SRD parseada lo mejor posible
    function describeOption(opt, optIdx) {
        // Caso simple: SRD 2024 con `desc`
        if (opt.desc) return opt.desc;
        // SRD con options_array
        if (opt.from?.options) {
            return opt.from.options.map(o => {
                if (o.option_type === 'counted_reference' && o.of?.name) {
                    return `${o.count || 1}× ${o.of.name}`;
                }
                if (o.option_type === 'reference' && o.of?.name) {
                    return o.of.name;
                }
                if (o.option_type === 'multiple' && Array.isArray(o.items)) {
                    return o.items.map(it =>
                        it.of?.name ? `${it.count || 1}× ${it.of.name}` : (it.name || '?')
                    ).join(' + ');
                }
                return o.name || '?';
            }).join(' / ');
        }
        // Categoría
        if (opt.from?.equipment_category?.name) {
            return `Elige ${opt.choose} de ${opt.from.equipment_category.name}`;
        }
        return `Opción ${optIdx + 1}`;
    }

    return e('div', { className: 'cw-step cw-step-equipment' },
        e('div', { className: 'cw-step-header' },
            e('div', { className: 'cw-step-emoji' }, '🎒'),
            e('h1', { className: 'cw-step-title' }, 'Equipo inicial'),
            e('p', { className: 'cw-step-subtitle' },
                'Selecciona qué equipo recibe tu personaje. Puedes ajustar todo después desde la hoja.')
        ),

        // ── Equipo de la clase ────────────────────────────────
        cls && e('div', { className: 'cw-eq-section' },
            e('h2', { className: 'cw-eq-section-title' },
                `🛡 De tu clase (${cls.name})`),
            classOptions.length === 0
                ? e('div', { className: 'cw-eq-empty' },
                    'Esta clase no tiene opciones predefinidas en el SRD. ',
                    'Podrás agregar equipo desde la hoja de personaje.')
                : e('div', { className: 'cw-eq-options' },
                    classOptions.map((opt, idx) => e('div', {
                        key: idx, className: 'cw-eq-choice-group',
                    },
                        e('div', { className: 'cw-eq-choice-label' },
                            `Elige ${opt.choose || 1}:`),
                        e('label', {
                            className: `cw-eq-option${choices[`class_${idx}`] === idx ? ' on' : ''}`,
                        },
                            e('input', {
                                type: 'radio',
                                name: `class_${idx}`,
                                checked: choices[`class_${idx}`] === idx,
                                onChange: () => selectChoice(`class_${idx}`, idx),
                            }),
                            e('span', { className: 'cw-eq-option-text' },
                                describeOption(opt, idx))
                        )
                    ))
                )
        ),

        // ── Equipo del trasfondo ──────────────────────────────
        bg && bgOptions.length > 0 && e('div', { className: 'cw-eq-section' },
            e('h2', { className: 'cw-eq-section-title' },
                `📜 De tu trasfondo (${bg.name})`),
            e('div', { className: 'cw-eq-options' },
                bgOptions.map((opt, idx) => e('label', {
                    key: idx,
                    className: `cw-eq-option${choices[`bg_${idx}`] === idx ? ' on' : ''}`,
                },
                    e('input', {
                        type: 'radio',
                        name: 'bg_eq',
                        checked: choices[`bg_${idx}`] === idx,
                        onChange: () => selectChoice(`bg_${idx}`, idx),
                    }),
                    e('span', { className: 'cw-eq-option-text' },
                        describeOption(opt, idx))
                ))
            )
        ),

        // ── Nota ──────────────────────────────────────────────
        e('div', { className: 'cw-eq-note' },
            '💡 ',
            e('span', null,
                'Las opciones del SRD son una sugerencia. Podrás añadir, quitar o modificar tu inventario completo desde la hoja de personaje después de crearlo.')
        )
    );
};

function cwValidateEquipment(data) {
    // Equipo es opcional — siempre válido
    return { valid: true };
}

// ============================================================
// CWStepSpells — Selección de hechizos (si la clase es lanzadora)
// Props: { data, onChange, selections }
// ============================================================

// Clases con magia
const CW_SPELLCASTING_CLASSES = new Set([
    'bard', 'cleric', 'druid', 'paladin', 'ranger',
    'sorcerer', 'warlock', 'wizard',
]);

// Cuántos cantrips/hechizos recomienda el SRD a nivel 1
const CW_SPELLS_LIMITS_LV1 = {
    bard:     { cantrips: 2, known: 4 },
    cleric:   { cantrips: 3, known: 0 }, // prepara todos
    druid:    { cantrips: 2, known: 0 }, // prepara todos
    paladin:  { cantrips: 0, known: 0 }, // empieza nivel 2 técnicamente
    ranger:   { cantrips: 0, known: 0 },
    sorcerer: { cantrips: 4, known: 2 },
    warlock:  { cantrips: 2, known: 2 },
    wizard:   { cantrips: 3, known: 6 },
};

const CWStepSpells = ({ data, onChange, selections }) => {
    const { useState, useEffect } = React;
    const e = React.createElement;

    const cls = selections?.classChoice?.class;
    const classIndex = cls?.index;
    const isCaster = CW_SPELLCASTING_CLASSES.has(classIndex);

    const [allSpells, setAllSpells] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    const selectedCantrips = data?.cantrips || [];
    const selectedKnown = data?.known || [];

    useEffect(() => {
        if (!isCaster) { setLoading(false); return; }
        (async () => {
            try {
                const spells = (await DB.getSRD('srd_spells')) || [];
                let brewSpells = [];
                try {
                    brewSpells = (await DB.getSetting('lm_brew_b_srd_spells')) || [];
                } catch(e) {}
                setAllSpells([...spells, ...brewSpells]);
            } catch (err) {
                console.error('[CWStepSpells] Error', err);
            }
            setLoading(false);
        })();
    }, [classIndex]);

    if (!isCaster) {
        return e('div', { className: 'cw-step cw-step-spells' },
            e('div', { className: 'cw-step-header' },
                e('div', { className: 'cw-step-emoji' }, '✨'),
                e('h1', { className: 'cw-step-title' }, 'Hechizos'),
                e('p', { className: 'cw-step-subtitle' },
                    `${cls?.name || 'Tu clase'} no usa hechizos. Pasa al siguiente paso.`)
            ),
            e('div', { className: 'cw-no-results' },
                e('div', { style: { fontSize: 48, marginBottom: 12 } }, '🚫'),
                e('p', null, 'No hay hechizos disponibles para esta clase.')
            )
        );
    }

    if (loading) {
        return e('div', { className: 'cw-step' },
            e('div', { className: 'cw-loading' },
                e('div', { className: 'cw-spinner-sm' }),
                e('span', null, 'Cargando hechizos...')
            )
        );
    }

    // Filtrar hechizos para esta clase
    const availableSpells = allSpells.filter(s =>
        (s.classes || []).some(c => c.index === classIndex)
    );
    const cantrips = availableSpells.filter(s => s.level === 0)
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const lvl1 = availableSpells.filter(s => s.level === 1)
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const limits = CW_SPELLS_LIMITS_LV1[classIndex] || { cantrips: 0, known: 0 };

    function toggleSpell(spell, listKey, limit) {
        const list = data?.[listKey] || [];
        const exists = list.some(s => s.index === spell.index);

        // Si no existe y ya llegamos al límite, no añadir
        if (!exists && limit > 0 && list.length >= limit) {
            return;
        }
        const newList = exists
            ? list.filter(s => s.index !== spell.index)
            : [...list, { index: spell.index, name: spell.name }];
        onChange({ ...data, [listKey]: newList });
    }

    function isSelected(spell, listKey) {
        return (data?.[listKey] || []).some(s => s.index === spell.index);
    }

    function renderSpellList(spells, listKey, limit) {
        const selectedCount = (data?.[listKey] || []).length;
        const atMax = limit > 0 && selectedCount >= limit;
        return e('div', null,
            spells.length === 0
                ? e('div', { className: 'cw-no-results' },
                    e('p', null, 'No hay hechizos disponibles de este nivel para tu clase.'))
                : spells.map(spell => {
                    const selected = isSelected(spell, listKey);
                    const expanded = expandedId === `${listKey}_${spell.index}`;
                    // Bloquear si llegamos al máximo y este hechizo NO está seleccionado
                    const blocked = atMax && !selected;
                    return e('div', {
                        key: spell.index,
                        className: `cw-spell-item${selected ? ' on' : ''}${blocked ? ' cw-spell-blocked' : ''}`,
                    },
                        e('div', {
                            className: 'cw-spell-header',
                            onClick: () => setExpandedId(expanded ? null : `${listKey}_${spell.index}`),
                        },
                            e('input', {
                                type: 'checkbox',
                                checked: selected,
                                disabled: blocked,
                                onChange: ev => {
                                    ev.stopPropagation();
                                    toggleSpell(spell, listKey, limit);
                                },
                                onClick: ev => ev.stopPropagation(),
                            }),
                            e('div', { className: 'cw-spell-info' },
                                e('div', { className: 'cw-spell-name' }, spell.name),
                                e('div', { className: 'cw-spell-tags' },
                                    spell.school?.name,
                                    spell.range && ` · ${spell.range}`,
                                    spell.casting_time && ` · ${spell.casting_time}`
                                )
                            ),
                            e('span', { className: 'cw-spell-arrow' }, expanded ? '▼' : '▶')
                        ),
                        expanded && e('div', { className: 'cw-spell-detail' },
                            e('div', { className: 'cw-spell-desc' },
                                Array.isArray(spell.desc)
                                    ? spell.desc.join('\n\n')
                                    : (spell.desc || 'Sin descripción.'))
                        )
                    );
                })
        );
    }

    return e('div', { className: 'cw-step cw-step-spells' },
        e('div', { className: 'cw-step-header' },
            e('div', { className: 'cw-step-emoji' }, '✨'),
            e('h1', { className: 'cw-step-title' }, 'Hechizos'),
            e('p', { className: 'cw-step-subtitle' },
                `Elige los hechizos iniciales de tu ${cls.name}.`)
        ),

        // ── Cantrips ──
        cantrips.length > 0 && e('div', { className: 'cw-eq-section' },
            e('h2', { className: 'cw-eq-section-title' },
                `Trucos (Nivel 0)`,
                e('span', {
                    className: `cw-spells-counter${selectedCantrips.length >= limits.cantrips && limits.cantrips > 0 ? ' cw-spells-counter-full' : ''}`,
                },
                    selectedCantrips.length >= limits.cantrips && limits.cantrips > 0
                        ? ` — ✓ ${selectedCantrips.length}/${limits.cantrips} completo`
                        : ` — ${selectedCantrips.length}/${limits.cantrips} elegidos`)
            ),
            renderSpellList(cantrips, 'cantrips', limits.cantrips)
        ),

        // ── Nivel 1 ──
        lvl1.length > 0 && e('div', { className: 'cw-eq-section' },
            e('h2', { className: 'cw-eq-section-title' },
                `Nivel 1`,
                limits.known > 0 && e('span', {
                    className: `cw-spells-counter${selectedKnown.length >= limits.known ? ' cw-spells-counter-full' : ''}`,
                },
                    selectedKnown.length >= limits.known
                        ? ` — ✓ ${selectedKnown.length}/${limits.known} completo`
                        : ` — ${selectedKnown.length}/${limits.known} elegidos`)
            ),
            renderSpellList(lvl1, 'known', limits.known)
        ),

        e('div', { className: 'cw-eq-note' },
            '💡 ',
            e('span', null,
                'Las cantidades son sugerencias del SRD. Podrás añadir o quitar hechizos desde la hoja después.')
        )
    );
};

function cwValidateSpells(data, selections) {
    // Hechizos son opcionales — siempre válido
    return { valid: true };
}

function cwShouldSkipSpells(selections) {
    const classIndex = selections?.classChoice?.class?.index;
    return !CW_SPELLCASTING_CLASSES.has(classIndex);
}

// ============================================================
// CWStepSummary — Vista de ficha + botón Crear
// Props: { selections, onCreate, creating }
// ============================================================
const CWStepSummary = ({ selections, onCreate, creating }) => {
    const { useState } = React;
    const e = React.createElement;
    const [showAll, setShowAll] = useState(false);

    // Construir el personaje preview
    const char = (() => {
        try {
            return cwBuildCharacter(selections);
        } catch (err) {
            console.error('[CWStepSummary] Error armando preview', err);
            return null;
        }
    })();

    if (!char) {
        return e('div', { className: 'cw-step' },
            e('div', { className: 'cw-no-results' },
                e('p', null, 'No se pudo generar el resumen.'),
                e('p', { style: { fontSize: 12, opacity: .7 } },
                    'Verifica que hayas completado los pasos anteriores.')
            )
        );
    }

    const subraceName = char.subrace_data?.name || '';
    const subclassName = char.subclass_data?.name || '';

    const stats = char.stats;
    const subtitle = [
        char.race_data?.name,
        subraceName && `(${subraceName})`,
        '·', char.class_data?.name,
        subclassName && `(${subclassName})`,
        char.background_data?.name && `· ${char.background_data.name}`,
        `· Nivel ${char.level}`,
    ].filter(Boolean).join(' ');

    return e('div', { className: 'cw-step cw-step-summary' },
        e('div', { className: 'cw-step-header' },
            e('div', { className: 'cw-step-emoji' }, '🎉'),
            e('h1', { className: 'cw-step-title' }, '¡Listo!'),
            e('p', { className: 'cw-step-subtitle' },
                'Revisa el resumen antes de crear tu personaje.')
        ),

        // ── Avatar + nombre ──
        e('div', { className: 'cw-summary-hero' },
            char.avatar
                ? e('img', { className: 'cw-summary-avatar', src: char.avatar, alt: char.name })
                : e('div', { className: 'cw-summary-avatar-placeholder' }, '👤'),
            e('h2', { className: 'cw-summary-name' }, char.name),
            e('p', { className: 'cw-summary-subtitle' }, subtitle),
            char.alignment && e('p', { className: 'cw-summary-alignment' }, char.alignment)
        ),

        // ── Combate (3 boxes) ──
        e('div', { className: 'cw-summary-combat' },
            e('div', { className: 'cw-summary-box' },
                e('div', { className: 'cw-summary-box-val' }, char.hp),
                e('div', { className: 'cw-summary-box-lbl' }, 'PG')
            ),
            e('div', { className: 'cw-summary-box' },
                e('div', { className: 'cw-summary-box-val' }, char.ac),
                e('div', { className: 'cw-summary-box-lbl' }, 'CA')
            ),
            e('div', { className: 'cw-summary-box' },
                e('div', { className: 'cw-summary-box-val' },
                    `${char.initiative >= 0 ? '+' : ''}${char.initiative}`),
                e('div', { className: 'cw-summary-box-lbl' }, 'Iniciativa')
            ),
            e('div', { className: 'cw-summary-box' },
                e('div', { className: 'cw-summary-box-val' }, `${char.speed}'`),
                e('div', { className: 'cw-summary-box-lbl' }, 'Velocidad')
            )
        ),

        // ── 6 Stats ──
        e('div', { className: 'cw-summary-stats' },
            CW_ABILITIES.map(ab => {
                const val = stats[ab.key];
                const mod = cwAbilityMod(val);
                return e('div', { key: ab.key, className: 'cw-summary-stat' },
                    e('div', { className: 'cw-summary-stat-short' }, ab.short),
                    e('div', { className: 'cw-summary-stat-val' }, val),
                    e('div', { className: 'cw-summary-stat-mod' },
                        mod >= 0 ? `+${mod}` : mod)
                );
            })
        ),

        // ── Competencias ──
        char.proficiencies?.length > 0 && e('div', { className: 'cw-summary-section' },
            e('div', { className: 'cw-summary-section-label' }, 'Competencias'),
            e('div', { className: 'cw-summary-section-text' },
                char.proficiencies.join(' · '))
        ),

        // ── Rasgos ──
        char.features?.length > 0 && e('div', { className: 'cw-summary-section' },
            e('div', { className: 'cw-summary-section-label' },
                `Rasgos (${char.features.length})`),
            e('div', { className: 'cw-summary-section-text' },
                char.features.map(f => f.name).join(' · '))
        ),

        // ── Hechizos ──
        (char.spells?.cantrips?.length > 0 || char.spells?.known?.length > 0)
            && e('div', { className: 'cw-summary-section' },
                e('div', { className: 'cw-summary-section-label' }, 'Hechizos'),
                char.spells.cantrips.length > 0 && e('div', { className: 'cw-summary-section-text' },
                    e('strong', null, 'Trucos: '),
                    char.spells.cantrips.map(s => s.name).join(', ')),
                char.spells.known.length > 0 && e('div', {
                    className: 'cw-summary-section-text', style: { marginTop: 6 }
                },
                    e('strong', null, 'Nivel 1: '),
                    char.spells.known.map(s => s.name).join(', '))
            ),

        // ── Inventario ──
        char.inventory?.length > 0 && e('div', { className: 'cw-summary-section' },
            e('div', { className: 'cw-summary-section-label' },
                `Inventario (${char.inventory.length})`),
            e('div', { className: 'cw-summary-section-text' },
                char.inventory.map(it => it.name).join(' · '))
        ),

        // ── Botón crear ──
        e('button', {
            className: 'cw-summary-create-btn',
            disabled: creating,
            onClick: () => onCreate(char),
        }, creating ? 'Creando...' : '✓ Crear Personaje')
    );
};

// ── Exponer al global ────────────────────────────────────────
window.CWStepStats             = CWStepStats;
window.CWStepEquipment         = CWStepEquipment;
window.CWStepSpells            = CWStepSpells;
window.CWStepSummary           = CWStepSummary;
window.cwValidateStats         = cwValidateStats;
window.cwValidateEquipment     = cwValidateEquipment;
window.cwValidateSpells        = cwValidateSpells;
window.cwShouldSkipSpells      = cwShouldSkipSpells;
window.CW_SPELLCASTING_CLASSES = CW_SPELLCASTING_CLASSES;
window.CW_SPELLS_LIMITS_LV1    = CW_SPELLS_LIMITS_LV1;