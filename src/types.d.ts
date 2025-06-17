type PublicPuzzle = {
	id: string;
	title: string;
	description: string;
	createdAt: Date;
	author: {
		name: string;
	};
	solutions: Array<{
		charCount: number;
		user: {
			name: string;
		};
	}>;
	votes: Array<{ id: string }>;
};
