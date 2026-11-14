// Copies the user guide from the vestige repository into guide/ and zh-cn/guide/.
//
//   node scripts/sync-docs.mjs                     the latest release on GitHub
//   node scripts/sync-docs.mjs --ref v0.8.0        a tag, branch or commit on GitHub
//   node scripts/sync-docs.mjs --source ../vestige a local checkout

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

const repository = "vestige-lixue/vestige";
const root = resolve(import.meta.dirname, "..");

const pages = [
    { lang: "en", file: "README", output: "guide/index.md", title: "User guide" },
    { lang: "en", file: "params", output: "guide/params.md", title: "Parameter reference" },
    { lang: "zh-cn", file: "README", output: "zh-cn/guide/index.md", title: "使用文档" },
    { lang: "zh-cn", file: "params", output: "zh-cn/guide/params.md", title: "参数说明" },
];

const { values } = parseArgs({
    options: {
        source: { type: "string" },
        ref: { type: "string" },
    },
});
if (values.source && values.ref) throw new Error("Pass either --source or --ref, not both.");

function githubHeaders() {
    const headers = { Accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    return headers;
}

async function latestReleaseTag() {
    // /releases/latest skips pre-releases; the list is newest first and includes them.
    const response = await fetch(`https://api.github.com/repos/${repository}/releases?per_page=1`, { headers: githubHeaders() });
    if (!response.ok) throw new Error(`Could not read the latest release: HTTP ${response.status}`);
    const [release] = await response.json();
    if (!release) throw new Error("The repository has no releases.");
    return release.tag_name;
}

async function readRemote(ref, name) {
    const url = `https://raw.githubusercontent.com/${repository}/${encodeURIComponent(ref)}/resources/docs/${name}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not download ${url}: HTTP ${response.status}`);
    return await response.text();
}

// The app resolves links between guide files by file name; the site serves them as pages.
function rewriteLinks(markdown, lang) {
    return markdown
        .replaceAll(`](README.${lang}.md`, "](./index.md")
        .replaceAll(`](params.${lang}.md`, "](./params.md");
}

function render(markdown, page) {
    const body = rewriteLinks(markdown.replace(/\r\n/g, "\n"), page.lang).trim();
    return `---\ntitle: ${page.title}\n---\n\n# ${page.title}\n\n${body}\n`;
}

let read;
let origin;
if (values.source) {
    const directory = resolve(values.source, "resources/docs");
    read = name => readFile(join(directory, name), "utf8");
    origin = directory;
}
else {
    const ref = values.ref ?? await latestReleaseTag();
    read = name => readRemote(ref, name);
    origin = `${repository}@${ref}`;
}

const contents = await Promise.all(pages.map(page => read(`${page.file}.${page.lang}.md`)));

await rm(join(root, "guide"), { recursive: true, force: true });
await rm(join(root, "zh-cn/guide"), { recursive: true, force: true });
for (const [index, page] of pages.entries()) {
    const output = join(root, page.output);
    await mkdir(resolve(output, ".."), { recursive: true });
    await writeFile(output, render(contents[index], page));
}

console.log(`Synced ${pages.length} pages from ${origin}.`);