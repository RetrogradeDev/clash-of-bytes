interface CardProps {
	children: React.ReactNode;
	className?: string;
}

export function Card({ children, className = "" }: CardProps) {
	return (
		<div
			className={`bg-gray-900/50 rounded-lg p-6 border border-gray-700 ${className}`}
		>
			{children}
		</div>
	);
}
