const empty_page = `<style>body {background-color: black;</style>`
const generating_page = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Animated Ellipsis</title>
<style>
body {
    background-color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    overflow: hidden;
    color: white;
    font-family: Arial, sans-serif;
    font-size: 24px;
    flex-direction: column;
}

.helix-container {
    position: relative;
    width: 50vmin;
    height: 20vmin;
    transform-style: preserve-3d;
    animation: rotate 4s linear infinite;
}

@keyframes rotate {
    from { transform: rotateX(0deg); }
    to { transform: rotateX(360deg); }
}

.rung {
    position: absolute;
    top: 2.5vmin;
    width: 1px;
    height: 50px;
    background-color: white;
}

.evolving-text {
    display: flex;
    align-items: center;
}

.evolving-text::after {
    content: '';
    width: 36px;
    display: inline-block;
    text-align: left;
    animation: ellipsis 1s infinite;
}

@keyframes ellipsis {
    0%, 25% { content: ''; }
    26%, 50% { content: '.'; }
    51%, 75% { content: '..'; }
    76%, 100% { content: '...'; }
}
</style>
</head>
<body>
<div class="evolving-text">evolving</div>
<div class="helix-container"></div>

<script>
const helixContainer = document.querySelector('.helix-container');
const numRungs = 20;
const rungSpacing = 50 / numRungs;

for (let i = 0; i < numRungs; i++) {
    const rung = document.createElement('div');
    rung.classList.add('rung');
    rung.style.left = i * rungSpacing + "vmin";
    rung.style.transform = "rotateX(" + i * 180 / numRungs + "deg) translateZ(0)";
    helixContainer.appendChild(rung);
}
</script>
</body>
</html>
`

let systemPrompt = `
You are a creative genius AI that creates webpages with html, css, and javascript. Your goal is to make and modify original, creative works that conform to user requests.
Assume all user requests are for webpage code, even if not explicitly stated. Ensure the code is efficient and will not crash the browser, and fits nicely in the window. 
DO NOT CHAT AT ALL. Do not describe your code or include responses like "Sure, here's the code:". Only write a codeblock and nothing else. 
Besides the wrapping backticks, do not use three backticks \`\`\` inside the codeblocks, if you need them split them up like this: "\`" + "\`" + "\`". 
You can use any library or framework you like, but do not load any local resources. Do not use alert(), prompt(), or confirm() unless explicitly requested. 
When making games/animations/simulations, use delta time to avoid frame rate dependency.
This is extremely important to me, take a deep breath and good luck!`.trim();
let startPrompt = `Make a house plz.`;
let variationPrompt = ``;

let fullCodingPrompt = `
Respond to requests with a single codeblock \`\`\` // like this \`\`\`. The single codeblock should contain all the html, css, and javascript and be a complete, 
self-contained webpage, though you can use any library or framework you like. 
Example response: 
\`\`\`
<html>
<head>
<style>body { background-color: black; }</style>
</head>
</html>
\`\`\``.trim();
let splicePrompt = `
You will be given code with line numbers appended in front of each line. Respond to requests with a series of 'Splice' commands that splice into the code to make the requested changes.
Available Splice command syntaxes:
insert line_num \`\`\`// code to insert 
// here is a second line to insert \`\`\`
delete start_line_num end_line_num
replace start_line_num end_line_num \`\`\`// code to replace given line numbers with
// same syntax for replacing with multiple lines  \`\`\`

"insert" will add the given code at the given line number, pushing the existing code at that line and below down.
"delete" will remove the lines from start_line_num to end_line_num, inclusive.
"replace" will remove the lines from start_line_num to end_line_num, inclusive, and insert the given code at the start_line_num.

Separate commands with a newline, though newlines in codeblocks will be treated as part of the code.
Commands with line numbers that intersect with previous commands will be ignored, do not write commands that use the same line numbers or overlapping line numbers. 
DO NOT ADD LINE NUMBERS IN CODEBLOCKS, THEY ARE FOR INPUT REFERENCE ONLY.

Example input/response/result:
Code to modify:
\`\`\`
1: <!DOCTYPE html>
2: <html>
3: <head>
4: 	<title>Document</title>
5: 	<style> h1 {color: red;} </style>
6: </head>
7: <body>
8: 	<h1>Hello, World!</h1>
9: 	<p>This is a simple HTML file.</p>
10: </body>
11: </html>
\`\`\`

YOUR RESPONSE:
replace 8 9 \`\`\` <h1>Goodbye, World!</h1>\`\`\`
delete 5 6
insert 11 \`\`\` <script>
console.log('Hello, World!');
console.log('Hello, World again!');
<\/script>\`\`\`

Resulting code (do not output this part, it is just for reference):
\`\`\`
<!DOCTYPE html>
<html>
<head>
</head>
<h1>Goodbye, World!</h1>
<p>This is a simple HTML file.</p>
<script>console.log('Hello, World!');
console.log('Hello, World again!');
<\/script>
</body>
</html>
\`\`\`

Remember, only output the Splice commands, not the resulting code.`.trim();
