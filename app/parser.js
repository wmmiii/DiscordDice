/**
 * Parses an expression such as "8d6 + 2" and returns a number that it
 * represents.
 * 
 * @param {string | Array<string>} input The expression to parse.
 * @returns The evaluated number of the expression.
 */
function roll(input) {
  // First break the input up into tokens if we need to.
  if (typeof input == 'string') {
    input = input.split(' ');
  }

  // Parse input into Abstract Syntax Tree
  const ast = parse(null, input);

  // Evaluate the AST.
  return evaluate(ast);
}

/**
 * Consumes the previously parsed AST (if it exists) and the remaing tokens and
 * returns an AST node
 * 
 * @param {Object} left The parsed AST so far.
 * @param {Array<string>} input An array of the remaining tokens.
 * @returns An AST node representing the next number.
 */
function parse(left, input) {
  if (input == null || input.length <= 0) {
    return left;
  }
  const token = input[0];
  const remaining = input.splice(1);
  
  const dice_regex = /^([\+\-\de]+)d([\+\-\de]+)$/gi;

  if (dice_regex.test(token)) {
    dice_regex.lastIndex = 0;
    const matches = dice_regex.exec(token);
    return parse({
      type: 'dice',
      count: parseInt(matches[1]),
      sides: parseInt(matches[2]),
    }, remaining);

  } else if (!isNaN(parseInt(token))) {
    return parse({
      type: 'number',
      value: parseInt(token),
    }, remaining);

  } else if (token === '+' || token === '-') {
    if (left == null) {
      throw Error('Tried to add nothing!');
    }
    return {
      type: token === '+' ? 'add' : 'subtract',
      left: left,
      right: parse(null, remaining),
    };
  } else {
    throw Error('I don\'t know what "' + token + '" means. Maybe try adding \
                 some spaces?');
  }
}

/**
 * Takes an AST node and returns the number it evaluates to.
 * 
 * @param {Object} ast An AST node.
 * @returns The evaluated number.
 */
function evaluate(ast) {
  switch (ast.type) {
    case 'number':
      return ast.value;

    case 'dice':
      let value = 0;
      for (let i = 0; i < ast.count; i++) {
        value += Math.ceil(Math.random() * ast.sides);
      }
      return value;

    case 'add':
      return evaluate(ast.left) + evaluate(ast.right);

    case 'subtract':
      return evaluate(ast.left) - evaluate(ast.right);
  }
}

module.exports = {
  roll: roll,
  parse: parse,
};
