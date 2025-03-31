const getDatasetValue = (e: null|HTMLElement|React.MouseEvent, name: string): string|null => {
    let el = e instanceof HTMLElement ? e : null;
    if (!el) {
        const currentTarget = e && (e as React.MouseEvent).currentTarget;
        if (currentTarget instanceof HTMLElement) el = currentTarget;
    }
    while (el) {
        const value = el.dataset[name];
        if (value !== undefined) {
            return value;
        }
        el = el.parentElement;
    }
    return null;
}

export default getDatasetValue;