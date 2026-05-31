// ============================================================
// CHARACTER WIZARD — La Forja v15.0
// Orquestador principal del wizard de creación de personajes.
//
// Maneja:
//   - State central de selecciones
//   - Navegación entre los 9 pasos
//   - Stepper clickeable hacia atrás
//   - Modales de confirmación (Saltar, Cerrar)
//   - Auto-skip de StepSpells si la clase no es lanzadora
//   - Soporte light/dark mode (recibido como prop)
//
// Cargar DESPUÉS de: cwBuilder.js, cwSteps.js
// ============================================================

// ── Lista ordenada de pasos del wizard ───────────────────────
// Cada paso tiene: id, label corto (stepper), si requiere validación
const CW_STEPS = [
    { id: 'mode',       label: 'Modo',       skipInStepper: true  },
    { id: 'basics',     label: 'Básico',     skipInStepper: false },
    { id: 'class',      label: 'Clase',      skipInStepper: false },
    { id: 'species',    label: 'Especie',    skipInStepper: false },
    { id: 'background', label: 'Trasfondo',  skipInStepper: false },
    { id: 'stats',      label: 'Stats',      skipInStepper: false },
    { id: 'equipment',  label: 'Equipo',     skipInStepper: false },
    { id: 'spells',     label: 'Hechizos',   skipInStepper: false },
    { id: 'summary',    label: 'Resumen',    skipInStepper: false },
];

// ============================================================
// CWConfirmModal — Modal de confirmación reutilizable
// Props: { title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }
// ============================================================
const CWConfirmModal = ({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) => {
    const e = React.createElement;
    return e('div', {
        className: 'cw-modal-overlay',
        onClick: ev => { if (ev.target === ev.currentTarget) onCancel && onCancel(); },
    },
        e('div', { className: 'cw-modal' },
            e('h3', { className: 'cw-modal-title' }, title),
            e('p', { className: 'cw-modal-msg' }, message),
            e('div', { className: 'cw-modal-actions' },
                e('button', {
                    className: 'cw-modal-cancel',
                    onClick: onCancel,
                }, cancelLabel || 'Cancelar'),
                e('button', {
                    className: `cw-modal-confirm${danger ? ' cw-modal-confirm-danger' : ''}`,
                    onClick: onConfirm,
                }, confirmLabel || 'Confirmar')
            )
        )
    );
};

// ============================================================
// COMPONENTE PRINCIPAL — CharacterWizard
// Props: { darkMode, onComplete(char), onClose() }
// ============================================================
const CharacterWizard = ({ darkMode, onComplete, onClose }) => {
    const { useState, useMemo } = React;
    const e = React.createElement;

    // ── State central de selecciones ─────────────────────────
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [selections, setSelections] = useState({
        mode: null,
        basics: { name: '', avatar: null, alignment: null },
        classChoice: { class: null, subclass: null },
        speciesChoice: { species: null, subspecies: null },
        backgroundChoice: { background: null, ability_bonus_distribution: null },
        stats: { method: 'point_buy', base: { str:8, dex:8, con:8, int:8, wis:8, cha:8 }, bonusDistribution: {} },
        equipment: { choices: {} },
        spells: { cantrips: [], known: [] },
    });

    // ── Modales ──────────────────────────────────────────────
    const [showSkipConfirm, setShowSkipConfirm]   = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [validationError, setValidationError] = useState(null);

    const currentStep = CW_STEPS[currentStepIdx];

    // ── Pasos visibles en el stepper (sin el "modo") ─────────
    const visibleSteps = CW_STEPS.filter(s => !s.skipInStepper);
    const currentVisibleIdx = visibleSteps.findIndex(s => s.id === currentStep.id);

    // ── Auto-skip de pasos según contexto ────────────────────
    function shouldSkipStep(stepId) {
        // Hechizos: saltar si no es clase lanzadora
        if (stepId === 'spells') return cwShouldSkipSpells(selections);

        // Modo simple: saltar pasos automáticos
        if (selections.mode === 'simple') {
            if (stepId === 'background') return true;
            if (stepId === 'stats')      return true;
            if (stepId === 'equipment')  return true;
            if (stepId === 'spells')     return true;
        }
        return false;
    }

    // ── Auto-aplicar configuración para modo simple ──────────
    // Se llama al transicionar a Resumen en modo simple.
    // Arma trasfondo, stats, equipo y hechizos automáticamente.
    async function applySimpleAutoConfig(currentSelections) {
        const classIndex = currentSelections.classChoice?.class?.index;
        if (!classIndex) return currentSelections;

        const updated = { ...currentSelections };

        // ── 1. Trasfondo recomendado ─────────────────────────
        try {
            const bgIndex = CW_SIMPLE_BG_BY_CLASS[classIndex];
            if (bgIndex && !updated.backgroundChoice?.background) {
                const allBgs = (await DB.getSRD('srd_backgrounds')) || [];
                const bg = allBgs.find(b => b.index === bgIndex);
                if (bg) {
                    updated.backgroundChoice = { background: bg, ability_bonus_distribution: null };
                }
            }
        } catch (err) { console.warn('[Simple] no se pudo cargar trasfondo', err); }

        // ── 2. Stats: Standard Array auto-asignado ───────────
        const baseStats = cwSimpleStandardArray(classIndex);
        const bgStats = updated.backgroundChoice?.background?.ability_scores || [];
        const bonusDist = cwSimpleBonusDistribution(classIndex, bgStats);
        updated.stats = {
            method: 'manual',
            base: baseStats,
            bonusDistribution: bonusDist,
        };

        // ── 3. Equipo: opción A para cada elección ────────────
        const choices = {};
        const cls = updated.classChoice?.class;
        const clsOpts = cls?.starting_equipment_options || [];
        clsOpts.forEach((_, idx) => { choices[`class_${idx}`] = idx; });
        const bgOpts = updated.backgroundChoice?.background?.equipment_options || [];
        bgOpts.forEach((_, idx) => { choices[`bg_${idx}`] = idx; });
        updated.equipment = { choices };

        // ── 4. Hechizos: primeros N recomendados (si es lanzador) ──
        if (CW_SPELLCASTING_CLASSES.has(classIndex)) {
            const limits = CW_SPELLS_LIMITS_LV1[classIndex] || { cantrips: 0, known: 0 };
            try {
                const allSpells = (await DB.getSRD('srd_spells')) || [];
                const forClass = allSpells.filter(s =>
                    (s.classes || []).some(c => c.index === classIndex));
                forClass.sort((a,b) => (a.name||'').localeCompare(b.name||''));

                const cantrips = forClass.filter(s => s.level === 0)
                    .slice(0, limits.cantrips)
                    .map(s => ({ index: s.index, name: s.name }));
                const known = forClass.filter(s => s.level === 1)
                    .slice(0, limits.known)
                    .map(s => ({ index: s.index, name: s.name }));

                updated.spells = { cantrips, known };
            } catch (err) { console.warn('[Simple] no se pudo cargar hechizos', err); }
        }

        return updated;
    }

    // ── Navegación ───────────────────────────────────────────
    function goToStep(idx) {
        setValidationError(null);
        setCurrentStepIdx(idx);
    }

    async function nextStep() {
        const validation = validateCurrentStep();
        if (!validation.valid) {
            setValidationError(validation.error);
            return;
        }
        setValidationError(null);

        let nextIdx = currentStepIdx + 1;
        // Saltar pasos que deban saltarse (hechizos no-caster, modo simple)
        while (nextIdx < CW_STEPS.length && shouldSkipStep(CW_STEPS[nextIdx].id)) {
            nextIdx++;
        }
        if (nextIdx >= CW_STEPS.length) return;

        // Si vamos a Resumen en modo simple, auto-aplicar configuración
        const goingToSummary = CW_STEPS[nextIdx].id === 'summary';
        if (goingToSummary && selections.mode === 'simple') {
            const configured = await applySimpleAutoConfig(selections);
            setSelections(configured);
        }

        setCurrentStepIdx(nextIdx);
    }

    function prevStep() {
        setValidationError(null);
        let prevIdx = currentStepIdx - 1;
        while (prevIdx >= 0 && shouldSkipStep(CW_STEPS[prevIdx].id)) {
            prevIdx--;
        }
        if (prevIdx >= 0) {
            setCurrentStepIdx(prevIdx);
        }
    }

    // Stepper: solo permite click HACIA ATRÁS (a pasos ya visitados)
    function handleStepperClick(targetIdx) {
        // Convertir índice del stepper visible al índice real
        const targetStep = visibleSteps[targetIdx];
        const realIdx = CW_STEPS.findIndex(s => s.id === targetStep.id);
        if (realIdx < currentStepIdx) {
            goToStep(realIdx);
        }
    }

    // ── Validación del paso actual ───────────────────────────
    function validateCurrentStep() {
        switch (currentStep.id) {
            case 'basics':
                return cwValidateBasics(selections.basics);
            case 'class':
                return cwValidateClass(selections.classChoice);
            case 'species':
                return cwValidateSpecies(selections.speciesChoice);
            case 'background':
                return cwValidateBackground(selections.backgroundChoice);
            case 'stats':
                return cwValidateStats(selections.stats, selections);
            case 'equipment':
                return cwValidateEquipment(selections.equipment);
            case 'spells':
                return cwValidateSpells(selections.spells, selections);
            default:
                return { valid: true };
        }
    }

    // ── Updaters de cada paso (pasados como onChange a los Steps) ──
    function updateSelection(key, value) {
        setSelections(s => ({ ...s, [key]: value }));
        setValidationError(null);
    }

    // ── Saltar todo el wizard ────────────────────────────────
    function handleSkipWizard() {
        const skipped = cwBuildSkippedCharacter();
        onComplete && onComplete(skipped);
    }

    // ── Crear personaje final ────────────────────────────────
    async function handleCreate(char) {
        setCreating(true);
        try {
            await onComplete(char);
        } catch (err) {
            console.error('[Wizard] Error al crear:', err);
            setCreating(false);
        }
    }

    // ── Render del paso actual ───────────────────────────────
    function renderCurrentStep() {
        const id = currentStep.id;

        if (id === 'mode') {
            return e(CWStepMode, {
                onSelect: mode => {
                    setSelections(s => ({ ...s, mode }));
                    setCurrentStepIdx(1); // avanzar a Básico
                },
            });
        }
        if (id === 'basics') {
            return e(CWStepBasics, {
                data: selections.basics,
                onChange: v => updateSelection('basics', v),
            });
        }
        if (id === 'class') {
            return e(CWStepClass, {
                data: selections.classChoice,
                onChange: v => updateSelection('classChoice', v),
                mode: selections.mode,
            });
        }
        if (id === 'species') {
            return e(CWStepSpecies, {
                data: selections.speciesChoice,
                onChange: v => updateSelection('speciesChoice', v),
            });
        }
        if (id === 'background') {
            return e(CWStepBackground, {
                data: selections.backgroundChoice,
                onChange: v => updateSelection('backgroundChoice', v),
            });
        }
        if (id === 'stats') {
            return e(CWStepStats, {
                data: selections.stats,
                onChange: v => updateSelection('stats', v),
                selections,
            });
        }
        if (id === 'equipment') {
            return e(CWStepEquipment, {
                data: selections.equipment,
                onChange: v => updateSelection('equipment', v),
                selections,
            });
        }
        if (id === 'spells') {
            return e(CWStepSpells, {
                data: selections.spells,
                onChange: v => updateSelection('spells', v),
                selections,
            });
        }
        if (id === 'summary') {
            return e(CWStepSummary, {
                selections,
                creating,
                onCreate: handleCreate,
            });
        }
        return null;
    }

    // ── Detección si el step actual es el primero o último ───
    const isFirstStep = currentStepIdx === 0;
    const isModeStep = currentStep.id === 'mode';
    const isSummaryStep = currentStep.id === 'summary';

    const dm = darkMode ? 'cw-dark' : 'cw-light';

    return e('div', { className: `cw-wrap ${dm}` },

        // ── HEADER ─────────────────────────────────────────
        !isModeStep && e('div', { className: 'cw-header' },
            e('div', { className: 'cw-header-row' },
                e('button', {
                    className: 'cw-header-btn',
                    onClick: () => {
                        if (currentStepIdx === 1) {
                            // Volver a la selección de modo
                            setCurrentStepIdx(0);
                            setSelections(s => ({ ...s, mode: null }));
                        } else {
                            prevStep();
                        }
                    },
                    title: 'Atrás',
                }, '←'),

                e('div', { className: 'cw-header-title' },
                    e('span', { className: 'cw-header-icon' }, '🎲'),
                    'Nuevo Héroe',
                    selections.mode && e('span', { className: 'cw-header-mode' },
                        ` · ${selections.mode === 'simple' ? 'Simple' : 'Experto'}`)
                ),

                e('button', {
                    className: 'cw-header-btn cw-header-btn-skip',
                    onClick: () => setShowSkipConfirm(true),
                    title: 'Saltar wizard',
                }, '⏩'),

                e('button', {
                    className: 'cw-header-btn cw-header-btn-close',
                    onClick: () => setShowCloseConfirm(true),
                    title: 'Cerrar',
                }, '✕')
            ),

            // Stepper (puntitos)
            e('div', { className: 'cw-stepper' },
                visibleSteps.map((step, idx) => {
                    const realIdx = CW_STEPS.findIndex(s => s.id === step.id);
                    const isPast = realIdx < currentStepIdx;
                    const isCurrent = realIdx === currentStepIdx;
                    const isSkipped = shouldSkipStep(step.id);

                    return e('div', {
                        key: step.id,
                        className: `cw-step-dot${isPast ? ' cw-step-dot-past' : ''}${isCurrent ? ' cw-step-dot-current' : ''}${isSkipped ? ' cw-step-dot-skipped' : ''}`,
                        onClick: () => !isSkipped && isPast && handleStepperClick(idx),
                        title: step.label,
                    },
                        e('div', { className: 'cw-step-dot-num' },
                            isPast ? '✓' : (idx + 1)),
                        e('div', { className: 'cw-step-dot-label' }, step.label)
                    );
                })
            )
        ),

        // ── CONTENIDO DEL PASO ─────────────────────────────
        renderCurrentStep(),

        // ── ERROR DE VALIDACIÓN ────────────────────────────
        validationError && e('div', { className: 'cw-validation-error' },
            '⚠️ ', validationError),

        // ── FOOTER (botones Atrás/Siguiente) ───────────────
        !isModeStep && !isSummaryStep && e('div', { className: 'cw-footer' },
            e('button', {
                className: 'cw-btn cw-btn-secondary',
                disabled: isFirstStep,
                onClick: () => {
                    if (currentStepIdx === 1) {
                        setCurrentStepIdx(0);
                        setSelections(s => ({ ...s, mode: null }));
                    } else {
                        prevStep();
                    }
                },
            }, '← Atrás'),

            e('button', {
                className: 'cw-btn cw-btn-primary',
                onClick: nextStep,
            }, 'Siguiente →')
        ),

        // ── MODAL: Saltar wizard ───────────────────────────
        showSkipConfirm && e(CWConfirmModal, {
            title: '¿Saltar el asistente?',
            message: 'Se creará un personaje genérico (Humano Guerrero Nivel 1) que podrás editar manualmente desde la hoja. Perderás cualquier selección actual.',
            confirmLabel: 'Sí, saltar',
            cancelLabel: 'Continuar wizard',
            danger: true,
            onConfirm: () => {
                setShowSkipConfirm(false);
                handleSkipWizard();
            },
            onCancel: () => setShowSkipConfirm(false),
        }),

        // ── MODAL: Cerrar wizard ───────────────────────────
        showCloseConfirm && e(CWConfirmModal, {
            title: '¿Cerrar el asistente?',
            message: 'Perderás todas las selecciones realizadas hasta ahora. Esta acción no se puede deshacer.',
            confirmLabel: 'Sí, cerrar',
            cancelLabel: 'Continuar',
            danger: true,
            onConfirm: () => {
                setShowCloseConfirm(false);
                onClose && onClose();
            },
            onCancel: () => setShowCloseConfirm(false),
        })
    );
};

// ── Exponer al global ────────────────────────────────────────
window.CharacterWizard = CharacterWizard;
window.CWConfirmModal  = CWConfirmModal;
window.CW_STEPS        = CW_STEPS;