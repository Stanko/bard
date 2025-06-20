const reset = '\x1b[0m';

export const log = {
  green: (text: unknown) => console.log('\x1b[32m' + text + reset),
  red: (text: unknown) => console.log('\x1b[31m' + text + reset),
  blue: (text: unknown) => console.log('\x1b[34m' + text + reset),
  yellow: (text: unknown) => console.log('\x1b[33m' + text + reset),
};
