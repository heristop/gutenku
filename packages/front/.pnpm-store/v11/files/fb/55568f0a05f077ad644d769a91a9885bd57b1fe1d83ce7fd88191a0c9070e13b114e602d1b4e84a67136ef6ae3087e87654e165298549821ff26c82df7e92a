const UNSAFE_CHARS_REGEXP = /[<>/\u2028\u2029]/g;
const ESCAPED_CHARS = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escapeUnsafeChars(unsafeChar) {
  return ESCAPED_CHARS[unsafeChar];
}
function serializeState(state) {
  if (state == null || Object.keys(state).length === 0)
    return null;
  try {
    return JSON.stringify(JSON.stringify(state || {})).replace(
      UNSAFE_CHARS_REGEXP,
      escapeUnsafeChars
    );
  } catch (error) {
    console.error("[SSG] On state serialization -", error, state);
    return null;
  }
}
function deserializeState(state) {
  try {
    return JSON.parse(state || "{}");
  } catch (error) {
    console.error("[SSG] On state deserialization -", error, state);
    return {};
  }
}

export { deserializeState as d, serializeState as s };
