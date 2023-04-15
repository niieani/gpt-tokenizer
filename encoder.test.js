const {
  decode,
  encode,
  isWithinTokenLimit,
  decodeGenerator,
  decodeAsyncGenerator,
} = require("./encoder");

test("empty string", () => {
  const str = "";
  expect(encode(str)).toEqual([]);
  expect(decode(encode(str))).toEqual(str);
  expect(isWithinTokenLimit(str, 0)).toEqual(0);
  expect(isWithinTokenLimit(str, 3)).toEqual(0);
});

test("space", () => {
  const str = " ";
  expect(encode(str)).toEqual([220]);
  expect(decode(encode(str))).toEqual(str);
  expect(isWithinTokenLimit(str, 3)).toEqual(1);
  expect(isWithinTokenLimit(str, 0)).toEqual(false);
});

test("tab", () => {
  const str = "\t";
  expect(encode(str)).toEqual([197]);
  expect(decode(encode(str))).toEqual(str);
});

test("simple text", () => {
  const str = "This is some text";
  expect(encode(str)).toEqual([1212, 318, 617, 2420]);
  expect(decode(encode(str))).toEqual(str);
  expect(isWithinTokenLimit(str, 3)).toEqual(false);
  expect(isWithinTokenLimit(str, 5)).toEqual(4);
});

test("multi-token word", () => {
  const str = "indivisible";
  expect(encode(str)).toEqual([521, 452, 12843]);
  expect(decode(encode(str))).toEqual(str);
  expect(isWithinTokenLimit(str, 3)).toEqual(3);
});

const helloWorldTokens = [31373, 50169, 233, 995, 12520, 234, 235];

test("emojis", () => {
  const str = "hello 👋 world 🌍";
  expect(encode(str)).toEqual(helloWorldTokens);
  expect(decode(encode(str))).toEqual(str);
  expect(isWithinTokenLimit(str, 4)).toEqual(false);
  expect(isWithinTokenLimit(str, 400)).toEqual(7);
});

test("decode token-by-token via generator", () => {
  const generator = decodeGenerator(helloWorldTokens);
  expect(generator.next().value).toEqual("hello");
  expect(generator.next().value).toEqual(" ");
  expect(generator.next().value).toEqual("👋");
  expect(generator.next().value).toEqual(" world");
  expect(generator.next().value).toEqual(" ");
  expect(generator.next().value).toEqual("🌍");
});

async function* getHelloWorldTokensAsync() {
  for (const token of helloWorldTokens) {
    yield await Promise.resolve(token);
  }
}

test("decode token-by-token via async generator", async () => {
  const generator = decodeAsyncGenerator(getHelloWorldTokensAsync());
  const decoded = ["hello", " ", "👋", " world", " ", "🌍"];
  for await (const value of generator) {
    expect(value).toEqual(decoded.shift());
  }
});

test("properties of Object", () => {
  const str = "toString constructor hasOwnProperty valueOf";

  expect(encode(str)).toEqual([
    1462, 10100, 23772, 468, 23858, 21746, 1988, 5189,
  ]);
  expect(decode(encode(str))).toEqual(str);
});

test("text with commas", () => {
  const str = "hello, I am a text, and I have commas. a,b,c";
  expect(decode(encode(str))).toEqual(str);
  expect(encode(str)).toStrictEqual([
    31373, 11, 314, 716, 257, 2420, 11, 290, 314, 423, 725, 292, 13, 257, 11,
    65, 11, 66,
  ]);
  expect(isWithinTokenLimit(str, 15)).toEqual(false);
  expect(isWithinTokenLimit(str, 300)).toEqual(18);
});
