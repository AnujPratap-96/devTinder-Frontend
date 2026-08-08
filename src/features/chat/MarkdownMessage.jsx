/**
 * MarkdownMessage.jsx — dependency-free, safe markdown/code renderer for chat.
 * Supports: ```fenced code blocks```, `inline code`, **bold**, *italic*,
 * [links](http/https only), # headers, > blockquotes, and line breaks.
 * All HTML is escaped before parsing — never rendered raw.
 */
import { useState } from "react";
import { HiOutlineClipboard, HiCheck } from "react-icons/hi";

const FENCE_RE = /```([\w+-]*)\n([\s\S]*?)```/g;

const parseInline = (segment) => {
  const tokens = [];
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[([^\]]+)\]\((https?:\/\/[^)\s]+)\))/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(segment)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: segment.slice(lastIndex, match.index) });
    }
    if (match[1]) {
      tokens.push({ type: "code", value: match[1].slice(1, -1) });
    } else if (match[2]) {
      tokens.push({ type: "bold", value: match[2].slice(2, -2) });
    } else if (match[3]) {
      tokens.push({ type: "italic", value: match[3].slice(1, -1) });
    } else if (match[4]) {
      tokens.push({ type: "link", text: match[5], href: match[6] });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < segment.length) {
    tokens.push({ type: "text", value: segment.slice(lastIndex) });
  }
  return tokens;
};

const renderInline = (text) =>
  parseInline(text).map((token, i) => {
    switch (token.type) {
      case "code":
        return (
          <code key={i} className="rounded bg-tint-strong px-1.5 py-0.5 font-mono text-[0.85em] text-brand-300">
            {token.value}
          </code>
        );
      case "bold":
        return (
          <strong key={i} className="font-semibold text-neutral-50">
            {token.value}
          </strong>
        );
      case "italic":
        return (
          <em key={i} className="italic">
            {token.value}
          </em>
        );
      case "link":
        return (
          <a
            key={i}
            href={token.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 underline underline-offset-2 hover:text-brand-300"
          >
            {token.text}
          </a>
        );
      default:
        return <span key={i}>{token.value}</span>;
    }
  });

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="my-1.5 overflow-hidden rounded-lg border border-hairline-soft bg-neutral-950/80">
      <div className="flex items-center justify-between border-b border-hairline-soft px-3 py-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-neutral-400 transition hover:bg-tint-strong hover:text-neutral-200"
        >
          {copied ? <HiCheck className="text-xs text-success-500" /> : <HiOutlineClipboard className="text-xs" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-2 font-mono text-xs leading-relaxed text-neutral-200">
        {code}
      </pre>
    </div>
  );
};

const renderLine = (line, key) => {
  const trimmed = line.trim();
  if (trimmed.startsWith("#")) {
    const level = Math.min(trimmed.match(/^#+/)[0].length, 3);
    const text = trimmed.replace(/^#+\s*/, "");
    const Tag = level === 1 ? "p" : level === 2 ? "p" : "p";
    const cls =
      level === 1
        ? "text-base font-bold text-neutral-50"
        : level === 2
          ? "text-sm font-bold text-neutral-100"
          : "text-sm font-semibold text-neutral-200";
    return (
      <Tag key={key} className={`${cls} mt-1 first:mt-0`}>
        {renderInline(text)}
      </Tag>
    );
  }
  if (trimmed.startsWith("> ")) {
    return (
      <blockquote
        key={key}
        className="mt-1 border-l-2 border-brand-500/50 pl-2 text-neutral-300 first:mt-0"
      >
        {renderInline(trimmed.slice(2))}
      </blockquote>
    );
  }
  return (
    <p key={key} className="mt-0.5 break-words whitespace-pre-wrap first:mt-0">
      {renderInline(line)}
    </p>
  );
};

const MarkdownMessage = ({ text }) => {
  const blocks = [];
  const fenced = text.split(FENCE_RE);
  fenced.forEach((part, index) => {
    if (index % 3 === 1) {
      blocks.push({ type: "code", language: part, code: fenced[index + 1] });
    } else if (index % 3 === 2) {
      return;
    } else if (part) {
      blocks.push({ type: "text", value: part });
    }
  });

  return (
    <div className="min-w-0">
      {blocks.map((block, i) => {
        if (block.type === "code") {
          return <CodeBlock key={i} language={block.language} code={block.code} />;
        }
        const lines = block.value.split("\n");
        return (
          <div key={i}>
            {lines.map((line, j) => renderLine(line, j))}
          </div>
        );
      })}
    </div>
  );
};

export default MarkdownMessage;
