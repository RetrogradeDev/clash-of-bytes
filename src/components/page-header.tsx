interface PageHeaderProps {
	icon: string;
	title: string;
	description: string;
	gradient?: {
		from: string;
		to: string;
	};
}

export function PageHeader({
	icon,
	title,
	description,
	gradient = { from: "from-purple-500", to: "to-blue-500" },
}: PageHeaderProps) {
	return (
		<div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/20">
			<div className="text-center">
				<div
					className={`w-16 h-16 bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-full flex items-center justify-center mx-auto mb-4`}
				>
					<span className="text-2xl text-white">{icon}</span>
				</div>
				<h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
				<p className="text-purple-300">{description}</p>
			</div>
		</div>
	);
}
