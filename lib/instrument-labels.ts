export interface InstrumentLabels {
    metric1: string
    metric2: string
    metric3: string
    learned1: string
    learned2: string
    learned3: string
    emoji: string
}

export const INSTRUMENT_LABELS: Record<string, InstrumentLabels> = {
    "Piano": {
        metric1: "Mano Derecha",
        metric2: "Mano Izquierda",
        metric3: "Ambas Manos",
        learned1: "Der.",
        learned2: "Izq.",
        learned3: "Ambas",
        emoji: "🎹"
    },
    "Violín": {
        metric1: "Arco",
        metric2: "Digitación",
        metric3: "Ambos",
        learned1: "Arco",
        learned2: "Digit.",
        learned3: "Ambos",
        emoji: "🎻"
    },
    "Viola": {
        metric1: "Arco",
        metric2: "Digitación",
        metric3: "Ambos",
        learned1: "Arco",
        learned2: "Digit.",
        learned3: "Ambos",
        emoji: "🎻"
    },
    "Cello": {
        metric1: "Arco",
        metric2: "Digitación",
        metric3: "Ambos",
        learned1: "Arco",
        learned2: "Digit.",
        learned3: "Ambos",
        emoji: "🎻"
    },
    "Guitarra": {
        metric1: "Rasgueo",
        metric2: "Picking",
        metric3: "Ambos",
        learned1: "Rasg.",
        learned2: "Pick.",
        learned3: "Ambos",
        emoji: "🎸"
    },
    "Flauta": {
        metric1: "Técnica",
        metric2: "Articulación",
        metric3: "Ambas",
        learned1: "Técn.",
        learned2: "Artic.",
        learned3: "Ambas",
        emoji: "🪈"
    },
    "Voz": {
        metric1: "Técnica",
        metric2: "Expresión",
        metric3: "Ambas",
        learned1: "Técn.",
        learned2: "Expr.",
        learned3: "Ambas",
        emoji: "🎤"
    },
    "Genérico": {
        metric1: "Nivel 1",
        metric2: "Nivel 2",
        metric3: "Nivel 3",
        learned1: "Fase 1",
        learned2: "Fase 2",
        learned3: "Fase 3",
        emoji: "🎵"
    }
}

export const INSTRUMENT_OPTIONS = Object.keys(INSTRUMENT_LABELS)

export function getInstrumentLabels(instrument?: string | null): InstrumentLabels {
    return INSTRUMENT_LABELS[instrument || "Piano"] || INSTRUMENT_LABELS["Genérico"]
}
