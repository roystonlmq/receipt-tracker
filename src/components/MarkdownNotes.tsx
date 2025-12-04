import ReactMarkdown from "react-markdown";
import { highlightHashtagsClickable } from "@/utils/highlightHashtags";

interface MarkdownNotesProps {
	content: string;
	onHashtagClick?: (hashtag: string) => void;
}

export function MarkdownNotes({ content, onHashtagClick }: MarkdownNotesProps) {
	return (
		<div className="text-sm text-white/90 leading-relaxed">
			<ReactMarkdown
				components={{
				// Style bullet lists
				ul: ({ children }) => (
					<ul className="list-disc pl-6 ml-0 space-y-1 my-2 marker:text-white/70" style={{ listStyleType: 'disc' }}>
						{children}
					</ul>
				),
				// Style ordered lists
				ol: ({ children }) => (
					<ol className="list-decimal pl-6 ml-0 space-y-1 my-2 marker:text-white/70" style={{ listStyleType: 'decimal' }}>
						{children}
					</ol>
				),
				// Style list items
				li: ({ children }) => (
					<li className="text-white/90" style={{ display: 'list-item' }}>
						{onHashtagClick
							? highlightHashtagsClickable(String(children), onHashtagClick)
							: children}
					</li>
				),
				// Style paragraphs
				p: ({ children }) => (
					<p className="my-2">
						{onHashtagClick
							? highlightHashtagsClickable(String(children), onHashtagClick)
							: children}
					</p>
				),
				// Style bold text
				strong: ({ children }) => (
					<strong className="font-semibold text-white">{children}</strong>
				),
				// Style italic text
				em: ({ children }) => (
					<em className="italic text-white/80">{children}</em>
				),
				// Style code
				code: ({ children }) => (
					<code className="px-1.5 py-0.5 bg-white/10 rounded text-blue-300 text-xs font-mono">
						{children}
					</code>
				),
				// Style headings
				h1: ({ children }) => (
					<h1 className="text-xl font-bold text-white mt-4 mb-2">{children}</h1>
				),
				h2: ({ children }) => (
					<h2 className="text-lg font-semibold text-white mt-3 mb-2">
						{children}
					</h2>
				),
				h3: ({ children }) => (
					<h3 className="text-base font-semibold text-white mt-2 mb-1">
						{children}
					</h3>
				),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
