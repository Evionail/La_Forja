// ============================================================
// LM FORMS — La Forja v14.9
// Componente LMItemForm dinámico que lee LM_FORM_CONFIG y
// renderiza el formulario apropiado según la categoría.
// Cargar DESPUÉS de lmFormConfig.js y ANTES de libraryManager.js
// (que es donde se usa el componente).
// ============================================================

// ── Cargador de opciones dinámicas (SRD + homebrew desde IndexedDB)
// Usado por campos con `dynamicOptions: 'feats' | 'proficiencies'`
async function lmLoadDynamicOptions(type) {
    if (type === 'feats') {
        let srd = [], brew = [];
        try { srd = (await DB.getSRD('srd_feats')) || []; } catch(e) {}
        try { brew = (await DB.getSetting('lm_brew_b_srd_feats')) || []; } catch(e) {}
        const all = [...srd, ...brew];
        // Ordenar alfabéticamente y construir options
        all.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return all.map(f => ({
            value: f.index,
            label: f.source === 'homebrew' ? `${f.name} ⚒` : f.name,
            _ref: { index: f.index, name: f.name },
        }));
    }

    if (type === 'proficiencies') {
        let srd = [], brew = [];
        try { srd = (await DB.getSRD('srd_proficiencies')) || []; } catch(e) {}
        try { brew = (await DB.getSetting('lm_brew_b_srd_proficiencies')) || []; } catch(e) {}
        const all = [...srd, ...brew];
        all.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return all.map(p => {
            const rawType = p.type || 'Otros';
            // Aplicar mapping si viene en inglés; si no, usar tal cual
            const groupLabel = (typeof LM_PROF_TYPE_MAP !== 'undefined' && LM_PROF_TYPE_MAP[rawType])
                || rawType;
            return {
                value: p.index,
                label: p.source === 'homebrew' ? `${p.name} ⚒` : p.name,
                group: groupLabel,
                _ref: { index: p.index, name: p.name },
            };
        });
    }

    return [];
}

const LMItemForm = ({ catId, editItem, onSave, onCancel, onToast }) => {
    const { useState, useMemo, useEffect } = React;
    const e = React.createElement;
    const isEdit = !!editItem;

    // Si catId es null, el usuario debe elegir el tipo primero
    const [selectedCat, setSelectedCat] = useState(catId);

    // Config actual (cambia si se selecciona del dropdown)
    const config = useMemo(() => {
        const key = (selectedCat || '').replace(/^b_/, '');
        return LM_FORM_CONFIG[key] || null;
    }, [selectedCat]);

    // Estado del formulario — inicial desde editItem (si edita) o vacío
    const initialData = useMemo(() => {
        if (!config) return {};
        if (isEdit && config.parseItem) return config.parseItem(editItem);
        return {};
    }, [config, isEdit, editItem]);

    const [data, setData] = useState(initialData);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // ── Opciones dinámicas (feats, proficiencies) ────────────
    // Almacena por tipo. Ej: { feats: [...], proficiencies: [...] }
    const [dynamicOpts, setDynamicOpts] = useState({});
    const [loadingDynamic, setLoadingDynamic] = useState(false);

    // Detecta qué tipos de dynamicOptions usa el config actual
    const dynamicTypesNeeded = useMemo(() => {
        if (!config) return [];
        const types = new Set();
        [...config.essential, ...config.advanced].forEach(f => {
            if (f.dynamicOptions) types.add(f.dynamicOptions);
        });
        return Array.from(types);
    }, [config]);

    // Reinicia data si cambia el tipo seleccionado
    useEffect(() => { setData(initialData); }, [selectedCat]);

    // Carga las opciones dinámicas cuando cambia el config
    useEffect(() => {
        if (dynamicTypesNeeded.length === 0) {
            setDynamicOpts({});
            return;
        }
        let cancelled = false;
        setLoadingDynamic(true);
        (async () => {
            const loaded = {};
            for (const t of dynamicTypesNeeded) {
                loaded[t] = await lmLoadDynamicOptions(t);
            }
            if (!cancelled) {
                setDynamicOpts(loaded);
                setLoadingDynamic(false);
            }
        })();
        return () => { cancelled = true; };
    }, [dynamicTypesNeeded.join(',')]);

    function setField(key, value) {
        setData(d => ({ ...d, [key]: value }));
    }

    // Resuelve las opciones de un campo: estáticas o dinámicas
    function resolveOptions(field) {
        if (field.dynamicOptions) {
            return dynamicOpts[field.dynamicOptions] || [];
        }
        return field.options || [];
    }

    // ── Render de cada tipo de campo ─────────────────────────
    function renderField(field) {
        const val = data[field.key];
        const opts = resolveOptions(field);
        const isLoading = field.dynamicOptions && loadingDynamic;

        switch (field.type) {
            case 'text':
                return e('input', {
                    className: 'lm-form-input',
                    type: 'text',
                    value: val || '',
                    placeholder: field.placeholder || '',
                    onChange: ev => setField(field.key, ev.target.value),
                });

            case 'number':
                return e('input', {
                    className: 'lm-form-input',
                    type: 'number',
                    value: val !== undefined ? val : '',
                    placeholder: field.placeholder || '',
                    onChange: ev => setField(field.key, ev.target.value),
                });

            case 'textarea':
                return e('textarea', {
                    className: 'lm-form-input',
                    value: val || '',
                    placeholder: field.placeholder || '',
                    rows: 5,
                    onChange: ev => setField(field.key, ev.target.value),
                });

            case 'select':
                if (isLoading) {
                    return e('div', { className: 'lm-form-input', style: { opacity: .55 } },
                        field.placeholder || 'Cargando...');
                }
                return e('select', {
                    className: 'lm-form-input',
                    value: val !== undefined && val !== null ? String(val) : '',
                    onChange: ev => {
                        const v = ev.target.value;
                        const allNumeric = opts.every(o => typeof o.value === 'number');
                        setField(field.key, allNumeric && v !== '' ? Number(v) : v);
                    },
                },
                    e('option', { value: '' }, '— Selecciona —'),
                    opts.map(opt => e('option', {
                        key: String(opt.value), value: String(opt.value)
                    }, opt.label))
                );

            case 'multiselect': {
                const arr = Array.isArray(val) ? val : [];
                if (isLoading) {
                    return e('div', { className: 'lm-form-input', style: { opacity: .55 } },
                        'Cargando opciones...');
                }
                return e('div', { className: 'lm-form-multi' },
                    opts.map(opt => {
                        const checked = arr.includes(opt.value);
                        return e('label', {
                            key: String(opt.value),
                            className: `lm-form-chip${checked ? ' on' : ''}`,
                            onClick: () => {
                                const next = checked
                                    ? arr.filter(v => v !== opt.value)
                                    : [...arr, opt.value];
                                setField(field.key, next);
                            }
                        }, opt.label);
                    })
                );
            }

            case 'multiselect_grouped': {
                const arr = Array.isArray(val) ? val : [];
                if (isLoading) {
                    return e('div', { className: 'lm-form-input', style: { opacity: .55 } },
                        'Cargando opciones...');
                }
                // Agrupar por opt.group
                const groups = {};
                opts.forEach(opt => {
                    const g = opt.group || 'Otros';
                    if (!groups[g]) groups[g] = [];
                    groups[g].push(opt);
                });
                // Orden de grupos: usar LM_PROF_GROUP_ORDER si existe, sino alfa
                const order = (typeof LM_PROF_GROUP_ORDER !== 'undefined')
                    ? LM_PROF_GROUP_ORDER : null;
                const groupNames = Object.keys(groups).sort((a, b) => {
                    if (!order) return a.localeCompare(b);
                    const ai = order.indexOf(a); const bi = order.indexOf(b);
                    if (ai === -1 && bi === -1) return a.localeCompare(b);
                    if (ai === -1) return 1;
                    if (bi === -1) return -1;
                    return ai - bi;
                });

                return e(LMGroupedMultiselect, {
                    groups, groupNames, selected: arr,
                    onToggle: (value) => {
                        const next = arr.includes(value)
                            ? arr.filter(v => v !== value)
                            : [...arr, value];
                        setField(field.key, next);
                    }
                });
            }

            case 'checkbox':
                return e('label', { className: 'lm-form-checkbox' },
                    e('input', {
                        type: 'checkbox',
                        checked: !!val,
                        onChange: ev => setField(field.key, ev.target.checked),
                    }),
                    e('span', null, field.label)
                );

            case 'group_check': {
                const arr = Array.isArray(val) ? val : [];
                return e('div', { className: 'lm-form-multi' },
                    field.options.map(opt => {
                        const checked = arr.includes(opt.value);
                        return e('label', {
                            key: String(opt.value),
                            className: `lm-form-chip${checked ? ' on' : ''}`,
                            onClick: () => {
                                const next = checked
                                    ? arr.filter(v => v !== opt.value)
                                    : [...arr, opt.value];
                                setField(field.key, next);
                            }
                        }, opt.label);
                    })
                );
            }

            default:
                return e('div', null, `[Campo no soportado: ${field.type}]`);
        }
    }

    function renderFieldRow(field) {
        if (field.type === 'checkbox') {
            return e('div', { key: field.key, className: 'lm-form-row' },
                renderField(field),
                field.note && e('div', { className: 'lm-form-note' }, field.note)
            );
        }
        return e('div', { key: field.key, className: 'lm-form-row' },
            e('label', { className: 'lm-form-label' },
                field.label,
                field.required && e('span', { style: { color: '#dc2626' } }, ' *')
            ),
            renderField(field),
            field.note && e('div', { className: 'lm-form-note' }, field.note)
        );
    }

    function handleSave() {
        if (!config) {
            onToast('⚠️ Selecciona un tipo de contenido primero');
            return;
        }
        const required = config.essential.filter(f => f.required);
        for (const f of required) {
            const v = data[f.key];
            if (!v || (typeof v === 'string' && !v.trim())) {
                onToast(`⚠️ El campo "${f.label}" es obligatorio`);
                return;
            }
        }

        // Pasar el contexto de dynamicOpts a buildItem para resolver refs
        const item = config.buildItem(data, isEdit, editItem, { dynamicOptions: dynamicOpts });
        const finalCatId = catId || ('b_' + selectedCat);
        onSave(item, finalCatId);
    }

    const showTypeDropdown = !catId;

    return e('div', { className: 'lm-content' },
        e('div', { className: 'lm-form-wrap' },

            showTypeDropdown && e('div', { className: 'lm-form-row' },
                e('label', { className: 'lm-form-label' },
                    '¿Qué quieres crear?', e('span', { style: { color: '#dc2626' } }, ' *')),
                e('select', {
                    className: 'lm-form-input',
                    value: selectedCat || '',
                    disabled: isEdit,
                    onChange: ev => setSelectedCat(ev.target.value),
                },
                    e('option', { value: '' }, '— Selecciona un tipo —'),
                    LM_FORM_CATEGORIES_ORDER.map(catKey => {
                        const cfg = LM_FORM_CONFIG[catKey];
                        return e('option', { key: catKey, value: catKey },
                            `${cfg.icon} ${cfg.label}`);
                    })
                )
            ),

            !showTypeDropdown && config && e('div', { className: 'lm-form-typelabel' },
                `${config.icon} Nuevo ${config.label.toLowerCase()}`
            ),

            !config && e('div', { className: 'lm-form-empty' },
                'Selecciona un tipo de contenido arriba para continuar.'),

            config && config.essential.map(renderFieldRow),

            config && config.advanced.length > 0 && e('div', { style: { marginTop: 14 } },
                e('button', {
                    className: 'lm-form-toggle',
                    onClick: () => setShowAdvanced(!showAdvanced),
                },
                    showAdvanced ? '▼ Ocultar más detalles' : `▶ Más detalles (${config.advanced.length} opciones)`
                ),
                showAdvanced && e('div', { style: { marginTop: 10 } },
                    config.advanced.map(renderFieldRow)
                )
            ),

            e('div', { className: 'lm-form-actions' },
                e('button', { className: 'lm-form-cancel lm-editbtn', onClick: onCancel }, 'Cancelar'),
                e('button', {
                    className: 'lm-form-save',
                    disabled: !config,
                    style: !config ? { opacity: .4, cursor: 'not-allowed' } : {},
                    onClick: handleSave,
                }, isEdit ? 'Guardar cambios' : '+ Crear')
            )
        )
    );
};

// ── Subcomponente: Multiselect Agrupado ──────────────────────
// Cada grupo es un acordeón colapsable. Por defecto cerrados.
const LMGroupedMultiselect = ({ groups, groupNames, selected, onToggle }) => {
    const { useState } = React;
    const e = React.createElement;
    const [openGroups, setOpenGroups] = useState({});

    function toggleGroup(name) {
        setOpenGroups(o => ({ ...o, [name]: !o[name] }));
    }

    // Contar seleccionados por grupo
    const countSelectedInGroup = (groupName) => {
        const items = groups[groupName] || [];
        return items.filter(o => selected.includes(o.value)).length;
    };

    return e('div', { className: 'lm-form-grouped' },
        groupNames.map(name => {
            const opts = groups[name] || [];
            const isOpen = !!openGroups[name];
            const selCount = countSelectedInGroup(name);
            return e('div', { key: name, className: 'lm-group' },
                e('button', {
                    className: 'lm-group-header',
                    onClick: () => toggleGroup(name),
                },
                    e('span', null, isOpen ? '▼' : '▶', ' ', name, ` (${opts.length})`),
                    selCount > 0 && e('span', { className: 'lm-group-count' }, selCount)
                ),
                isOpen && e('div', { className: 'lm-form-multi', style: { marginTop: 6 } },
                    opts.map(opt => {
                        const checked = selected.includes(opt.value);
                        return e('label', {
                            key: String(opt.value),
                            className: `lm-form-chip${checked ? ' on' : ''}`,
                            onClick: () => onToggle(opt.value),
                        }, opt.label);
                    })
                )
            );
        })
    );
};