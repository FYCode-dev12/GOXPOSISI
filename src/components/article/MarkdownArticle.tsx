import ReactMarkdown from "react-markdown";

export function MarkdownArticle({ content }: { content: string }) {
  return <ReactMarkdown>{content}</ReactMarkdown>;
}
