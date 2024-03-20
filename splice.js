function Splice(toModify, spliceCode) {
	const lines = toModify.split('\n');
	const commandRegex = /^(insert|delete|replace)\s+(\d+)(?:\s+(\d+))?\s*(?:`{3}([\s\S]*?)`{3})?/gm;
	// this regex monstrosity is AI generated, may contain bugs

	const commands = [];
	const spliceCopy = JSON.parse(JSON.stringify(spliceCode));

	// Parse insert and replace commands
	while ((match = commandRegex.exec(spliceCopy)) !== null) {
		const [, type, start, end, block] = match;
		commands.push({
			type,
			start: +start,
			end: end ? +end : +start,
			block: block ? block.split('\n'): undefined,
		});
	}

	const overlappingRange = (a, b) => {
		return (a.start <= b.start && a.end >= b.start) || (b.start <= a.start && b.end >= a.start);
	}
	// console.log(commands);
	const ignored = [];
	const finalCommands = [];
	for (const c of commands) {
		if (c.start < 1)
			c.start = 1;
		let max = c.type === 'insert' ? lines.length + 1 : lines.length; // you can insert after the last line
		if (c.end > max)
			c.end = max;
		let end = c.end !== c.start ? " " + c.end : "";
		if (finalCommands.some((compare) => overlappingRange(c, compare))) {
			ignored.push(`Ignoring "${c.type} ${c.start}${end}": line range interferes with other command.`);
		}
		else if (c.start > c.end) {
			ignored.push(`Ignoring "${c.type} ${c.start}${end}": start line is greater than end line.`);
		}
		else if ((c.type === 'replace' || c.type === 'insert') && c.block == undefined) {
			ignored.push(`Ignoring "${c.type} ${c.start}${end}": codeblock is missing.`);
		}
		else {
			finalCommands.push(c);
		}
	}
	// this sorts the instructions in reverse order so line numbers don't change for the next instructions
	finalCommands.sort((a, b) => b.start - a.start);

	for (const command of finalCommands) {
		const { type, start, end, block } = command;
		switch (type) {
			case 'insert':
				lines.splice(start - 1, 0, ...block);
				break;
			case 'delete':
				lines.splice(start - 1, end - start + 1);
				break;
			case 'replace':
				lines.splice(start - 1, end - start + 1, ...block);
				break;
		}
	}
	const modified = lines.join('\n');
	return { modified, ignored };
}

// // example with a simple html file
// const toModify = `
// <!DOCTYPE html>
// <html>
// <head>
// 	<title>Document</title>
// 	<style> h1 {color: red;} </style>
// </head>
// <body>
// 	<h1>Hello, World!</h1>
// 	<p>This is a simple HTML file.</p>
// </body>
// </html>
// `;

// replace hello world with goodbye world
// delete the title tag
// insert a js script that prints hello world
// const spliceCode = `
// replace 8 9 \`\`\`\t<h1>Goodbye, World!</h1>\`\`\`
// delete 5 6
// insert 11 \`\`\`\t<script>
// \t\tconsole.log('Hello, World!');
// \t\tconsole.log('Hello, World again!');
// \t<\/script>\`\`\`
// `;
// const result = `
// <!DOCTYPE html>
// <html>
// <head>
// </head>
//         <h1>Goodbye, World!</h1>
//         <p>This is a simple HTML file.</p>
//         <script>console.log('Hello, World!');
//         console.log('Hello, World again!');
//         <\/script>
// </body>
// </html>
// `


// const { modified, ignored } = Splice(toModify, spliceCode);
// console.log('Modified:\n' + modified);
// console.log('Ignored:', ignored);
