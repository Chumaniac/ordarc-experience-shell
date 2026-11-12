import { ProductBoundary } from "./src/index";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./src/styles.css";
import "./demo.css";
const brandMark = new URL("./src/ordarc.svg", import.meta.url).href;
import { summarizeNote } from "./demo-summary";
type Note = {
  id: string;
  title: string;
  kind: string;
  notes: string;
  at: string;
  versions: Array<{ notes: string; at: string }>;
};
const key = "ordarc.notes.v1";
// One note may contain 11 × 20,000 UTF-16 units, plus its summary and JSON escapes.
const maxImportBytes = 2 * 1024 * 1024;
const blank = (): Note => ({
  id: crypto.randomUUID(),
  title: "",
  kind: "研习",
  notes: "",
  at: new Date().toISOString(),
  versions: [],
});
function valid(v: unknown): v is Note {
  if (!v || typeof v !== "object") return false;
  const n = v as Note;
  return (
    typeof n.id === "string" &&
    n.id.length <= 64 &&
    typeof n.title === "string" &&
    n.title.length <= 100 &&
    ["研习", "问事", "命盘"].includes(n.kind) &&
    typeof n.notes === "string" &&
    n.notes.length <= 20000 &&
    typeof n.at === "string" &&
    Number.isFinite(Date.parse(n.at)) &&
    Array.isArray(n.versions) &&
    n.versions.length <= 10 &&
    n.versions.every(
      (r) =>
        r &&
        typeof r.notes === "string" &&
        r.notes.length <= 20000 &&
        typeof r.at === "string" &&
        Number.isFinite(Date.parse(r.at)),
    )
  );
}
function read(): { items: Note[]; error: string } {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return { items: [], error: "" };
    if (raw.length > 5000000) throw Error();
    const d = JSON.parse(raw);
    if (
      d.version !== 1 ||
      !Array.isArray(d.items) ||
      d.items.length > 50 ||
      !d.items.every(valid) ||
      new Set(d.items.map((n: Note) => n.id)).size !== d.items.length
    )
      throw Error();
    return { items: d.items, error: "" };
  } catch {
    return {
      items: [],
      error:
        "本机记录无法读取。原数据已保留，当前禁止覆盖保存。请先导出记录并检查工作区存储。",
    };
  }
}
function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function VersionComparison({ previous, current }: { previous: string; current: string }) {
  if (previous === current) return <p className="version-comparison">两份正文相同。</p>;
  const oldChars = Array.from(previous), newChars = Array.from(current);
  const limit = Math.min(oldChars.length, newChars.length);
  let start = 0, tail = 0;
  while (start < limit && oldChars[start] === newChars[start]) start++;
  while (tail < limit - start && oldChars[oldChars.length-1-tail] === newChars[newChars.length-1-tail]) tail++;
  const prefix = oldChars.slice(0,start).join("");
  const suffix = oldChars.slice(oldChars.length-tail).join("");
  return <div className="version-comparison">
    <section><h4>旧版本</h4><pre>{prefix}<del>{oldChars.slice(start,oldChars.length-tail).join("")}</del>{suffix}</pre></section>
    <section><h4>当前草稿</h4><pre>{prefix}<ins>{newChars.slice(start,newChars.length-tail).join("")}</ins>{suffix}</pre></section>
  </div>;
}

function Demo() {
  const [compared, setCompared] = useState<Note["versions"][number] | null>(null);
  const [initial] = useState(read),
    [items, setItems] = useState(initial.items),
    [draft, commitDraft] = useState<Note>(blank),
    [dirty, setDirty] = useState(false),
    [message, setMessage] = useState(initial.error),
    [query, setQuery] = useState(""),
    [compact, setCompact] = useState(false),
    [recordsExpanded, setRecordsExpanded] = useState(false),
    [inspectorExpanded, setInspectorExpanded] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const update = () => setCompact(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const importGeneration = useRef(0);
  function setDraft(next: Note) {
    importGeneration.current++;
    commitDraft(next);
  }
  const summary = summarizeNote(draft.notes);
  const canLeave = () =>
    !dirty || window.confirm("当前编辑尚未保存，放弃这些修改？");
  const edit = (patch: Partial<Note>) => {
    setDraft({ ...draft, ...patch });
    setDirty(true);
  };
  function loadExample() {
    if (!canLeave()) return;
    setDraft({ ...blank(), title: "一次阅读记录", notes: "材料：一篇关于时间安排的文章\n\n观察：上午适合处理需要连续思考的事。\n\n下一步：下周留出两段不安排会议的时间。" });
    setDirty(true);
    requestAnimationFrame(() => document.getElementById('record-title')?.focus());
  }
  function showInspector() {
    setInspectorExpanded(true);
    requestAnimationFrame(() => { const heading = document.getElementById('note-summary-heading'); heading?.focus(); heading?.scrollIntoView({ block: 'center' }); });
  }
  const open = (n: Note) => {
    if (canLeave()) {
      setDraft(structuredClone(n));
      setDirty(false);
      setMessage("已打开本机记录。");
      setRecordsExpanded(false);
      requestAnimationFrame(() => document.getElementById("record-title")?.focus());
    }
  };
  const persist = (next: Note[]) => {
    if (initial.error) throw Error(initial.error);
    const current = read();
    if (current.error) throw Error(current.error);
    if (JSON.stringify(current.items) !== JSON.stringify(items))
      throw Error("记录已在其他页面更改。请先导出当前草稿，再刷新页面。");
    const data = JSON.stringify({ version: 1, items: next });
    if (data.length > 5000000)
      throw Error("记录存储已达上限，请先导出并整理旧版本。");
    localStorage.setItem(key, data);
    setItems(next);
  };
  function save() {
    try {
      if (!draft.title.trim() || !draft.notes.trim())
        throw Error("请填写标题和正文。");
      if (items.length >= 50 && !items.some((n) => n.id === draft.id))
        throw Error("已保存50条，请先导出并整理记录。");
      const prev = items.find((n) => n.id === draft.id);
      const versions =
        prev && prev.notes !== draft.notes
          ? [...prev.versions, { notes: prev.notes, at: prev.at }].slice(-10)
          : draft.versions;
      const n = {
        ...draft,
        title: draft.title.trim(),
        at: new Date().toISOString(),
        versions,
      };
      persist([n, ...items.filter((x) => x.id !== n.id)]);
      setDraft(n);
      setDirty(false);
      setMessage("已保存到当前工作区。");
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "保存失败，可先导出当前草稿。",
      );
    }
  }
  useEffect(() => {
    const handleSave = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", handleSave);
    return () => window.removeEventListener("keydown", handleSave);
  });
  async function importNote(file?: File) {
    const generation = ++importGeneration.current;
    try {
      if (!file) return;
      if (file.size > maxImportBytes) throw Error("请选择不超过 2 MiB 的记录文件。");
      const text = await file.text();
      if (generation !== importGeneration.current) return;
      const d = JSON.parse(text);
      if (d.version !== 1 || !valid(d.note))
        throw Error("记录文件格式不正确。");
      if (canLeave()) {
        const n: Note = d.note;
        setDraft({id: crypto.randomUUID(), title: n.title, kind: n.kind, notes: n.notes,
          at: new Date(n.at).toISOString(), versions: n.versions.map(v => ({notes:v.notes, at:new Date(v.at).toISOString()}))});
        setDirty(true);
        setMessage("已载入导入草稿，检查后保存。");
      }
    } catch (e) {
      if (generation === importGeneration.current) setMessage(e instanceof Error ? e.message : "导入失败。");
    }
  }
  return (
    <>
      <a className="skip-link" href="#content">
        跳到主要内容
      </a>
      <div className="workspace-shell">
          <aside id="records" className="notes-list app-sidebar" aria-label="本机记录">
            <a className="app-brand" href="#content"><img src={brandMark} width="32" height="32" alt="" /><strong>Ordarc</strong></a>
            <p className="sidebar-label">工作区</p>
            <div className="actions sidebar-actions">
              <button
                onClick={() => {
                  if (canLeave()) {
                    setDraft(blank());
                    setDirty(false);
                  }
                }}
              >
                新建记录
              </button>
              <button onClick={loadExample}>填入示例</button>
            </div>
            <button className="records-toggle" type="button" hidden={!compact} aria-expanded={recordsExpanded} aria-controls="record-browser" onClick={() => setRecordsExpanded(!recordsExpanded)}>记录与搜索（{items.length}）</button>
            <div id="record-browser" className="record-browser" hidden={compact && !recordsExpanded}>
            <label>
              搜索记录
              <input
                value={query}
                maxLength={100}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="按标题或栏目查找"
              />
            </label>
            <p className="muted">{items.length} / 50 条记录</p>
            <div className="sidebar-records">
            {items
              .filter((n) => (n.title + n.kind).includes(query))
              .map((n) => (
                <button
                  className={
                    "record-item" + (n.id === draft.id ? " selected" : "")
                  }
                  key={n.id}
                  onClick={() => open(n)}
                >
                  <strong>{n.title}</strong>
                  <small>
                    {n.kind} · {new Date(n.at).toLocaleDateString("zh-CN")}
                  </small>
                </button>
              ))}
            {items.length > 0 && !items.some(n => (n.title + n.kind).includes(query)) ? <p className="muted">没有匹配的记录，请换个词或清空搜索。</p> : null}
            {!items.length ? (
              <p className="muted">还没有记录。从示例或一条新记录开始。</p>
            ) : null}
            </div>
            </div>
            <div className="sidebar-bottom"><a href="#help">使用说明</a><span>仅保存在当前工作区</span></div>
          </aside>
        <div className="workspace-main">
          <header className="workspace-bar"><span>个人记录</span><span className="workspace-status"><i aria-hidden="true" />本机工作区</span></header>
          <main id="content" tabIndex={-1}>

          <section className="note-purpose" aria-label="Ordarc 文字体验用途"><p><strong>把资料、观察和下一步留在同一份记录里。</strong>适合阅读、研习或回看一个具体问题。准备一段文字，得到本机记录、按标题分组的摘要和可对照的旧版本；无需账号，内容不上传。</p><p>这是 Ordarc 的文字整理体验。正式工作台另有命盘、问事与专业研习；此页不排盘、不推断，也不调用模型。</p></section>
          <details className="note-start-guide"><summary>第一次记录：从一份阅读示例开始</summary><ol><li><strong>先看一份完整输入</strong><p>示例把“材料、观察、下一步”分别写成段落。换成自己的内容前，可先看看它们怎样进入摘要。</p><button type="button" onClick={loadExample}>从阅读记录示例开始</button></li><li><strong>修改并保存</strong><p>填写标题与正文，再保存到当前浏览器。后续修改正文再保存，会保留被替换的版本。</p><button type="button" disabled={!dirty || !!initial.error} onClick={() => { save(); requestAnimationFrame(() => document.getElementById('note-status')?.focus()); }}>保存当前草稿</button></li><li><strong>回看依据或导出</strong><p>展开摘要、预览与旧版本。换设备或清理浏览器数据前，用 JSON 或 Markdown 带走自己的副本。</p><button type="button" onClick={showInspector}>查看摘要与旧版本</button></li></ol></details>
          <div className="note-desk"><section className="note-editor" aria-label="编辑记录">
            <div className="editor-heading">
              <h1 id="record-title" tabIndex={-1}>{draft.title || "新记录"}</h1>
              <span>{dirty ? "尚未保存" : items.some((item) => item.id === draft.id) ? "已保存" : "新建"}</span>
            </div>
            <div className="note-meta">
            <label>
              标题
              <input
                value={draft.title}
                maxLength={100}
                onChange={(e) => edit({ title: e.target.value })}
              />
            </label>
            <label>
              栏目
              <select
                aria-label="栏目"
                value={draft.kind}
                onChange={(e) => edit({ kind: e.target.value })}
              >
                <option>研习</option>
                <option>问事</option>
                <option>命盘</option>
              </select>
            </label>
            </div>
            <label>
              记录正文
              <textarea
                aria-label="记录正文"
                aria-describedby="note-length"
                rows={12}
                maxLength={20000}
                value={draft.notes}
                onChange={(e) => edit({ notes: e.target.value })}
                placeholder="写下资料来源、观察和下一步。"
              />
            </label>
            <p className="muted" id="note-length">
              {draft.notes.length.toLocaleString()} / 20,000 字符
            </p>
            <div className="actions editor-save-actions">
              <button
                className="primary"
                data-desktop-save="record"
                onClick={save}
                disabled={!dirty || !!initial.error}
              >
                保存记录
              </button>
              <button
                onClick={() =>
                  download(
                    JSON.stringify(
                      { version: 1, note: draft, summary },
                      null,
                      2,
                    ),
                    "ordarc-note.json",
                    "application/json",
                  )
                }
              >
                导出 JSON
              </button>
              <button
                onClick={() =>
                  download(
                    "# " +
                      draft.title +
                      "\n\n" +
                      draft.kind +
                      "\n\n" +
                      draft.notes,
                    "ordarc-note.md",
                    "text/markdown",
                  )
                }
              >
                导出 Markdown
              </button>
              <label className="import-button">
                导入记录
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => {
                    void importNote(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {items.some((n) => n.id === draft.id) ? (
                <button
                  onClick={() => {
                    if (window.confirm(dirty ? "删除这条本机记录并放弃未保存的编辑？" : "删除这条本机记录？建议先导出备份。")) {
                      try {
                        persist(items.filter((n) => n.id !== draft.id));
                        setDraft(blank());
                        setDirty(false);
                        setMessage("记录已删除。");
                      } catch (e) {
                        setMessage(String(e));
                      }
                    }
                  }}
                >
                  删除记录
                </button>
              ) : null}
            </div>
            <p id="note-status" tabIndex={-1} role="status">{message}</p>
            </section><div className="inspector-wrap"><button className="inspector-toggle" aria-label="摘要、预览与旧版本" aria-expanded={inspectorExpanded} aria-controls="note-inspector" type="button" onClick={() => setInspectorExpanded(!inspectorExpanded)}>摘要、预览与旧版本</button><aside id="note-inspector" className="note-inspector" hidden={compact && !inspectorExpanded} aria-label="记录依据与版本"><section className="structured-note" aria-label="结构化记录">
              <h3 id="note-summary-heading" tabIndex={-1}>记录摘要</h3>
              <p className="muted">
                按正文中的“材料、观察、下一步”分组，编辑正文后同步更新。
              </p>
              <div className="note-summary-grid">
                {(
                  [
                    { key: "sources", title: "资料来源" },
                    { key: "observations", title: "观察与问题" },
                    { key: "nextSteps", title: "下一步" },
                  ] as const
                ).map((group) => (
                  <article key={group.key}>
                    <h4>{group.title}</h4>
                    {summary[group.key].length ? (
                      <ul>
                        {summary[group.key].map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="muted">
                        尚未填写。可在正文中加入对应标题。
                      </p>
                    )}
                  </article>
                ))}
              </div>
              {summary.paragraphs.length ? (
                <article>
                  <h4>其他记录</h4>
                  {summary.paragraphs.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </article>
              ) : null}
            </section>
            <details>
              <summary>预览正文</summary>
              <article className="note-preview">
                {draft.notes || "正文为空。"}
              </article>
            </details>
            <details>
              <summary>已保存的旧版本（最近10次正文修改）</summary>
              {draft.versions.length ? (
                draft.versions.map((r, i) => (
                  <div className="revision" key={i}>
                    <span>{new Date(r.at).toLocaleString("zh-CN")}</span>
                    <button
                      onClick={() => {
                        if (canLeave()) edit({ notes: r.notes });
                      }}
                    >
                      载入为草稿
                    </button>
                    <button type="button" aria-expanded={compared === r}
                      onClick={() => setCompared(compared === r ? null : r)}>
                      {compared === r ? "收起对比" : "比较完整正文"}
                    </button>
                    {compared === r ? <VersionComparison previous={r.notes} current={draft.notes} /> : <p>{r.notes.slice(0, 120)}</p>}
                  </div>
                ))
              ) : (
                <p>首次保存后，再修改正文即可保留旧版本。</p>
              )}
            </details>
          </aside></div></div>
        <section id="help" className="help">
          <h2>使用说明</h2>
          <p>
            内容不上传。记录保存在当前应用或浏览器的工作区；换入口前请导出。导入先载入草稿，检查后再保存。此处整理文字记录，不执行排盘或推断。
          </p>
        </section>
          </main>
        </div>
      </div>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <ProductBoundary fallback={<main className="recovery-panel" role="alert"><h1>页面未能显示</h1><p>已保存的浏览器记录仍保留。重新载入可能丢失未保存的编辑；请先保留当前标签页，再决定是否继续。</p><button type="button" onClick={() => { if (window.confirm('重新载入页面？未保存的编辑可能丢失。')) window.location.reload(); }}>重新载入</button></main>}><Demo /></ProductBoundary>,
);
