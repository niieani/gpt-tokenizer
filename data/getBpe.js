const path = require("path");
const fs = require("fs");
const { dictZip, range } = require("../utils");

const bpe_file = fs.readFileSync(path.join(__dirname, "./vocab.bpe"), "utf-8");
const lines = bpe_file.split("\n");

const bpe_merges = lines.slice(1, lines.length - 1).map((x) =>
  x
    .split(/(\s+)/)
    .filter((e) => e.trim().length > 0)
    .join(","),
);

const bpe_ranks = dictZip(bpe_merges, range(0, bpe_merges.length));

fs.writeFileSync(
  path.join(__dirname, "./bpe_ranks.json"),
  JSON.stringify(bpe_ranks),
);
