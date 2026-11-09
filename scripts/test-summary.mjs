import assert from "node:assert/strict";
import { summarizeNote } from "../demo-summary.ts";
const result = summarizeNote(
  "材料：合成阅读材料\n\n观察：保留原话\n补充观察\n\n下一步：周五核对",
);
assert.deepEqual(result.sources, ["合成阅读材料"]);
assert.deepEqual(result.observations, ["保留原话", "补充观察"]);
assert.deepEqual(result.nextSteps, ["周五核对"]);
assert.deepEqual(summarizeNote("<script>literal</script>").paragraphs, [
  "<script>literal</script>",
]);
assert.deepEqual(summarizeNote("").nextSteps, []);
assert.throws(() => summarizeNote("a".repeat(20001)));
assert.equal(
  summarizeNote("下一步：修改后的任务").nextSteps[0],
  "修改后的任务",
);
console.log(
  "PASS: literal note section grouping, edit recomputation, empty input and capacity",
);
