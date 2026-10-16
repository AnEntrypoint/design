export function die(errorOrMessage) {
    console.error(errorOrMessage instanceof Error ? errorOrMessage.message : errorOrMessage);
    process.exit(1);
}

export function orDie(work) {
    try {
        return work();
    } catch (error) {
        return die(error);
    }
}
