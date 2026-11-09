export type NoteSummary = {
  schema: "ordarc.note-summary/v1";
  sources: string[];
  observations: string[];
  nextSteps: string[];
  paragraphs: string[];
};
// Literal section grouping, with no inference or business calculation. Recomputed for every saved version.
export function summarizeNote(text: string): NoteSummary {
  if (typeof text !== "string" || text.length > 20000)
    throw Error("记录正文最多20,000字符。");
  const result: NoteSummary = {
    schema: "ordarc.note-summary/v1",
    sources: [],
    observations: [],
    nextSteps: [],
    paragraphs: [],
  };
  let section: keyof Omit<NoteSummary, "schema"> = "paragraphs";
  for (const paragraph of text.split(/\n\s*\n/).filter((p) => p.trim())) {
    for (const line of paragraph.split("\n").filter((p) => p.trim())) {
      const match = line.match(
        /^\s*(材料|资料来源|来源|问题|观察|结论|下一步|待办)\s*[:：]\s*(.*)$/,
      );
      if (match) {
        section = ["材料", "资料来源", "来源"].includes(match[1]!)
          ? "sources"
          : ["下一步", "待办"].includes(match[1]!)
            ? "nextSteps"
            : "observations";
        if (match[2]?.trim()) result[section].push(match[2].trim());
      } else result[section].push(line.trim());
    }
  }
  return result;
}
