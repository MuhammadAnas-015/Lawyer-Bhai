// Shared markdown renderer used by FloatingChat, InlineChat, DocsTab, LegalGuideTab

const inlineFormat = (text) => {
  const parts = [];
  const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0, match, k = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={k++}>{text.slice(last, match.index)}</span>);
    const raw = match[0];
    if (raw.startsWith("***")) parts.push(<strong key={k++}><em>{raw.slice(3, -3)}</em></strong>);
    else if (raw.startsWith("**")) parts.push(<strong key={k++} style={{ color: "#111827" }}>{raw.slice(2, -2)}</strong>);
    else if (raw.startsWith("*")) parts.push(<em key={k++}>{raw.slice(1, -1)}</em>);
    else parts.push(<code key={k++} style={{ background: "#F3F4F6", padding: "1px 5px", borderRadius: 4, fontSize: "0.9em", fontFamily: "monospace" }}>{raw.slice(1, -1)}</code>);
    last = match.index + raw.length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return parts.length === 0 ? text : parts;
};

export const renderMd = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      if (elements.length > 0) elements.push(<div key={key++} style={{ height: 6 }} />);
      continue;
    }
    const h2 = line.match(/^##\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);
    if (h2) { elements.push(<div key={key++} style={{ fontWeight: 800, fontSize: 13, color: "#0E7A45", marginTop: 8, marginBottom: 2 }}>{inlineFormat(h2[1])}</div>); continue; }
    if (h3) { elements.push(<div key={key++} style={{ fontWeight: 700, fontSize: 12, color: "#1F2937", marginTop: 6, marginBottom: 1 }}>{inlineFormat(h3[1])}</div>); continue; }
    const numMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      elements.push(
        <div key={key++} style={{ display: "flex", gap: 7, marginBottom: 3 }}>
          <span style={{ color: "#0E7A45", fontWeight: 800, minWidth: 18, flexShrink: 0, fontSize: 12 }}>{numMatch[1]}.</span>
          <span style={{ flex: 1 }}>{inlineFormat(numMatch[2])}</span>
        </div>
      );
      continue;
    }
    const bulletMatch = line.match(/^[-*•]\s+(.+)/);
    if (bulletMatch) {
      elements.push(
        <div key={key++} style={{ display: "flex", gap: 7, marginBottom: 3 }}>
          <span style={{ color: "#0E7A45", fontWeight: 800, flexShrink: 0, lineHeight: 1.5 }}>•</span>
          <span style={{ flex: 1 }}>{inlineFormat(bulletMatch[1])}</span>
        </div>
      );
      continue;
    }
    elements.push(<div key={key++} style={{ marginBottom: 2 }}>{inlineFormat(line)}</div>);
  }
  return elements;
};
