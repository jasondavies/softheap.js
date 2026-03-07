import test from "node:test";
import assert from "node:assert/strict";

import SoftHeap from "./softheap.js";

function getRootRanks(heap) {
  var ranks = [];
  for (var tree = heap.first; tree !== null; tree = tree.next) {
    ranks.push(tree.root.rank);
  }
  return ranks;
}

test("insert consolidates roots until ranks differ", function() {
  var heap = new SoftHeap();
  for (var i = 0; i < 64; i++) {
    heap.insert(i);
  }

  var ranks = getRootRanks(heap);
  for (var i = 1; i < ranks.length; i++) {
    assert.ok(
      ranks[i - 1] < ranks[i],
      "root ranks should increase strictly: " + JSON.stringify(ranks)
    );
  }

  assert.equal(heap.rank, ranks[ranks.length - 1]);
  assert.ok(heap.rank > 0);
});

test("extractMin returns the inserted multiset", function() {
  var values = [5, 1, 3, 2, 4, 1, 0, 9, 7, 6];
  var heap = new SoftHeap();

  values.forEach(function(value) {
    heap.insert(value);
  });

  var extracted = [];
  while (heap.size) {
    extracted.push(heap.extractMin());
  }

  extracted.sort(function(a, b) { return a - b; });
  values.sort(function(a, b) { return a - b; });
  assert.deepEqual(extracted, values);
});

test("insert can store undefined without creating an empty payload list", function() {
  var heap = new SoftHeap();

  heap.insert(undefined);

  assert.equal(heap.size, 1);
  assert.equal(heap.extractMin(), undefined);
  assert.equal(heap.size, 0);
});

test("findMin peeks the next extracted value without removing it", function() {
  var heap = new SoftHeap();
  [5, 1, 3, 2, 4].forEach(function(value) {
    heap.insert(value);
  });

  var before = heap.size;
  var peeked = heap.findMin();

  assert.equal(heap.size, before);
  assert.equal(heap.findMin(), peeked);
  assert.equal(heap.extractMin(), peeked);
  assert.equal(heap.size, before - 1);
});

test("findMin throws on an empty heap", function() {
  var heap = new SoftHeap();

  assert.throws(function() {
    heap.findMin();
  }, function(error) {
    return error && error.error === "empty!";
  });
});
