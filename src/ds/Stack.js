export class Stack {
  #items = [];

  push(val) {
    this.#items.push(val);
  }
  pop() {
    if (this.#items.length === 0) {
      throw new Error("No elements to remove");
    }
    return this.#items.pop();
  }
  peek() {
    if (this.#items.length === 0) {
      throw new Error("No elements to view");
    }
    let item = this.#items[this.#items.length - 1];
    return item;
  }
  get size() {
    return this.#items.length;
  }
  isEmpty() {
    return this.#items.length === 0;
  }
  *[Symbol.iterator]() {
    for (let i = 0; i < this.#items.length; i++) {
      yield this.#items[i];
    }
  }
}
