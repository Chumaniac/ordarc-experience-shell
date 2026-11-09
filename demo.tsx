import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ProductHeader, ProductNavigation, ProductFooter } from "./src/index";
import "./src/styles.css";
import "./demo.css";
type Note = {
  id: string;
  title: string;
  kind: string;
  notes: string;
  at: string;
  versions: Array<{ notes: string; at: string }>;
};
const key = "ordarc.notes.v1";
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
    if (!raw) return { items: [], error: "" };
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
        "本机记录无法读取。原数据已保留，当前禁止覆盖保存。请检查浏览器存储。",
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
    [draft, setDraft] = useState<Note>(blank),
    [dirty, setDirty] = useState(false),
    [message, setMessage] = useState(initial.error),
    [query, setQuery] = useState("");
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
      setMessage("已保存到此浏览器。");
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "保存失败，可先导出当前草稿。",
      );
    }
  }
  async function importNote(file?: File) {
    try {
      if (!file) return;
      if (file.size > 500000) throw Error("请选择不超过500 KB的记录文件。");
      const d = JSON.parse(await file.text());
      if (d.version !== 1 || !valid(d.note))
        throw Error("记录文件格式不正确。");
      if (canLeave()) {
        setDraft({ ...d.note, id: crypto.randomUUID() });
        setDirty(true);
        setMessage("已载入导入草稿，检查后保存。");
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "导入失败。");
    }
  }
  return (
    <>
      <a className="skip-link" href="#content">
        跳到主要内容
      </a>
      <ProductHeader>
        <a className="brand" href="#content">
          Ordarc
        </a>
        <ProductNavigation>
          <a href="#records">记录</a>
          <a href="#help">使用说明</a>
        </ProductNavigation>
      </ProductHeader>
      <main id="content" tabIndex={-1}>
        <p className="eyebrow">个人记录</p>
        <h1>把观察和资料记在一起</h1>
        <p className="intro">
          整理研习笔记、问题和阅读备注。记录保存在此浏览器，可随时导出。
        </p>
        <div className="notes-layout">
          <aside id="records" className="notes-list" aria-label="本机记录">
            <div className="actions">
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
          </aside>
          <section className="note-editor" aria-label="编辑记录">
            <div className="editor-heading">
              <h2>{draft.title || "新记录"}</h2>
              <span>{dirty ? "尚未保存" : "已载入"}</span>
            </div>
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
                value={draft.kind}
                onChange={(e) => edit({ kind: e.target.value })}
              >
                <option>研习</option>
                <option>问事</option>
                <option>命盘</option>
              </select>
            </label>
            <label>
              记录正文
              <textarea
                rows={12}
                maxLength={20000}
                value={draft.notes}
                onChange={(e) => edit({ notes: e.target.value })}
                placeholder="写下资料来源、观察和下一步。"
              />
            </label>
            <p className="muted">
              {draft.notes.length.toLocaleString()} / 20,000 字符
            </p>
            <div className="actions">
              <button
                className="primary"
                onClick={save}
                disabled={!dirty || !!initial.error}
              >
                保存记录
              </button>
              <button
                onClick={() =>
                  download(
                    JSON.stringify({ version: 1, note: draft }, null, 2),
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
                    if (window.confirm("删除这条本机记录？建议先导出备份。")) {
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
        </div>
        <section id="help" className="help">
          <h2>使用说明</h2>
          <p>
            内容不上传。换浏览器前请导出；导入只载入草稿，保存前可检查。此工作台整理文字记录，不执行排盘或推断。
          </p>
        </section>
      </main>
      <ProductFooter name="Ordarc" description="个人记录工作台">
        <a href="#help">使用说明</a>
      </ProductFooter>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<Demo />);
