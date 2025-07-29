import { TrashIcon } from "lucide-react";
import { useState, useEffect } from "react";

function ArrayInput(props: {
	type: "string" | "number" | "boolean";
	value: string;
	onChange: (value: string) => void;
}) {
	const { type } = props;

	let [values, setValues] = useState<string[]>([]);

	// Try to parse the string into an array
	useEffect(() => {
		try {
			const out = JSON.parse(props.value);

			if (Array.isArray(out)) {
				console.log("Parsed array:", out);

				// Make sure the array contains nothing but strings, bools or numbers
				if (
					!out.every((item) => {
						return (
							typeof item === "string" ||
							typeof item === "number" ||
							typeof item === "boolean"
						);
					})
				) {
					setValues(out[0]);
					throw new Error("Invalid array format");
				}

				setValues(out as string[]);
			}
		} catch (error) {
			setValues([props.value]);
		}
	}, [props.value]);

	useEffect(() => {
		// Prevent infinite loop
		if (values.length === 0) return;

		// Convert array to string format that preserves original types
		const newStringValue =
			type === "string"
				? `[${values.map((v) => `"${v}"`).join(", ")}]`
				: `[${values
						.map((v) => (type === "number" ? Number(v) : v))
						.join(", ")}]`;
		if (newStringValue !== props.value) {
			console.log("Updating string value:", newStringValue, "from", values);
			props.onChange(newStringValue);
		}
	}, [values]);

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<label className="text-sm text-white/70 font-medium">Array Items</label>
				<button
					className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30"
					onClick={() => {
						setValues([...values, ""]);

						props.onChange(
							`[${[...values, ""]
								.map((v) => (type === "string" ? `"${v}"` : v))
								.join(", ")}]`,
						);
					}}
					type="button"
					title="Add another value"
					aria-label="Add another value"
				>
					+ Add Item
				</button>
			</div>

			<div className="border border-white/20 rounded-lg p-3 bg-white/5">
				{values.length === 0 ? (
					<div className="text-center py-6 text-white/50">
						<p>No items in array</p>
						<button
							className="mt-2 text-sm text-purple-400 hover:text-purple-300"
							onClick={() => setValues([""])}
							type="button"
						>
							Add first item
						</button>
					</div>
				) : (
					<div className="space-y-2">
						{values.map((value, index) => (
							<div key={index} className="flex items-center gap-2">
								<span className="text-xs text-white/50 font-mono w-6">
									{index}
								</span>
								<div className="flex-1">
									<TypedFunctionInput
										type={type}
										value={value}
										onChange={(value) => {
											const newValues = [...values];
											newValues[index] = value;
											setValues(newValues);
										}}
									/>
								</div>
								<button
									className="flex items-center justify-center rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 size-8"
									onClick={() => {
										if (values.length === 1) {
											setValues([]);
											return;
										}
										setValues(values.filter((_, i) => i !== index));
									}}
									type="button"
									title="Remove this value"
								>
									<TrashIcon className="w-3 h-3" />
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export function TypedFunctionInput(props: {
	type: InputOutputFormat;
	value: string;
	onChange: (value: string) => void;
}) {
	const { type } = props;

	switch (type) {
		case "string":
			return (
				<input
					type="text"
					className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
					value={props.value}
					onChange={(e) => props.onChange(e.target.value)}
				/>
			);
		case "number":
			return (
				<input
					type="number"
					className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
					value={props.value}
					onChange={(e) => props.onChange(e.target.value)}
				/>
			);
		case "boolean":
			return (
				<select
					value={props.value}
					onChange={(e) => props.onChange(e.target.value)}
					className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
				>
					<option value="true">True</option>
					<option value="false">False</option>
				</select>
			);
		case "string[]":
			return (
				<ArrayInput
					type="string"
					value={props.value}
					onChange={props.onChange}
				/>
			);
		case "number[]":
			return (
				<ArrayInput
					type="number"
					value={props.value}
					onChange={props.onChange}
				/>
			);
		case "boolean[]":
			return (
				<ArrayInput
					type="boolean"
					value={props.value}
					onChange={props.onChange}
				/>
			);
		default:
			return null;
	}
}
