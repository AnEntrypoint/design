

const SKILL_SLUG_LABELS = {
    transcribe: 'transcribe',
    summarize:  'summarize',
    translate:  'translate',
    extract:    'extract',
    classify:   'classify',
};

export function skillLabel(input) {
    if (input && typeof input === 'object') {
        if (input.shortName) return input.shortName;
        const n = input.name || '';
        return n.replace(/^gm:/, '').replace(/^software-development$/, 'software dev').replace(/-/g, ' ');
    }
    return SKILL_SLUG_LABELS[input] || input;
}
