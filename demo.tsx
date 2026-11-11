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
function Demo() {
  const [initial] = useState(read),
    [items, setItems] = useState(initial.items),
    [draft, commitDraft] = useState<Note>(blank),
    [dirty, setDirty] = useState(false),
    [message, setMessage] = useState(initial.error),
    [query, setQuery] = useState(""),
    [compact, setCompact] = useState(false),
    [recordsExpanded, setRecordsExpanded] = useState(false);
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
  const open = (n: Note) => {
    if (canLeave()) {
      setDraft(structuredClone(n));
      setDirty(false);
      setMessage("已打开本机记录。");
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
      if (file.size > maxImportBytes) throw Error("请选择不超过 2 MiB的记录文件。");
      const text = await file.text();
      if (generation !== importGeneration.current) return;
      const d = JSON.parse(text);
      if (d.version !== 1 || !valid(d.note))
        throw Error("记录文件格式不正确。");
      if (canLeave()) {
        const n = d.note;
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
              <button
                onClick={() => {
                  if (canLeave()) {
                    setDraft({
                      ...blank(),
                      title: "一次阅读记录",
                      notes:
                        "材料：一篇关于时间安排的文章\n\n观察：上午适合处理需要连续思考的事。\n\n下一步：下周留出两段不安排会议的时间。",
                    });
                    setDirty(true);
                  }
                }}
              >
                填入示例
              </button>
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

          <section className="note-editor" aria-label="编辑记录">
            <div className="editor-heading">
              <h1>{draft.title || "新记录"}</h1>
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
            <div className="actions">
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
            <p role="status">{message}</p>
            <section className="structured-note" aria-label="结构化记录">
              <h3>记录摘要</h3>
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
                    <p>{r.notes.slice(0, 120)}</p>
                  </div>
                ))
              ) : (
                <p>首次保存后，再修改正文即可保留旧版本。</p>
              )}
            </details>
          </section>
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
createRoot(document.getElementById("root")!).render(<Demo />);
