import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

const THEME = {
  bg: "#1E1E1E",
  sidebarBg: "#252526",
  titleBar: "#323233",
  lineNumber: "#858585",
  lineNumberActive: "#C6C6C6",
  gutterBorder: "#3F3F46",
  keyword: "#C586C0",
  string: "#CE9178",
  number: "#B5CEA8",
  comment: "#6A9955",
  function: "#DCDCAA",
  operator: "#D4D4D4",
  variable: "#9CDCFE",
  default: "#D4D4D4",
  cursor: "#AEAFAD",
  activeLine: "rgba(255,255,255,0.08)",
};

export interface CodeLine {
  text: string;
  indent?: number;
  pause?: number;  // frames to pause BEFORE this line
  hold?: number;   // frames to hold AFTER this line completes
  speed?: number;  // frames per character (default: 2)
}

export interface TerminalLine {
  text: string;
  color?: string;
  prompt?: boolean; // show > prefix
}

interface CodeEditorProps {
  lines: CodeLine[];
  visibleLineCount?: number;
  terminalLines?: TerminalLine[];
  terminalVisible?: boolean;
  terminalLineCount?: number;
  title?: string;
  language?: string;
  fontSize?: number;
  showLineNumbers?: boolean;
  highlightLine?: number;
  horizontalPadding?: number;
}

const KEYWORDS = new Set([
  "def","class","if","else","elif","for","while","return",
  "import","from","as","True","False","None","and","or",
  "not","in","is","pass","break","continue","try","except",
  "finally","with","lambda","global","nonlocal","yield",
]);
const FUNCTIONS = new Set([
  "print","len","type","input","int","str","float",
  "range","list","dict","set","tuple","bool",
]);

function tokenize(line: string): { text: string; color: string }[] {
  const tokens: { text: string; color: string }[] = [];
  let i = 0;
  const n = line.length;
  while (i < n) {
    const ch = line[i];
    if (ch === "#") {
      tokens.push({ text: line.slice(i), color: THEME.comment });
      break;
    }
    if (ch === '"' || ch === "'") {
      const q = ch;
      let j = i + 1;
      while (j < n && line[j] !== q) j++;
      j++;
      tokens.push({ text: line.slice(i, j), color: THEME.string });
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < n && /[0-9_.]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), color: THEME.number });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < n && /[a-zA-Z0-9_]/.test(line[j])) j++;
      const w = line.slice(i, j);
      let c = THEME.variable;
      if (KEYWORDS.has(w)) c = THEME.keyword;
      else if (FUNCTIONS.has(w)) c = THEME.function;
      tokens.push({ text: w, color: c });
      i = j;
      continue;
    }
    if (i + 1 < n && ["==","!=",">=","<=","//","**","+=","-=","*=","/=","->"].includes(line.slice(i, i + 2))) {
      tokens.push({ text: line.slice(i, i + 2), color: THEME.operator });
      i += 2;
      continue;
    }
    tokens.push({ text: ch, color: THEME.operator });
    i++;
  }
  return tokens;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  lines,
  visibleLineCount,
  terminalLines = [],
  terminalVisible = false,
  terminalLineCount,
  title = "main.py",
  language = "Python",
  fontSize = 28,
  showLineNumbers = true,
  highlightLine,
  horizontalPadding = 20,
}) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const visCount = visibleLineCount ?? lines.length;

  // Build absolute timing for ALL lines
  const timings: { start: number; charEnd: number; end: number }[] = [];
  let acc = 0;
  for (const line of lines) {
    const pause = line.pause ?? 10;
    const speed = line.speed ?? 2;
    const hold = line.hold ?? 12;
    const charCount = Math.max(1, line.text.length);
    const start = acc + pause;
    const charEnd = start + charCount * speed;
    const end = charEnd + hold;
    timings.push({ start, charEnd, end });
    acc = end;
  }

  // Determine current typing state
  let activeLine = -1;
  let activeChar = 0;
  for (let i = 0; i < visCount; i++) {
    const t = timings[i];
    if (frame >= t.start && frame < t.charEnd) {
      activeLine = i;
      const speed = lines[i].speed ?? 2;
      const elapsed = frame - t.start;
      activeChar = Math.min(Math.floor(elapsed / speed), lines[i].text.length);
      break;
    }
  }

  // Cursor blink — natural ~2Hz, block cursor like VS Code
  const blinkPhase = frame % 30;
  const cursorVisible = blinkPhase < 18;

  // Where is the cursor?
  const cursorLine = activeLine >= 0 ? activeLine : Math.min(visCount, lines.length) - 1;
  const cursorCol = activeLine >= 0
    ? activeChar
    : lines[cursorLine]?.text.length ?? 0;

  // Terminal typing animation
  const termVisibleCount = terminalLineCount ?? (terminalVisible ? terminalLines.length : 0);

  // ─── Responsive layout ────────────────────────────────
  // Fixed chrome: title bar (42) + status bar (30). Editor gets everything else.
  const titleBarH = 42;
  const statusH = 30;
  const editorH = Math.max(200, height - titleBarH - statusH);

  // Line height auto-fits so all visible lines are on screen (no cropping).
  const gutterW = showLineNumbers ? 60 : 0;
  const lineHeight = Math.max(30, Math.min(46, Math.floor(editorH / Math.max(1, visCount))));
  const effFontSize = Math.min(fontSize, Math.floor(lineHeight * 0.82));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: THEME.bg,
        fontFamily: "'Cascadia Code','JetBrains Mono','Fira Code','Consolas',monospace",
        overflow: "hidden",
      }}
    >
      {/* ─── Title Bar ─────────────────────────────── */}
      <div
        style={{
          height: titleBarH,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          backgroundColor: THEME.titleBar,
          flexShrink: 0,
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <div style={{ display: "flex", gap: 7, marginRight: 20 }}>
          {["#E06C75","#E5C07B","#98C379"].map(c => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: c }} />
          ))}
        </div>
        <span style={{ color: "#CCCCCC", fontSize: 13 }}>{title}</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: "#6D6D6D", fontSize: 12 }}>{language}</span>
      </div>

      {/* ─── Editor Area (fills all remaining space) ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", height: editorH, position: "relative" }}>
        {/* Gutter */}
        {showLineNumbers && (
          <div
            style={{
              width: gutterW,
              flexShrink: 0,
              backgroundColor: THEME.sidebarBg,
              borderRight: `1px solid ${THEME.gutterBorder}`,
              paddingTop: 12,
            }}
          >
            {lines.slice(0, visCount).map((_, i) => (
              <div
                key={i}
                style={{
                  height: lineHeight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 12,
                  color: i === cursorLine ? THEME.lineNumberActive : THEME.lineNumber,
                  fontSize: effFontSize * 0.55,
                  fontFamily: "inherit",
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {/* Code body */}
        <div style={{ flex: 1, padding: `12px ${horizontalPadding}px`, position: "relative" }}>
          {lines.slice(0, visCount).map((line, li) => {
            const isCurrentlyTyping = li === activeLine;
            const typedLen = isCurrentlyTyping
              ? activeChar
              : (frame >= (timings[li]?.charEnd ?? Infinity) ? line.text.length : 0);
            const visibleText = line.text.slice(0, typedLen);
            const indentStr = "    ".repeat(line.indent || 0);
            const isHL = highlightLine === li;
            const isCurLine = li === cursorLine;

            return (
              <div
                key={li}
                style={{
                  height: lineHeight,
                  display: "flex",
                  alignItems: "center",
                  marginLeft: -12,
                  paddingLeft: 12,
                  backgroundColor: isHL
                    ? "rgba(59,130,246,0.12)"
                    : isCurLine
                    ? THEME.activeLine
                    : "transparent",
                  borderLeft: isHL ? "3px solid #3B82F6" : "3px solid transparent",
                }}
              >
                <div style={{ whiteSpace: "pre", fontSize: effFontSize, lineHeight: 1.15, color: THEME.default }}>
                  {indentStr}
                  {tokenize(visibleText).map((t, ti) => (
                    <span key={ti} style={{ color: t.color }}>{t.text}</span>
                  ))}
                  {isCurLine && cursorVisible && (
                    <span
                      style={{
                        display: "inline-block",
                        width: Math.max(5, effFontSize * 0.62),
                        height: effFontSize * 0.88,
                        backgroundColor: THEME.cursor,
                        opacity: 0.9,
                        marginLeft: 1,
                        verticalAlign: "middle",
                        boxShadow: "0 0 0 rgba(0,0,0,0)",
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Floating Terminal (overlay — never steals editor space) ── */}
        {terminalVisible && termVisibleCount > 0 && (
          <div
            style={{
              position: "absolute",
              right: 16,
              bottom: 16,
              width: 520,
              maxWidth: "60%",
              backgroundColor: "rgba(12,12,12,0.94)",
              borderRadius: 8,
              border: "1px solid #333",
              boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
              overflow: "hidden",
              zIndex: 60,
            }}
          >
            {/* Terminal tabs */}
            <div
              style={{
                height: 34,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                backgroundColor: "#1F1F1F",
                borderBottom: "1px solid #333",
                gap: 16,
              }}
            >
              <span style={{ color: "#FFFFFF", fontSize: 12, fontWeight: 600, paddingBottom: 5, borderBottom: "1px solid #007ACC", display: "block" }}>
                TERMINAL
              </span>
              <span style={{ color: "#999", fontSize: 12, paddingBottom: 5 }}>OUTPUT</span>
              <span style={{ color: "#999", fontSize: 12, paddingBottom: 5 }}>PROBLEMS</span>
            </div>

            {/* Terminal content */}
            <div style={{ padding: "10px 14px", fontFamily: "Consolas, monospace", fontSize: Math.min(17, effFontSize * 0.6) }}>
              {terminalLines.slice(0, termVisibleCount).map((tl, i) => (
                <div key={i} style={{ height: 30, display: "flex", alignItems: "center", lineHeight: 1.2 }}>
                  {tl.prompt && (
                    <span style={{ color: "#6A9955", marginRight: 6 }}>&gt;</span>
                  )}
                  <span style={{ color: tl.color ?? "#CCCCCC" }}>{tl.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Status Bar ────────────────────────────── */}
      <div
        style={{
          height: statusH,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          backgroundColor: "#007ACC",
          fontSize: 12,
          color: "#FFFFFF",
          flexShrink: 0,
          gap: 16,
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <span>Ln {cursorLine + 1}, Col {cursorCol}</span>
        <span style={{ opacity: 0.8 }}>Spaces: 4</span>
        <div style={{ flex: 1 }} />
        <span style={{ opacity: 0.9 }}>UTF-8</span>
        <span>{language}</span>
      </div>
    </div>
  );
};