const colorMap = {
	green: 2,
	red: 1,
	blue: 4
} as const

export const stain = (
	s: string, 
	color: keyof typeof colorMap
) => (
	`\x1b[3${colorMap[color]}m${s}\x1b[0m`
);
