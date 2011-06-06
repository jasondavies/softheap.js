// Based on "A simpler implementation and analysis of Chazelle’s Soft Heaps" by
// Haim Kaplan and Uri Zwick;
// <http://www.siam.org/proceedings/soda/2009/SODA09_053_kaplanh.pdf>
(function(exports) {

  var EPSILON = 1/3,
      r = Math.ceil(Math.log(1 / EPSILON) / Math.LN2) + 5;

  function leaf(x) {
    return x.left === null && x.right === null;
  }

  function sift(x) {
    while (x.list.length < x.size && !leaf(x)) {
      if (x.left === null || (x.right !== null && x.left.ckey > x.right.ckey)) {
        var tmp = x.left;
        x.left = x.right;
        x.right = tmp;
      }
      x.list = x.list.concat(x.list, x.left.list);
      x.ckey = x.left.ckey;
      x.left.list = null;
      if (leaf(x.left))
        x.left = null;
      else
        sift(x.left);
    }
  }

  function combine(x, y) {
    var z = newNode();
    z.left = x;
    z.right = y;
    z.rank = x.rank + 1;
    z.size = (z.rank <= r) ? 1 : ((3 * x.size + 1) / 2);
    sift(z);
    return z;
  }

  function makeHeap(e) {
    return {
      first: makeTree(e),
      next: null,
      prev: null,
      rank: 0
    };
  }

  function meld(P, Q) {
    if (P.rank > Q.rank) {
      var tmp = P;
      P = Q;
      Q = tmp;
    }
    mergeInto(P, Q);
    repeatedCombine(Q, P.rank);
    return Q;
  }

  function insert(P, e) {
    return meld(P, makeHeap(e));
  }

  function extractMin(P) {
    if (P.first === null) return null;
    var T = P.first.sufmin;
    var x = T.root;
    var e = pickElem(x.list);
    if (x.list.length <= x.size / 2) {
      if (!leaf(x)) {
        sift(x);
        updateSuffixMin(T);
      } else if (x.list.length === 0) {
        removeTree(P, T);
      }
    }
    return e;
  }

  function mergeInto(P, Q) {
    if (P.rank > Q.rank) {
      throw {abort: "Error"};
    }
    var T1 = P.first;
    var T2 = Q.first;
    while (T1 !== null) {
      while (T1.rank > T2.rank)
        T2 = T2.next;
      var T1_ = T1.next;
      insertTree(Q, T1, T2);
      T1 = T1_;
    }
  }

  function repeatedCombine(Q, k) {
    var T = Q.first;
    while (T.next !== null) {
      if (T.rank === T.next.rank) {
        if (T.next.next === null || T.rank !== T.next.next.rank) {
          T.root = combine(T.root, T.next.root);
          T.rank = T.root.rank;
          removeTree(Q, T.next);
        }
      } else if (T.rank > k)
        break;
      T = T.next;
    }
    if (T.rank > Q.rank) Q.rank = T.rank;
    updateSuffixMin(T);
  }

  function updateSuffixMin(T) {
    while (T !== null && T.next !== null) {
      T.sufmin = T.root.ckey <= T.next.sufmin.root.ckey ? T : T.next.sufmin;
      T = T.prev;
    }
  }

  function insertTree(P, T1, T2) {
    T1.next = T2;
    if (T2.prev === null)
      P.first = T1;
    else
      T2.prev.next = T1;
  }

  function removeTree(P, T) {
    if (T.prev === null)
      P.first = T.next;
    else
      T.prev.next = T.next;
    if (T.next !== null)
      T.next.prev = T.prev;
  }

  function makeTree(e) {
    var T = {
      root: makeNode(e),
      next: null,
      prev: null,
      rank: 0
    };
    T.sufmin = T;
    return T;
  }

  function makeNode(e) {
    var x = newNode();
    x.list = [e];
    x.ckey = e.key;
    x.rank = 0;
    x.size = 1;
    x.left = null;
    x.right = null;
    return x;
  }

  function newNode() {
    return {list: [], ckey: null, rank: 0, size: 0, left: null, right: null};
  }

  function pickElem(l) {
    return l.splice(Math.floor(Math.random() * l.length))[0];
  }

  exports.makeHeap = makeHeap;
  exports.insert = insert;
  exports.extractMin = extractMin;

})(typeof exports !== "undefined" ? exports : this.SoftHeap = {});
