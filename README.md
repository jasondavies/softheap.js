softheap.js
===========

A JavaScript implementation of [A simpler implementation and analysis of
Chazelle’s Soft Heaps][1] by Haim Kaplan and Uri Zwick.

Based on a [Java implementation][2] by Louis Wasserman.

A [soft heap][3] is a variant on the simple heap data structure that has
constant amortised time for 5 types of operations:

 * create
 * insert
 * meld
 * delete
 * findmin

This package currently exposes a smaller API:

```sh
npm install softheap
```

```js
import SoftHeap from "softheap";

const heap = new SoftHeap();
heap.insert(5);
heap.insert(1);

heap.findMin(); // 1
heap.extractMin(); // 1
```

 * `new SoftHeap([compare])`
 * `heap.insert(value)`
 * `heap.findMin()`
 * `heap.extractMin()`
 * `heap.size`

`compare` defaults to numeric ascending order. Stored values must be handled by
the comparator you provide.

`findMin()` peeks the same value the next `extractMin()` call would return,
without removing it.

This package is published as ESM.

`meld` and `delete` are not implemented by this package.

The term "soft heap" stems from the fact that a fixed percentage of values have
their keys "corrupted".  The purpose of these corruptions is to lower the
information entropy of the data, enabling the data structure to break through
information-theoretic barriers regarding heaps.

[1]: https://doi.org/10.1137/1.9781611973068.53
[2]: https://github.com/lowasser/SoftSelect
[3]: http://en.wikipedia.org/wiki/Soft_heap
