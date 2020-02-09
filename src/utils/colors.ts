export function lightenColor(color: string, amt: number): string {
	color = color.slice(1);

	const num = parseInt(color, 16);

	let r = (num >> 16) + amt;
	if (r > 255) r = 255;
	else if  (r < 0) r = 0;

	let b = ((num >> 8) & 0x00FF) + amt;
	if (b > 255) b = 255;
	else if  (b < 0) b = 0;

	let g = (num & 0x0000FF) + amt;
	if (g > 255) g = 255;
	else if (g < 0) g = 0;

	return "#" + (g | (b << 8) | (r << 16)).toString(16);
};

// https://loading.io/color/random/, https://loading.io/color/feature/
export const palettes = [
	['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd'], // pastel
	['#adff2f', '#f08080', '#f0e68c', '#deb887', '#689bf9', '#ffb6c1', '#7fffd4'], // classic
	['#e6261f', '#eba532', '#f7d038', '#a3e048', '#49c7d0', '#4355db', '#d23be7'], // rainbow
	['#91d6bc', '#8ac8a6', '#85b991', '#80ab7d', '#7d9c6a', '#798d58', '#767e48'], // green
	['#fff995', '#ffdb77', '#e2bd5b', '#c29f3f', '#a38321', '#856800', '#684e00'], // brown
	['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494'], // misc
//	['#', '#', '#', '#', '#', '#', '#']
];
