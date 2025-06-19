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
				setValues(out);
			}
		} catch (error) {
			setValues([props.value]);
		}
	}, [props.value]);

	useEffect(() => {
		// Prevent infinite loop
		if (values.length === 0) return;

		props.onChange(JSON.stringify(values));
	}, [values]);

	return (
		<div className="mt-[-30px]">
			<button
				className="ml-auto mb-4 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 h-10 w-18"
				onClick={() => {
					setValues([...values, ""]);
				}}
				type="button"
				title="Add another value"
				aria-label="Add another value"
			>
				+ Add
			</button>

			<ul>
				{values.map((value, index) => (
					<li key={index} className="flex gap-2">
						<TypedFunctionInput
							type={type}
							value={value}
							onChange={(value) => {
								const newValues = [...values];
								newValues[index] = value;
								setValues(newValues);
							}}
						/>
						<button
							className="flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 size-12"
							onClick={() => {
								if (values.length === 1) {
									setValues([""]);
									return;
								}
								setValues(values.filter((_, i) => i !== index));
							}}
							type="button"
							title="Remove this value"
						>
							<TrashIcon className="w-4 h-4" />
						</button>
					</li>
				))}
			</ul>
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
