import React, { useState, useRef } from "react";

const EXAMPLES = {
  dbml: `Table User {
  id uuid [pk]
  email varchar [unique, not null]
  name varchar
  status varchar
  created_at timestamp
}
Table Post {
  id uuid [pk]
  title varchar [not null]
  body text
  user_id uuid [ref: > User.id]
  created_at timestamp
}`,
  mermaid: `erDiagram
    USER ||--o{ POST : writes
    USER {
        uuid id PK
        string email
        string name
        string status
        datetime created_at
    }
    POST {
        uuid id PK
        uuid user_id FK
        string title
        text body
        datetime created_at
    }`,
};

export default function Tool() {
  const [mode, setMode] = useState("text");
  const [text, setText] = useState(EXAMPLES.dbml);
  const [format, setFormat] = useState("dbml");
  const [image, setImage] = useState(null); // { base64, media, dataUrl }
  const [spec, setSpec] = useState(null);
  const [html, setHtml] = useState("");
  const [status, setStatus] = useState("Ready when you are");
  const [live, setLive] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dlState, setDlState] = useState("idle");
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function loadExample(kind) {
    setText(EXAMPLES[kind]);
    setFormat(kind);
  }

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      setImage({
        base64: reader.result.split(",")[1],
        media: file.type || "image/png",
        dataUrl: reader.result,
      });
    };
    reader.readAsDataURL(file);
  }

  async function generate() {
    setError("");
    setBusy(true);
    let payload;
    if (mode === "text") {
      if (!text.trim()) { setError("Paste a schema first, or load an example."); setBusy(false); return; }
      payload = { kind: format, text };
    } else {
      if (!image) { setError("Drop or choose a screenshot first."); setBusy(false); return; }
      setStatus("Reading the diagram — this can take a moment");
      setLive(true);
      payload = { kind: "image", imageBase64: image.base64, mediaType: image.media };
    }
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Generation failed");
      setSpec(data.spec);
      setHtml(data.html);
      const names = data.spec.entities.map((e) => e.name);
      setStatus(`${names.length} ${names.length === 1 ? "entity" : "entities"} · ${names.join(", ")}`);
      setLive(true);
    } catch (err) {
      setError(err.message);
      setStatus("Ready when you are");
      setLive(false);
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    if (!spec) return;
    setDlState("prep");
    try {
      const res = await fetch("/api/download", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const zip = new window.JSZip();
      for (const [path, contents] of Object.entries(data.files)) zip.file(path, contents);
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dashboard-project.zip"; a.click();
      URL.revokeObjectURL(url);
      setDlState("done");
      setTimeout(() => setDlState("idle"), 1800);
    } catch (err) {
      setError(err.message);
      setDlState("idle");
    }
  }

  return (
    <div className="tool">
      <div className="tool-panel">
        <div className="seg">
          <div className={"seg-pill" + (mode === "image" ? " right" : "")} />
          <button className={"seg-btn" + (mode === "text" ? " on" : "")} onClick={() => setMode("text")}>Paste text</button>
          <button className={"seg-btn" + (mode === "image" ? " on" : "")} onClick={() => setMode("image")}>Upload screenshot</button>
        </div>

        <div className="mini-label">{mode === "text" ? "Schema · DBML or Mermaid" : "ERD screenshot"}</div>

        {mode === "text" ? (
          <>
            <textarea
              className="code"
              spellCheck={false}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your DBML or Mermaid ERD here..."
            />
            <div className="examples">
              Load an example&nbsp;&nbsp;
              <a onClick={() => loadExample("dbml")}>DBML</a> · <a onClick={() => loadExample("mermaid")}>Mermaid</a>
            </div>
          </>
        ) : (
          <div
            className={"drop" + (dragging ? " hover" : "")}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          >
            {image ? (
              <img src={image.dataUrl} alt="preview" />
            ) : (
              <>
                <div className="drop-ico">◇</div>
                <div className="drop-big">Drop an ERD screenshot</div>
                <div className="drop-sub">or click to browse · PNG, JPG</div>
                <div className="drop-sub">reads with a local vision model</div>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
          </div>
        )}

        <div className="tool-controls">
          {mode === "text" && (
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="auto">Auto-detect</option>
              <option value="dbml">DBML</option>
              <option value="mermaid">Mermaid</option>
            </select>
          )}
          <button className="gen" onClick={generate} disabled={busy}>
            {busy ? <><span className="spin" /> Generating</> : "Generate dashboard"}
          </button>
        </div>

        {error && <div className="tool-error">{error}</div>}
      </div>

      <div className="tool-stage">
        <div className="stage-bar">
          <div className="stage-status"><span className={"dot" + (live ? " live" : "")} />{status}</div>
          <button className="dl" onClick={download} disabled={!spec || dlState === "prep"}>
            {dlState === "prep" ? "⏳ Preparing" : dlState === "done" ? "✓ Downloaded" : "↓ Download project"}
          </button>
        </div>
        <div className="stage-screen">
          {html ? (
            <div className="frame-wrap show"><iframe title="preview" srcDoc={html} /></div>
          ) : (
            <div className="stage-empty">
              <div className="empty-glyph">◇</div>
              <div className="empty-title">Your dashboard appears here</div>
              <div className="empty-sub">Paste a schema or upload a screenshot, then generate to see a live, interactive preview.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
