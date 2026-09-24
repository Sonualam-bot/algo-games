// Named ListNode (not Node) to avoid shadowing the browser's global DOM `Node`.
class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
    this.prev = null;
  }
}

export class DoublyLinkedList {
  // Private: outside code can read list.size but can't overwrite it.
  #size = 0;

  constructor() {
    // Sentinel (dummy) nodes: always present, never hold real data.
    // Every real node always has a neighbor on both sides, so there are no
    // null checks or empty-list special cases in add/remove.
    // Empty list: head <-> tail
    this.head = new ListNode(null);
    this.tail = new ListNode(null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get size() {
    return this.#size;
  }

  addFirst(val) {
    const node = new ListNode(val);
    /**
     * temp = current first node, or the TAIL sentinel if the list is empty.
     * It is never null (sentinels!). Save it before head.next is overwritten.
     */
    const temp = this.head.next;

    // link node <-> temp
    temp.prev = node;
    node.next = temp;

    // link head <-> node
    this.head.next = node;
    node.prev = this.head;

    // head <-> node <-> temp
    this.#size++;
  }

  addLast(val) {
    const node = new ListNode(val);
    /**
     * temp = current last node, or the HEAD sentinel if the list is empty.
     * Never null. The new node goes between temp and the TAIL sentinel.
     */
    const temp = this.tail.prev;

    // link temp <-> node
    temp.next = node;
    node.prev = temp;

    // link node <-> tail
    node.next = this.tail;
    this.tail.prev = node;

    // temp <-> node <-> tail
    this.#size++;
  }

  removeLast() {
    if (this.#size < 1) {
      throw new Error("No elements to remove");
    }

    const lastNode = this.tail.prev;
    // Node before the last one (HEAD sentinel if only one element).
    // This lookup is O(1) only because of the prev pointer.
    const temp = lastNode.prev;

    // link temp <-> tail, skipping lastNode
    this.tail.prev = temp;
    temp.next = this.tail;

    // detach the removed node so it clearly points nowhere
    lastNode.prev = null;
    lastNode.next = null;

    this.#size--;
    return lastNode.val;
  }

  getFirst() {
    if (this.#size < 1) {
      throw new Error("List is empty");
    }
    return this.head.next.val;
  }

  getLast() {
    if (this.#size < 1) {
      throw new Error("List is empty");
    }
    return this.tail.prev.val;
  }

  // Makes the list iterable: for (const v of list), [...list], Array.from(list).
  // Walk from the first real node until we reach the TAIL sentinel.
  // Empty list: head.next is already tail, so the loop body never runs.
  *[Symbol.iterator]() {
    let current = this.head.next;
    while (current !== this.tail) {
      yield current.val;
      current = current.next;
    }
  }
}
