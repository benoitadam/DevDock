export const updateUrlParams = (update: Record<string, string>) => {
	const queryParams = new URLSearchParams(window.location.search);
	let count = 0;
	for (const prop in update) {
		if (queryParams.get(prop) !== update[prop]) {
			queryParams.set(prop, update[prop]);
			count++;
		}
	}
	if (count > 0) {
		window.history.pushState(null, '', `?${queryParams}`);
	}
}

export const readUrlParams = () => {
	let match;
	const pl = /\+/g; // Regex for replacing addition symbol with a space
	const search = /([^&=]+)=?([^&]*)/g;
	const decode = (s: string) => decodeURIComponent(s.replace(pl, ' '));
	const query = window.location.search.substring(1);
	const urlParams: Record<string, string> = {};
	const urlParams2: Record<string, string> = {};
	while ((match = search.exec(query))) {
		const key = decode(match[1]);
		const value = decode(match[2]);
		urlParams[key.toLowerCase()] = value;
		urlParams2[key] = value;
	}
	return { ...urlParams, ...urlParams2 };
}
