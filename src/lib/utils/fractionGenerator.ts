// src/lib/utils/fractionGenerator.ts

// idea from https://github.com/lights0123/fractions
// folk: // https://github.com/binhsonnguyen/fractions

const superscript: Record<string, string> = {
	'0': '⁰',
	'1': '¹',
	'2': '²',
	'3': '³',
	'4': '⁴',
	'5': '⁵',
	'6': '⁶',
	'7': '⁷',
	'8': '⁸',
	'9': '⁹'
};

const subscript: Record<string, string> = {
	'0': '₀',
	'1': '₁',
	'2': '₂',
	'3': '₃',
	'4': '₄',
	'5': '₅',
	'6': '₆',
	'7': '₇',
	'8': '₈',
	'9': '₉'
};

const precomposedFractions: Record<string, string> = {
	'1/2': '½',
	'1/3': '⅓',
	'2/3': '⅔',
	'1/4': '¼',
	'3/4': '¾',
	'1/5': '⅕',
	'2/5': '⅖',
	'3/5': '⅗',
	'4/5': '⅘',
	'1/6': '⅙',
	'5/6': '⅚',
	'1/7': '⅐',
	'1/8': '⅛',
	'3/8': '⅜',
	'5/8': '⅝',
	'7/8': '⅞',
	'1/9': '⅑',
	'1/10': '⅒'
};

const fractionSlash = '⁄'; // Sử dụng ký tự gạch chéo phân số chuyên dụng

/**
 * Tạo một chuỗi ký tự phân số từ tử số và mẫu số.
 * Ưu tiên sử dụng các ký tự được soạn sẵn nếu có,
 * nếu không sẽ tự tạo bằng các ký tự superscript và subscript.
 *
 * @param numerator - Tử số.
 * @param denominator - Mẫu số.
 * @returns Một chuỗi ký tự phân số đã được định dạng.
 */
export function makeFraction(numerator: number | string, denominator: number | string): string {
	const numStr = String(numerator);
	const denStr = String(denominator);
	const key = `${numStr}/${denStr}`;

	// 1. Kiểm tra xem có ký tự phân số soạn sẵn không
	if (precomposedFractions[key]) {
		return precomposedFractions[key];
	}

	// 2. Nếu không, tự tạo phân số
	try {
		const numOut = numStr
			.split('')
			.map((char) => superscript[char] || char)
			.join('');
		const denOut = denStr
			.split('')
			.map((char) => subscript[char] || char)
			.join('');
		return `${numOut}${fractionSlash}${denOut}`;
	} catch (e) {
		// Nếu có lỗi (ví dụ: ký tự không hỗ trợ), quay về dạng đơn giản
		return key;
	}
}
