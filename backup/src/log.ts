const reset = '\x1b[0m';

export const log = {
  green: (text: any) => console.log('\x1b[32m' + text + reset),
  red: (text: any) => console.log('\x1b[31m' + text + reset),
  blue: (text: any) => console.log('\x1b[34m' + text + reset),
  yellow: (text: any) => console.log('\x1b[33m' + text + reset),
};
