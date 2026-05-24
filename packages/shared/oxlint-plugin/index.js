// Custom workspace ESLint-compatible plugin loaded by oxlint via `jsPlugins`.
// Two rules:
//   - gutenku/no-else
//       Forbid `else` / `else if` branches. Use guard clauses / early returns
//       / lookup maps instead.
//
//   - gutenku/padding-line-before-flow
//       Require a blank line before `if`, `for`, `while`, `switch`, and
//       `return` statements when they follow non-empty code that does not
//       open a new block / is not a continuation line.

const FLOW_TYPES = new Set([
  'IfStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'SwitchStatement',
  'ReturnStatement',
]);

function isCommentOnLine(comments, line) {
  for (const c of comments) {
    if (c.loc.start.line <= line && c.loc.end.line >= line) {
      return true;
    }
  }
  return false;
}

const noElseRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'forbid else / else if branches — prefer early-return or guard clauses',
    },
    schema: [],
    messages: {
      noElse:
        '`else` branches are forbidden — refactor to guard clauses, early returns, or a lookup map',
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode
      ? context.getSourceCode()
      : context.sourceCode;
    return {
      IfStatement(node) {
        if (!node.alternate) {
          return;
        }
        // Locate the `else` keyword between the consequent and the alternate.
        const elseToken = sourceCode.getTokenAfter(node.consequent, {
          filter: (t) => t.type === 'Keyword' && t.value === 'else',
        });
        const reportNode = elseToken ?? node.alternate;
        context.report({
          node: reportNode,
          messageId: 'noElse',
        });
      },
    };
  },
};

const paddingBeforeFlowRule = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: {
      description:
        'require a blank line before if / for / while / switch / return when they follow other code',
    },
    schema: [],
    messages: {
      missingPadding: 'expected a blank line before `{{keyword}}`',
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode
      ? context.getSourceCode()
      : context.sourceCode;

    function check(node, keyword) {
      const firstToken = sourceCode.getFirstToken(node);
      if (!firstToken) {
        return;
      }
      const tokenBefore = sourceCode.getTokenBefore(firstToken, {
        includeComments: false,
      });
      if (!tokenBefore) {
        return;
      }
      // Exempt when the previous token opens a block or is a continuation.
      const prevValue = tokenBefore.value;
      if (
        prevValue === '{' ||
        prevValue === '(' ||
        prevValue === '[' ||
        prevValue === ',' ||
        prevValue === ':' ||
        prevValue === '=>'
      ) {
        return;
      }
      const prevEndLine = tokenBefore.loc.end.line;
      const currStartLine = firstToken.loc.start.line;
      // Already at least one blank line between them.
      if (currStartLine - prevEndLine >= 2) {
        return;
      }
      // If a comment sits on the line immediately above the current statement,
      // accept it as the leading attached comment (no padding needed).
      const leadingComments =
        sourceCode.getCommentsBefore && sourceCode.getCommentsBefore(node);
      if (leadingComments && leadingComments.length > 0) {
        const lastComment = leadingComments[leadingComments.length - 1];
        if (lastComment.loc.end.line === currStartLine - 1) {
          return;
        }
      }
      context.report({
        node: firstToken,
        messageId: 'missingPadding',
        data: { keyword },
        fix(fixer) {
          return fixer.insertTextBefore(firstToken, '\n');
        },
      });
    }

    return {
      IfStatement(node) {
        // Skip `else if (...)` — that's a chained-alternate, not a fresh stmt.
        if (
          node.parent &&
          node.parent.type === 'IfStatement' &&
          node.parent.alternate === node
        ) {
          return;
        }
        check(node, 'if');
      },
      ForStatement(node) {
        check(node, 'for');
      },
      ForInStatement(node) {
        check(node, 'for');
      },
      ForOfStatement(node) {
        check(node, 'for');
      },
      WhileStatement(node) {
        check(node, 'while');
      },
      DoWhileStatement(node) {
        check(node, 'while');
      },
      SwitchStatement(node) {
        check(node, 'switch');
      },
      ReturnStatement(node) {
        check(node, 'return');
      },
    };
  },
};

const DISABLE_COMMENT_RX =
  /(eslint-disable(?:-next-line|-line)?|oxlint-disable(?:-next-line|-line)?)/;

const noDisableCommentRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'forbid eslint-disable / oxlint-disable comments — refactor instead of suppressing',
    },
    schema: [],
    messages: {
      noDisable:
        '`{{kind}}` annotations are forbidden — refactor instead of suppressing',
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode
      ? context.getSourceCode()
      : context.sourceCode;
    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          const text = comment.value;
          const m = DISABLE_COMMENT_RX.exec(text);
          if (!m) {
            continue;
          }
          context.report({
            loc: comment.loc,
            messageId: 'noDisable',
            data: { kind: m[1] },
          });
        }
      },
    };
  },
};

const plugin = {
  meta: { name: 'gutenku' },
  rules: {
    'no-else': noElseRule,
    'padding-line-before-flow': paddingBeforeFlowRule,
    'no-disable-comment': noDisableCommentRule,
  },
};

export default plugin;
