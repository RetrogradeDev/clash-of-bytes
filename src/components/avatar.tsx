import Image from "next/image";

export const Avatar = ({
	image,
	name,
	size,
}: {
	image?: string;
	name: string;
	size: number;
}) => {
	return (
		<>
			{image ? (
				<Image
					className={`rounded-full w-${size} h-${size}`}
					width={size * 2}
					height={size * 2}
					src={image}
					alt={name}
				/>
			) : (
				<div
					className={`w-${size} h-${size} bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center`}
				>
					<span className="text-2xl font-bold text-white">
						{name.charAt(0).toUpperCase()}
					</span>
				</div>
			)}
		</>
	);
};
