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

test("small heaps peek and extract values in ascending order", function() {
  var values = [5, 1, 3, 2, 4, 1, 0, 9, 7, 6];
  var heap = new SoftHeap();

  values.forEach(function(value) {
    heap.insert(value);
  });

  // This heap is below the corruption threshold, so its order must be exact.
  values.sort(function(a, b) { return a - b; });
  var extracted = [];
  while (heap.size) {
    assert.equal(heap.findMin(), values[extracted.length]);
    extracted.push(heap.extractMin());
  }

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

  assert.equal(peeked, 1);
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

test("node target sizes follow the integer recurrence above rank 7", function() {
  var heap = new SoftHeap();
  var expectedSizes = new Map([[128, 1], [256, 2], [512, 3], [1024, 5], [2048, 8], [4096, 12]]);

  for (var count = 1; count <= 4096; count++) {
    heap.insert(count);
    if (expectedSizes.has(count)) {
      assert.equal(heap.first.root.size, expectedSizes.get(count), "after " + count + " inserts");
    }
  }
});

for (var scenario of [
  {
    name: "default numeric comparator",
    compare: undefined,
    order: function(a, b) { return a - b; },
    value: function(id, key) { return key * 8192 + id; }
  },
  {
    name: "descending object comparator with duplicate keys",
    compare: function(a, b) { return b.key - a.key; },
    order: function(a, b) { return b.key - a.key; },
    value: function(id, key) { return {id: id, key: key}; }
  }
]) {
  testLargeMixedHeap(scenario);
}

function testLargeMixedHeap(scenario) {
  test("large mixed heap selects minima, preserves values and bounds corruption: " + scenario.name, function() {
    var heap = new SoftHeap(scenario.compare);
    var live = new Set();
    var inserted = 0;
    var seed = 731;
    var sawCorruption = false;

    function random() {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    }

    function insert() {
      var value = scenario.value(inserted++, Math.floor(random() * 257));
      heap.insert(value);
      live.add(value);
      assert.equal(heap.size, live.size);
    }

    function extract() {
      var before = heap.size;
      // Scan current root keys independently of the cached suffix minima.
      // Original payload keys may be smaller because of corruption.
      var minimumKey = heap.first.root.ckey;
      for (var tree = heap.first; tree !== null; tree = tree.next) {
        if (scenario.order(tree.root.ckey, minimumKey) < 0) minimumKey = tree.root.ckey;
      }
      var candidates = new Set();
      for (var tree = heap.first; tree !== null; tree = tree.next) {
        if (scenario.order(tree.root.ckey, minimumKey) === 0) {
          candidates.add(tree.root.list.head.e);
        }
      }
      var peeked = heap.findMin();
      assert.ok(candidates.has(peeked), "peek must come from a root with the minimum current key");
      assert.equal(heap.findMin(), peeked);
      assert.equal(heap.size, before);
      assert.equal(heap.extractMin(), peeked);
      assert.ok(live.delete(peeked), "extracted value must still be present");
      assert.equal(heap.size, live.size);
    }

    function checkCorruption() {
      var seen = new Set();
      var corrupt = 0;

      function visit(node) {
        for (var item = node.list.head; item !== null; item = item.next) {
          assert.ok(live.has(item.e));
          assert.ok(!seen.has(item.e), "each inserted value must occur once");
          seen.add(item.e);
          var order = scenario.order(item.e, node.ckey);
          assert.ok(order <= 0, "corrupted keys must only increase in comparator order");
          if (order < 0) corrupt++;
        }
        if (node.left !== null) visit(node.left);
        if (node.right !== null) visit(node.right);
      }

      for (var tree = heap.first; tree !== null; tree = tree.next) visit(tree.root);
      assert.equal(seen.size, live.size);
      // EPSILON is 1/3; its bound uses total insertions, not current heap size.
      assert.ok(corrupt <= inserted / 3, "corruption must stay within the error bound");
      sawCorruption = sawCorruption || corrupt > 0;
    }

    for (var i = 0; i < 4096; i++) {
      insert();
      if (i % 128 === 127) checkCorruption();
    }
    for (var i = 0; i < 2048; i++) {
      if (random() < 0.6) insert();
      else extract();
      if (i % 128 === 127) checkCorruption();
    }
    while (heap.size) {
      extract();
      if (heap.size % 128 === 0) checkCorruption();
    }
    assert.ok(sawCorruption, "the workload must exercise corrupted keys");
    assert.equal(heap.first, null);
    // Reuse the heap after fully draining it.
    insert();
    extract();
    checkCorruption();
  });
}
