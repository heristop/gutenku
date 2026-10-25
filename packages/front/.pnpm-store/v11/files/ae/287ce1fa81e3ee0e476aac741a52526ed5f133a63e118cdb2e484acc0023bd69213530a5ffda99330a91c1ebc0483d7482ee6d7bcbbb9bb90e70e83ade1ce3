"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStrings = parseStrings;
exports.generateStrings = generateStrings;
function parseStrings(contents) {
    return parse(contents);
}
var State;
(function (State) {
    State["None"] = "none";
    State["Comment"] = "comment";
    State["Key"] = "key";
    State["AfterKey"] = "afterkey";
    State["Value"] = "value";
    State["AfterValue"] = "aftervalue";
})(State || (State = {}));
function parse(contents) {
    let state = State.None;
    let comment = "";
    let whitespace = "";
    let key = "";
    let value = "";
    let entries = [];
    let line = 1;
    let col = 1;
    let startLine = 0;
    let endLine = 0;
    let startCol = 0;
    let endCol = 0;
    function setState(s) {
        state = s;
    }
    for (let i = 0; i < contents.length; i++) {
        const c = contents[i];
        if (isNewLine(c)) {
            // Keep track of lines
            whitespace += c;
            ++line;
            col = 0;
        }
        else if (state === State.Key || state === State.Value) {
            // Inside a quoted string only an unescaped quote has meaning
            if (isQuote(c)) {
                setState(state === State.Key ? State.AfterKey : State.AfterValue);
            }
            else {
                let text = c;
                if (isEscape(c) && i + 1 < contents.length) {
                    // Keep escape sequences such as \" verbatim
                    text += contents[++i];
                    ++col;
                }
                if (state === State.Key) {
                    key += text;
                }
                else {
                    value += text;
                }
            }
        }
        else if (isStartComment(c, contents[i + 1])) {
            // Comment start, step forward one character
            ++i;
            // Commit any whitespace up to this point
            commitEntry(entries, {
                content: whitespace,
                startLine, startCol, endLine, endCol
            });
            // Mark starting source location
            startCol = col;
            startLine = line;
            // Clear state
            comment = "";
            whitespace = "";
            setState(State.Comment);
        }
        else if (isEndComment(c, contents[i + 1])) {
            // Comment end, step forward one character
            ++i;
            // Commit the comment
            endLine = line;
            endCol = col;
            commitEntry(entries, {
                comment, startLine, startCol, endLine, endCol
            });
            comment = "";
            whitespace = "";
            setState(State.None);
        }
        else if (state === State.Comment) {
            // Build the comment
            comment += c;
        }
        else if (isEquals(c) && (state === State.AfterKey || state === State.AfterValue)) {
            // Valid state, do nothing
        }
        else if (isQuote(c)) {
            // Quote encountered, check state
            if (state === State.None) {
                endLine = line;
                endCol = col;
                commitEntry(entries, {
                    content: whitespace,
                    startLine, startCol, endLine, endCol
                });
                startLine = line;
                startCol = col;
                setState(State.Key);
                key = "";
                whitespace = "";
            }
            else if (state === State.AfterKey) {
                // Start of value
                setState(State.Value);
                value = "";
            }
        }
        else if (isSemi(c) && (state === State.AfterValue)) {
            endLine = line;
            endCol = col;
            commitEntry(entries, {
                key, value, startLine, startCol, endLine, endCol
            });
            // Clear state
            comment = "";
            whitespace = "";
            key = "";
            value = "";
            setState(State.None);
        }
        else if (isWhitespace(c)) {
            // Valid to have whitespace before/after lines
            whitespace += c;
        }
        else if (isSemi(c)) {
            // Valid state?
        }
        else {
            throw new Error(`Error parsing .strings file: unknown character at ${line}:${col}`);
        }
        ++col;
    }
    return entries;
}
function commitEntry(entries, entry) {
    entries.push(entry);
}
function isNewLine(c) {
    return c === '\n';
}
function isStartComment(c, c2) {
    return c === '/' && c2 === '*';
}
function isEndComment(c, c2) {
    return c === '*' && c2 === '/';
}
function isQuote(c) {
    return c === '"';
}
function isEscape(c) {
    return c === '\\';
}
function isEquals(c) {
    return c === '=';
}
function isWhitespace(c) {
    return isSpace(c) || isTab(c);
}
function isSpace(c) {
    return c === ' ';
}
function isTab(c) {
    return c === '\t';
}
function isSemi(c) {
    return c === ';';
}
function generateStrings(entries) {
    const lines = [];
    for (const entry of entries) {
        lines.push(...generateLines(entry));
    }
    return lines.join('');
}
function generateLines(entry) {
    const lines = [];
    if (entry.comment) {
        lines.push(`/*${entry.comment}*/`);
    }
    else if (entry.key) {
        lines.push(`"${entry.key}" = "${entry.value}";`);
    }
    else if (entry.content) {
        lines.push(entry.content);
    }
    return lines;
}
//# sourceMappingURL=strings.js.map