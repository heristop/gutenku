import module$1 from 'node:module';
import { isBoolean, format, escapeHtml, friendlyJSONstringify, isString, isNumber } from '@intlify/shared';
import { parse } from 'acorn';
import * as messageCompiler from '@intlify/message-compiler';
import { LOCATION_STUB, detectHtmlTag, baseCompile } from '@intlify/message-compiler';
import { SourceMapGenerator, SourceMapConsumer } from 'source-map-js';
import { parseJSON, getStaticJSONValue, traverseNodes } from 'jsonc-eslint-parser';
import { transform } from 'esbuild';
import { parseYAML, getStaticYAMLValue, traverseNodes as traverseNodes$1 } from 'yaml-eslint-parser';

const _require = module$1.createRequire(import.meta.url);
function checkInstallPackage(pkg, debug) {
  let installedVueI18n = false;
  try {
    debug(`vue-i18n load path: ${_require.resolve("vue-i18n")}`);
    installedVueI18n = true;
  } catch (e) {
    debug(`cannot find 'vue-i18n'`, e);
  }
  let installedPetiteVueI18n = false;
  try {
    debug(`petite-vue-i18n load path: ${_require.resolve("petite-vue-i18n")}`);
    installedPetiteVueI18n = true;
  } catch (e) {
    debug(`cannot find 'petite-vue-i18n'`, e);
  }
  if (installedVueI18n) {
    return "vue-i18n";
  }
  if (installedPetiteVueI18n) {
    return "petite-vue-i18n";
  }
  throw new Error(
    `${pkg} requires 'vue-i18n' or 'petite-vue-i18n' to be present in the dependency tree.`
  );
}
function getVueI18nVersion(debug, pkg = "vue-i18n") {
  const VueI18n = loadModule(pkg, debug);
  if (VueI18n == null) {
    return "";
  }
  if (VueI18n.VERSION && VueI18n.VERSION.startsWith("9.")) {
    return "9";
  }
  if (VueI18n.VERSION && VueI18n.VERSION.startsWith("10.")) {
    return "10";
  }
  return "unknown";
}
function loadModule(moduleName, debug) {
  try {
    return _require(moduleName);
  } catch (e) {
    debug(`cannot load '${moduleName}'`, e);
    return null;
  }
}

function createCodeGenerator(options = {
  filename: "bundle.json",
  sourceMap: false,
  env: "development",
  forceStringify: false
}) {
  const { sourceMap, source, filename } = options;
  const _context = Object.assign(
    {
      code: "",
      column: 1,
      line: 1,
      offset: 0,
      map: void 0,
      indentLevel: 0
    },
    options
  );
  const context = () => _context;
  function push(code, node, name) {
    _context.code += code;
    if (_context.map && node) {
      if (node.loc && node.loc !== LOCATION_STUB) {
        addMapping(node.loc.start, name);
      }
      advancePositionWithSource(_context, code);
    }
  }
  function _newline(n) {
    push("\n" + `  `.repeat(n));
  }
  function indent(withNewLine = true) {
    const level = ++_context.indentLevel;
    withNewLine && _newline(level);
  }
  function deindent(withNewLine = true) {
    const level = --_context.indentLevel;
    withNewLine && _newline(level);
  }
  function newline() {
    _newline(_context.indentLevel);
  }
  function pushline(code, node, name) {
    push(code, node, name);
    newline();
  }
  function addMapping(loc, name) {
    _context.map.addMapping({
      name,
      source: _context.filename,
      original: {
        line: loc.line,
        column: loc.column - 1
      },
      generated: {
        line: _context.line,
        column: _context.column - 1
      }
    });
  }
  if (sourceMap && source) {
    _context.map = new SourceMapGenerator();
    _context.map.setSourceContent(filename, source);
  }
  return {
    context,
    push,
    indent,
    deindent,
    newline,
    pushline
  };
}
function advancePositionWithSource(pos, source, numberOfCharacters = source.length) {
  if (pos.offset == null) {
    return pos;
  }
  let linesCount = 0;
  let lastNewLinePos = -1;
  for (let i = 0; i < numberOfCharacters; i++) {
    if (source.charCodeAt(i) === 10) {
      linesCount++;
      lastNewLinePos = i;
    }
  }
  pos.offset += numberOfCharacters;
  pos.line += linesCount;
  pos.column = lastNewLinePos === -1 ? pos.column + numberOfCharacters : numberOfCharacters - lastNewLinePos;
  return pos;
}
const DETECT_MESSAGE = `Detected HTML in '{msg}' message.`;
const ON_ERROR_NOOP = () => {
};
function parsePath(path) {
  return path ? path.join(".") : "";
}
const COMPILE_ERROR_MESSAGES = messageCompiler.errorMessages;
function getCompileErrorMessage(err) {
  if (err.message !== String(err.code)) {
    return err.message;
  }
  const text = COMPILE_ERROR_MESSAGES?.[err.code];
  return text ? text.replace(/:\s*\\?'?\{\d+\}'?/g, "") : err.message;
}
function generateMessageFunction(msg, options = {}, path) {
  const env = options.env != null ? options.env : "development";
  const strictMessage = isBoolean(options.strictMessage) ? options.strictMessage : true;
  const escapeHtml$1 = !!options.escapeHtml;
  const onError = options.onError || ON_ERROR_NOOP;
  const errors = [];
  let detecteHtmlInMsg = false;
  if (detectHtmlTag(msg)) {
    detecteHtmlInMsg = true;
    if (strictMessage) {
      const errMsg = format(DETECT_MESSAGE, { msg });
      onError(format(errMsg), {
        source: msg,
        path: parsePath(path)
      });
    }
  }
  const _msg = detecteHtmlInMsg && escapeHtml$1 ? escapeHtml(msg) : msg;
  const newOptions = Object.assign({ mode: "arrow" }, options);
  newOptions.onError = (err) => {
    if (onError) {
      const extra = {
        source: msg,
        path: parsePath(path),
        code: err.code,
        domain: err.domain,
        location: err.location
      };
      onError(getCompileErrorMessage(err), extra);
      errors.push(err);
    }
  };
  const { code, ast, map } = baseCompile(_msg, newOptions);
  const occured = errors.length > 0;
  const genCode = !occured ? env === "development" ? `(()=>{const fn=${code};fn.source=${JSON.stringify(msg)};return fn;})()` : `${code}` : `\`${_msg}\``;
  return { code: genCode, ast, map, errors };
}
function mapLinesColumns(resMap, codeMaps, inSourceMap) {
  if (!resMap) {
    return null;
  }
  const resMapConsumer = new SourceMapConsumer(resMap);
  const inMapConsumer = inSourceMap ? new SourceMapConsumer(inSourceMap) : null;
  const mergedMapGenerator = new SourceMapGenerator();
  let inMapFirstItem = null;
  if (inMapConsumer) {
    inMapConsumer.eachMapping((m) => {
      if (inMapFirstItem) {
        return;
      }
      inMapFirstItem = m;
    });
  }
  resMapConsumer.eachMapping((res) => {
    if (res.originalLine == null) {
      return;
    }
    const map = codeMaps.get(res.name);
    if (!map) {
      return;
    }
    let inMapOrigin = null;
    if (inMapConsumer) {
      inMapOrigin = inMapConsumer.originalPositionFor({
        line: res.originalLine,
        column: res.originalColumn - 1
      });
      if (inMapOrigin.source == null) {
        inMapOrigin = null;
        return;
      }
    }
    const mapConsumer = new SourceMapConsumer(map);
    mapConsumer.eachMapping((m) => {
      mergedMapGenerator.addMapping({
        original: {
          line: inMapFirstItem ? inMapFirstItem.originalLine + res.originalLine - 2 : res.originalLine,
          column: inMapFirstItem ? inMapFirstItem.originalColumn + res.originalColumn : res.originalColumn
        },
        generated: {
          line: inMapFirstItem ? inMapFirstItem.generatedLine + res.originalLine - 2 : res.originalLine,
          // map column with message format compilation code map
          column: inMapFirstItem ? inMapFirstItem.generatedColumn + res.originalColumn + m.generatedColumn : res.originalColumn + m.generatedColumn
        },
        source: inMapOrigin ? inMapOrigin.source : res.source,
        name: m.name
        // message format compilation code
      });
    });
  });
  const generator = mergedMapGenerator;
  const targetConsumer = inMapConsumer || resMapConsumer;
  targetConsumer.sources.forEach((sourceFile) => {
    generator._sources.add(sourceFile);
    const sourceContent = targetConsumer.sourceContentFor(sourceFile);
    if (sourceContent != null) {
      mergedMapGenerator.setSourceContent(sourceFile, sourceContent);
    }
  });
  generator._sourceRoot = inSourceMap ? inSourceMap.sourceRoot : resMap.sourceRoot;
  generator._file = inSourceMap ? inSourceMap.file : resMap.file;
  return generator.toJSON();
}
function generateResourceAst(msg, options = {}, path) {
  const env = options.env != null ? options.env : "development";
  const strictMessage = isBoolean(options.strictMessage) ? options.strictMessage : true;
  const escapeHtml$1 = !!options.escapeHtml;
  const onError = options.onError || ON_ERROR_NOOP;
  const errors = [];
  let detecteHtmlInMsg = false;
  if (detectHtmlTag(msg)) {
    detecteHtmlInMsg = true;
    if (strictMessage) {
      const errMsg = format(DETECT_MESSAGE, { msg });
      onError(format(errMsg), {
        source: msg,
        path: parsePath(path)
      });
    }
  }
  const _msg = detecteHtmlInMsg && escapeHtml$1 ? escapeHtml(msg) : msg;
  const newOptions = Object.assign(
    {
      location: env === "development",
      minify: isBoolean(options.minify) ? options.minify : env === "production"
    },
    options
  );
  if (newOptions.jit != null) {
    newOptions.jit = true;
  }
  newOptions.onError = (err) => {
    if (onError) {
      const extra = {
        source: msg,
        path: parsePath(path),
        code: err.code,
        domain: err.domain,
        location: err.location
      };
      onError(getCompileErrorMessage(err), extra);
      errors.push(err);
    }
  };
  const { ast, map } = baseCompile(_msg, newOptions);
  const occured = errors.length > 0;
  const code = !occured ? `${friendlyJSONstringify(ast)}` : `\`${_msg}\``;
  return { code, ast, map, errors };
}
function filterMessageKeys(messages, shouldKeep, parentPath = []) {
  const result = {};
  for (const [key, value] of Object.entries(messages)) {
    const currentPath = [...parentPath, key];
    const dotPath = currentPath.join(".");
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const filtered = filterMessageKeys(value, shouldKeep, currentPath);
      if (Object.keys(filtered).length > 0) {
        result[key] = filtered;
      }
    } else {
      if (shouldKeep(dotPath)) {
        result[key] = value;
      }
    }
  }
  return result;
}
function filterMultiLocaleMessages(messages, shouldKeep) {
  const result = {};
  for (const [locale, localeMessages] of Object.entries(messages)) {
    if (typeof localeMessages === "object" && localeMessages !== null && !Array.isArray(localeMessages)) {
      const filtered = filterMessageKeys(localeMessages, shouldKeep);
      if (Object.keys(filtered).length > 0) {
        result[locale] = filtered;
      }
    } else {
      result[locale] = localeMessages;
    }
  }
  return result;
}
function describeResource({ type, filename }) {
  return type === "sfc" ? `the i18n custom block of ${filename}` : `${filename}`;
}
function describeValue(value) {
  if (Array.isArray(value)) return "an array";
  if (value === void 0) return "undefined";
  return `a ${typeof value}`;
}
function stringifyValue(value) {
  if (typeof value === "number") return Object.is(value, -0) ? "-0" : String(value);
  if (value === void 0) return "undefined";
  return JSON.stringify(value);
}
function createResourceError(message, options) {
  return new Error(`${message} in ${describeResource(options)}.`);
}
function createResourceParseError(err, options, columnOffset = 0) {
  if (!(err instanceof Error)) return err;
  const { lineNumber, column } = err;
  const position = lineNumber != null ? ` (${lineNumber}:${column + columnOffset})` : "";
  return new SyntaxError(`${err.message} in ${describeResource(options)}${position}`, {
    cause: err
  });
}
function excludeLocales({
  messages,
  onlyLocales
}) {
  const _messages = { ...messages };
  Object.keys(_messages).forEach((locale) => {
    if (!onlyLocales.includes(locale)) {
      delete _messages[locale];
    }
  });
  return _messages;
}

class DynamicResourceError extends Error {
}
const DEFAULT_OPTIONS = {
  type: "plain",
  filename: "vue-i18n-loader.js",
  inSourceMap: void 0,
  locale: "",
  isGlobal: false,
  sourceMap: false,
  env: "development",
  forceStringify: false,
  onError: void 0,
  onWarn: void 0,
  strictMessage: true,
  escapeHtml: false,
  allowDynamic: false,
  jit: false
};
function generate$3(targetSource, options) {
  const value = Buffer.isBuffer(targetSource) ? targetSource.toString() : targetSource;
  const _options = Object.assign({}, DEFAULT_OPTIONS, options, {
    source: value
  });
  const generator = createCodeGenerator(_options);
  const ast = parse(value, {
    ecmaVersion: "latest",
    sourceType: "module",
    sourceFile: _options.filename,
    allowImportExportEverywhere: true
  });
  const exportResult = scanAst(ast);
  if (!_options.allowDynamic) {
    if (!exportResult) {
      throw new Error(`You need to define an object as the locale message with 'export default'.`);
    }
    if (exportResult !== "object") {
      throw new DynamicResourceError(
        `You need to define an object as the locale message with 'export default'.`
      );
    }
  } else {
    if (!exportResult) {
      throw new Error(`You need to define 'export default' that will return the locale messages.`);
    }
    if (exportResult !== "object") {
      return {
        ast,
        code: value,
        map: _options.inSourceMap
      };
    }
  }
  const codeMaps = _generate$2(generator, ast, _options);
  const { code, map } = generator.context();
  const newMap = map ? mapLinesColumns(map.toJSON(), codeMaps, _options.inSourceMap) || null : null;
  return {
    ast,
    code,
    map: newMap != null ? newMap : void 0
  };
}
function scanAst(ast) {
  if (ast.type !== "Program") {
    throw new Error("Invalid AST: does not have Program node");
  }
  for (const node of ast.body) {
    if (node.type !== "ExportDefaultDeclaration") continue;
    switch (node.declaration.type) {
      case "ObjectExpression":
        return "object";
      case "FunctionDeclaration":
        return "function";
      case "ArrowFunctionExpression":
        return "arrow-function";
    }
  }
  return false;
}
function _generate$2(generator, node, options = {}) {
  const { forceStringify } = generator.context();
  const codeMaps = /* @__PURE__ */ new Map();
  const { type, sourceMap, isGlobal, locale, jit } = options;
  const source = options.source ?? "";
  const _codegenFn = jit ? generateResourceAst : generateMessageFunction;
  function codegenFn(value, path) {
    const { code, map } = _codegenFn(value, options, path);
    sourceMap && map != null && codeMaps.set(value, map);
    return code;
  }
  const componentNamespace = "_Component";
  const variableDeclarations = [];
  const { body } = node;
  const exportDefault = body.find(
    (statement) => statement.type === "ExportDefaultDeclaration"
  );
  const resource = exportDefault.declaration;
  for (const statement of body) {
    if (statement === exportDefault) continue;
    generator.push(sourceOf(source, statement));
    generator.newline();
    if (statement.type === "VariableDeclaration") {
      variableDeclarations.push(
        ...statement.declarations.map((x) => `\`${x.id.name}\``)
      );
    }
  }
  if (variableDeclarations.length > 0) {
    options?.onWarn?.(
      `
Variable declarations are not optimized - found ${variableDeclarations.join(", ")}`
    );
  }
  const messages = [];
  function collect(value, path) {
    if (value.type === "ObjectExpression") {
      for (const property of value.properties) {
        if (property.type === "Property" && property.kind === "init" && !property.method && !property.shorthand) {
          collect(property.value, [...path, keyOf(source, property)]);
        }
      }
    } else if (value.type === "ArrayExpression") {
      value.elements.forEach((element, index) => {
        if (element != null && element.type !== "SpreadElement") {
          collect(element, [...path, String(index)]);
        }
      });
    } else if (isMessageLiteral(value)) {
      const message = getValue(value);
      if (isString(message)) {
        messages.push({ node: value, value: message, code: codegenFn(message, path) });
      } else if (forceStringify) {
        const strMessage = JSON.stringify(message);
        messages.push({ node: value, value: strMessage, code: codegenFn(strMessage, path) });
      }
    }
  }
  collect(resource, []);
  if (type === "plain") {
    generator.push(`const resource = `);
  } else if (type === "sfc") {
    const localeName = JSON.stringify(locale ?? '""');
    const variableName = !isGlobal ? "__i18n" : "__i18nGlobal";
    generator.push(`export default function (Component) {`);
    generator.indent();
    generator.pushline(`const ${componentNamespace} = Component`);
    generator.pushline(
      `${componentNamespace}.${variableName} = ${componentNamespace}.${variableName} || []`
    );
    generator.push(`${componentNamespace}.${variableName}.push({`);
    generator.indent();
    generator.pushline(`"locale": ${localeName},`);
    generator.push(`"resource": `);
  }
  let offset = rangeOf(resource).start;
  for (const message of messages) {
    generator.push(source.slice(offset, rangeOf(message.node).start));
    generator.push(message.code, message.node, message.value);
    offset = rangeOf(message.node).end;
  }
  generator.push(source.slice(offset, rangeOf(resource).end));
  if (type === "plain") {
    generator.push("\n");
    generator.push("export default resource");
  } else if (type === "sfc") {
    generator.deindent();
    generator.push("})");
    generator.deindent();
    generator.pushline("}");
  }
  return codeMaps;
}
function rangeOf(node) {
  return node;
}
function sourceOf(source, node) {
  const { start, end } = rangeOf(node);
  return source.slice(start, end);
}
function keyOf(source, property) {
  const { key } = property;
  if (property.computed) {
    return sourceOf(source, key);
  }
  return key.type === "Identifier" ? key.name : String(key.value);
}
function isMessageLiteral(node) {
  if (node.type === "Literal" && "regex" in node) {
    return false;
  }
  if (node.type === "TemplateLiteral" && node.expressions.length > 0) {
    return false;
  }
  return isJSONablePrimitiveLiteral(node);
}
function isJSONablePrimitiveLiteral(node) {
  return node.type === "Literal" && (isString(node.value) || isNumber(node.value) || isBoolean(node.value) || node.value === null) || node.type === "TemplateLiteral";
}
function getValue(node) {
  return node.type === "Literal" ? node.value : node.type === "TemplateLiteral" ? node.quasis.map((quasi) => quasi.value.cooked).join("") : void 0;
}

function generate$2(targetSource, {
  type = "plain",
  onlyLocales = [],
  filename = "vue-i18n-loader.json",
  inSourceMap = void 0,
  locale = "",
  isGlobal = false,
  sourceMap = false,
  env = "development",
  forceStringify = false,
  onError = void 0,
  strictMessage = true,
  escapeHtml = false,
  jit = false,
  usedKeyFilter = void 0
}) {
  let value = Buffer.isBuffer(targetSource) ? targetSource.toString() : targetSource;
  const options = {
    type,
    source: value,
    sourceMap,
    locale,
    isGlobal,
    inSourceMap,
    env,
    filename,
    forceStringify,
    onError,
    strictMessage,
    escapeHtml,
    jit
  };
  let ast;
  try {
    ast = parseJSON(value, { filePath: filename });
  } catch (err) {
    throw createResourceParseError(err, options);
  }
  const root = ast.body[0].expression;
  if (root.type !== "JSONObjectExpression") {
    const rootValue = getStaticJSONValue(root);
    if (rootValue !== null) {
      throw createResourceError(
        `You need to define an object as the locale messages at the top level, but got ${describeValue(rootValue)}`,
        options
      );
    }
    value = JSON.stringify({});
    ast = parseJSON(value, { filePath: filename });
    options.source = void 0;
  }
  if (!locale && type === "sfc" && onlyLocales?.length) {
    const messages = getStaticJSONValue(ast);
    value = JSON.stringify(
      excludeLocales({
        messages,
        onlyLocales
      })
    );
    ast = parseJSON(value, { filePath: filename });
  }
  if (locale && onlyLocales?.length && !onlyLocales.includes(locale)) {
    value = JSON.stringify({});
    ast = parseJSON(value, { filePath: filename });
    options.locale = "";
    options.source = void 0;
  }
  if (usedKeyFilter) {
    const messages = getStaticJSONValue(ast);
    const isMultiLocale = !locale && type === "sfc";
    const filtered = isMultiLocale ? filterMultiLocaleMessages(messages, usedKeyFilter) : filterMessageKeys(messages, usedKeyFilter);
    value = JSON.stringify(filtered);
    ast = parseJSON(value, { filePath: filename });
    options.source = value;
  }
  const generator = createCodeGenerator(options);
  const codeMaps = _generate$1(generator, ast, options);
  const { code, map } = generator.context();
  const newMap = map && !jit ? mapLinesColumns(map.toJSON(), codeMaps, inSourceMap) || null : null;
  return {
    ast,
    code,
    map: newMap != null ? newMap : void 0
  };
}
function _generate$1(generator, node, options = {}) {
  const propsCountStack = [];
  const pathStack = [];
  const itemsCountStack = [];
  const { forceStringify } = generator.context();
  const codeMaps = /* @__PURE__ */ new Map();
  const { type, sourceMap, isGlobal, locale, jit } = options;
  const _codegenFn = jit ? generateResourceAst : generateMessageFunction;
  function codegenFn(value) {
    const { code, map } = _codegenFn(value, options, pathStack);
    sourceMap && map != null && codeMaps.set(value, map);
    return code;
  }
  function pushExpressionValue(node2) {
    const value = getStaticJSONValue(node2);
    if (isString(value)) {
      generator.push(codegenFn(value), node2, value);
      return;
    }
    const strValue = stringifyValue(value);
    if (forceStringify) {
      generator.push(codegenFn(strValue), node2, strValue);
    } else {
      generator.push(strValue);
    }
  }
  const componentNamespace = "_Component";
  traverseNodes(node, {
    enterNode(node2, parent) {
      if (parent?.type === "JSONArrayExpression") {
        const lastIndex = itemsCountStack.length - 1;
        const currentCount = parent.elements.length - itemsCountStack[lastIndex];
        pathStack.push(currentCount.toString());
        itemsCountStack[lastIndex] = --itemsCountStack[lastIndex];
      } else if (parent?.type === "JSONObjectExpression") {
        const lastIndex = propsCountStack.length - 1;
        propsCountStack[lastIndex] = --propsCountStack[lastIndex];
      }
      switch (node2.type) {
        case "Program":
          if (type === "plain") {
            generator.push(`const resource = `);
          } else if (type === "sfc") {
            const variableName = !isGlobal ? "__i18n" : "__i18nGlobal";
            const localeName = JSON.stringify(locale ?? `""`);
            generator.push(`export default function (Component) {`);
            generator.indent();
            generator.pushline(`const ${componentNamespace} = Component`);
            generator.pushline(
              `${componentNamespace}.${variableName} = ${componentNamespace}.${variableName} || []`
            );
            generator.push(`${componentNamespace}.${variableName}.push({`);
            generator.indent();
            generator.pushline(`"locale": ${localeName},`);
            generator.push(`"resource": `);
          }
          break;
        case "JSONObjectExpression":
          generator.push(`{`);
          generator.indent();
          propsCountStack.push(node2.properties.length);
          break;
        case "JSONArrayExpression":
          generator.push(`[`);
          generator.indent();
          itemsCountStack.push(node2.elements.length);
          break;
        case "JSONProperty": {
          const name = node2.key.type === "JSONLiteral" ? node2.key.value : node2.key.name;
          const strName = JSON.stringify(name);
          generator.push(`${strName}: `);
          pathStack.push(name.toString());
          if (node2.value.type === "JSONLiteral") {
            const value2 = node2.value.value;
            const strValue2 = JSON.stringify(value2);
            if (isString(value2)) {
              generator.push(codegenFn(value2), node2.value, value2);
            } else if (forceStringify) {
              generator.push(codegenFn(strValue2), node2.value, strValue2);
            } else {
              generator.push(strValue2);
            }
          } else if (node2.value.type !== "JSONObjectExpression" && node2.value.type !== "JSONArrayExpression") {
            pushExpressionValue(node2.value);
          }
          break;
        }
        case "JSONLiteral":
          if (parent.type !== "JSONArrayExpression") break;
          const value = node2.value;
          const strValue = JSON.stringify(value);
          if (isString(value)) {
            generator.push(codegenFn(value), node2, value);
          } else if (forceStringify) {
            generator.push(codegenFn(strValue), node2, strValue);
          } else {
            generator.push(strValue);
          }
          break;
        case "JSONUnaryExpression":
        case "JSONIdentifier":
        case "JSONTemplateLiteral":
        case "JSONBinaryExpression":
          if (parent.type === "JSONArrayExpression") {
            pushExpressionValue(node2);
          }
          break;
      }
    },
    leaveNode(node2, parent) {
      switch (node2.type) {
        case "Program":
          if (type === "sfc") {
            generator.deindent();
            generator.push(`})`);
            generator.deindent();
            generator.pushline(`}`);
          } else if (type === "plain") {
            generator.push(`
`);
            generator.push("export default resource");
          }
          break;
        case "JSONObjectExpression":
          if (propsCountStack[propsCountStack.length - 1] === 0) {
            pathStack.pop();
            propsCountStack.pop();
          }
          generator.deindent();
          generator.push(`}`);
          break;
        case "JSONArrayExpression":
          if (itemsCountStack[itemsCountStack.length - 1] === 0) {
            pathStack.pop();
            itemsCountStack.pop();
          }
          generator.deindent();
          generator.push(`]`);
          break;
      }
      if (parent?.type === "JSONArrayExpression" || parent?.type === "JSONObjectExpression") {
        const stackArr = node2.type === "JSONProperty" ? propsCountStack : itemsCountStack;
        if (stackArr[stackArr.length - 1] !== 0) {
          pathStack.pop();
          generator.pushline(`,`);
        }
      }
    }
  });
  return codeMaps;
}

async function generate$1(targetSource, options) {
  let value = Buffer.isBuffer(targetSource) ? targetSource.toString() : targetSource;
  const _options = Object.assign({}, DEFAULT_OPTIONS, options, {
    source: value
  });
  const transformed = await transform(value, { loader: "ts" });
  if (transformed && transformed.code) {
    value = transformed.code;
    _options.source = transformed.code;
  }
  return generate$3(value, _options);
}

function generate(targetSource, {
  type = "plain",
  onlyLocales = [],
  filename = "vue-i18n-loader.yaml",
  inSourceMap = void 0,
  locale = "",
  isGlobal = false,
  sourceMap = false,
  env = "development",
  forceStringify = false,
  onError = void 0,
  strictMessage = true,
  escapeHtml = false,
  jit = false,
  usedKeyFilter = void 0
}) {
  let value = Buffer.isBuffer(targetSource) ? targetSource.toString() : targetSource;
  if (value.charCodeAt(0) === 65279) {
    value = value.slice(1);
  }
  const options = {
    type,
    source: value,
    sourceMap,
    locale,
    isGlobal,
    inSourceMap,
    env,
    filename,
    forceStringify,
    onError,
    strictMessage,
    escapeHtml,
    jit
  };
  let ast;
  try {
    ast = parseYAML(value, { filePath: filename });
  } catch (err) {
    throw createResourceParseError(err, options, 1);
  }
  const rootDocument = getRootDocument(ast, options);
  const content = rootDocument?.content;
  const root = content?.type === "YAMLWithMeta" ? content.value : content;
  if (root?.type !== "YAMLMapping") {
    const isAlias = root?.type === "YAMLAlias";
    const rootValue = rootDocument == null || isAlias ? null : getStaticYAMLValue(rootDocument);
    if (isAlias || rootValue !== null) {
      const actual = isAlias ? "an alias" : describeValue(rootValue);
      throw createResourceError(
        `You need to define an object as the locale messages at the top level, but got ${actual}`,
        options
      );
    }
    value = JSON.stringify({});
    ast = parseYAML(value, { filePath: filename });
    options.source = void 0;
  }
  if (!locale && type === "sfc" && onlyLocales?.length) {
    const messages = getStaticYAMLValue(getRootDocument(ast, options));
    value = JSON.stringify(
      excludeLocales({
        messages,
        onlyLocales
      })
    );
    ast = parseYAML(value, { filePath: filename });
  }
  if (locale && onlyLocales?.length && !onlyLocales.includes(locale)) {
    value = JSON.stringify({});
    ast = parseYAML(value, { filePath: filename });
    options.locale = "";
    options.source = void 0;
  }
  if (usedKeyFilter) {
    const messages = getStaticYAMLValue(getRootDocument(ast, options));
    const isMultiLocale = !locale && type === "sfc";
    const filtered = isMultiLocale ? filterMultiLocaleMessages(messages, usedKeyFilter) : filterMessageKeys(messages, usedKeyFilter);
    value = JSON.stringify(filtered);
    ast = parseYAML(value, { filePath: filename });
    options.source = value;
  }
  const generator = createCodeGenerator(options);
  const codeMaps = _generate(generator, ast, options);
  const { code, map } = generator.context();
  const newMap = map ? mapLinesColumns(map.toJSON(), codeMaps, inSourceMap) || null : null;
  return {
    ast,
    code,
    map: newMap != null ? newMap : void 0
  };
}
function getRootDocument(ast, options) {
  const documents = ast.body.filter((doc) => doc.content != null);
  if (documents.length > 1) {
    throw createResourceError(
      `You need to define the locale messages in a single YAML document, but got ${documents.length} documents`,
      options
    );
  }
  return documents[0] ?? null;
}
function _generate(generator, node, options = {}) {
  const propsCountStack = [];
  const pathStack = [];
  const itemsCountStack = [];
  const { forceStringify } = generator.context();
  const codeMaps = /* @__PURE__ */ new Map();
  const { type, sourceMap, isGlobal, locale, jit } = options;
  const _codegenFn = jit ? generateResourceAst : generateMessageFunction;
  function codegenFn(value) {
    const { code, map } = _codegenFn(value, options, pathStack);
    sourceMap && map != null && codeMaps.set(value, map);
    return code;
  }
  const componentNamespace = "_Component";
  traverseNodes$1(node, {
    enterNode(node2, parent) {
      if (parent?.type === "YAMLSequence") {
        const lastIndex = itemsCountStack.length - 1;
        const currentCount = parent.entries.length - itemsCountStack[lastIndex];
        pathStack.push(currentCount.toString());
        itemsCountStack[lastIndex] = --itemsCountStack[lastIndex];
      } else if (parent?.type === "YAMLMapping") {
        const lastIndex = propsCountStack.length - 1;
        propsCountStack[lastIndex] = --propsCountStack[lastIndex];
      }
      switch (node2.type) {
        case "Program":
          if (type === "plain") {
            generator.push(`const resource = `);
          } else if (type === "sfc") {
            const variableName = !isGlobal ? "__i18n" : "__i18nGlobal";
            const localeName = JSON.stringify(locale ?? `""`);
            generator.push(`export default function (Component) {`);
            generator.indent();
            generator.pushline(`const ${componentNamespace} = Component`);
            generator.pushline(
              `${componentNamespace}.${variableName} = ${componentNamespace}.${variableName} || []`
            );
            generator.push(`${componentNamespace}.${variableName}.push({`);
            generator.indent();
            generator.pushline(`"locale": ${localeName},`);
            generator.push(`"resource": `);
          }
          break;
        case "YAMLMapping":
          generator.push(`{`);
          generator.indent();
          propsCountStack.push(node2.pairs.length);
          break;
        case "YAMLSequence":
          generator.push(`[`);
          generator.indent();
          itemsCountStack.push(node2.entries.length);
          break;
        case "YAMLPair":
          if (node2.key?.type !== "YAMLScalar") break;
          if (node2.value?.type === "YAMLScalar") {
            const name = node2.key.value;
            const value = node2.value.value;
            const strName = JSON.stringify(name);
            const strValue = stringifyValue(value);
            name && pathStack.push(name.toString());
            generator.push(`${strName}: `);
            if (isString(value)) {
              generator.push(codegenFn(value), node2.value, value);
            } else if (forceStringify) {
              generator.push(codegenFn(strValue), node2.value, strValue);
            } else {
              generator.push(strValue);
            }
          } else if (node2.value?.type === "YAMLMapping" || node2.value?.type === "YAMLSequence") {
            const name = node2.key.value;
            name && pathStack.push(name.toString());
            generator.push(`${JSON.stringify(name)}: `);
          }
          break;
        case "YAMLScalar":
          if (parent.type === "YAMLSequence") {
            const value = node2.value;
            const strValue = stringifyValue(value);
            if (isString(value)) {
              generator.push(codegenFn(value), node2, value);
            } else if (forceStringify) {
              generator.push(codegenFn(strValue), node2, strValue);
            } else {
              generator.push(strValue);
            }
          }
          break;
      }
    },
    leaveNode(node2, parent) {
      switch (node2.type) {
        case "Program":
          if (type === "sfc") {
            generator.deindent();
            generator.push(`})`);
            generator.deindent();
            generator.push(`}`);
          } else if (type === "plain") {
            generator.push(`
`);
            generator.push("export default resource");
          }
          break;
        case "YAMLMapping":
          if (propsCountStack[propsCountStack.length - 1] === 0) {
            pathStack.pop();
            propsCountStack.pop();
          }
          generator.deindent();
          generator.push(`}`);
          break;
        case "YAMLSequence":
          if (itemsCountStack[itemsCountStack.length - 1] === 0) {
            pathStack.pop();
            itemsCountStack.pop();
          }
          generator.deindent();
          generator.push(`]`);
          break;
      }
      const stackArr = node2.type === "YAMLPair" ? propsCountStack : itemsCountStack;
      if (parent?.type === "YAMLSequence" || parent?.type === "YAMLMapping") {
        if (stackArr[stackArr.length - 1] !== 0) {
          pathStack.pop();
          generator.pushline(`,`);
        } else if (node2.type === "YAMLScalar") {
          generator.pushline(`,`);
        }
      }
    }
  });
  return codeMaps;
}

export { checkInstallPackage, generate$2 as generateJSON, generate$3 as generateJavaScript, generate$1 as generateTypescript, generate as generateYAML, getVueI18nVersion };
