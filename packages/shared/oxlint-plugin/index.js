// Custom workspace ESLint-compatible plugin loaded by oxlint via `jsPlugins`.
// Three rules:
//   - gutenku/no-else
//       Forbid `else` / `else if` branches. Use guard clauses / early returns
//       / lookup maps instead.
//
//   - gutenku/padding-line-before-flow
//       Require a blank line before `if`, `for`, `while`, `switch`, and
//       `return` statements when they follow non-empty code that does not
//       open a new block / is not a continuation line.
//
//   - gutenku/no-disable-comment
//       Forbid linter suppression annotations (the eslint and oxlint
//       single-line / next-line / block disable comment families).

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

// Tokens that open a new block or continue a previous statement — when one of
// these is the last token on the line above, no blank-line padding is required.
const CONTINUATION_TOKENS = new Set(['{', '(', '[', ',', ':', '=>']);

function hasAttachedLeadingComment(sourceCode, node, currStartLine) {
  const leadingComments = sourceCode.getCommentsBefore?.(node);

  if (!leadingComments?.length) {
    return false;
  }
  const lastComment = leadingComments.at(-1);

  return lastComment.loc.end.line === currStartLine - 1;
}

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

      if (CONTINUATION_TOKENS.has(tokenBefore.value)) {
        return;
      }
      const currStartLine = firstToken.loc.start.line;

      // Already at least one blank line between them.
      if (currStartLine - tokenBefore.loc.end.line >= 2) {
        return;
      }

      if (hasAttachedLeadingComment(sourceCode, node, currStartLine)) {
        return;
      }

      // Insert the blank line at the START of the line containing firstToken
      // so the existing indentation is preserved (rather than splitting the
      // line at the token and leaving the keyword flush-left).
      const lineStart = firstToken.range[0] - firstToken.loc.start.column;

      context.report({
        node: firstToken,
        messageId: 'missingPadding',
        data: { keyword },
        fix(fixer) {
          return fixer.insertTextBeforeRange([lineStart, lineStart], '\n');
        },
      });
    }

    return {
      IfStatement(node) {
        // Skip `else if (...)` — that's a chained-alternate, not a fresh stmt.
        if (
          node.parent?.type === 'IfStatement' &&
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
          const m = DISABLE_COMMENT_RX.exec(comment.value);

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
