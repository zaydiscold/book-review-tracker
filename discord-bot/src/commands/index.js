import { data as pushBookData, execute as pushBookExecute } from './pushBook.js';

export const commands = [pushBookData];

export const commandHandlers = {
  [pushBookData.name]: pushBookExecute,
};
