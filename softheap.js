// Implementation of "A simpler implementation and analysis of Chazelle's Soft
// Heaps" by Haim Kaplan and Uri Zwick;
// <http://www.siam.org/proceedings/soda/2009/SODA09_053_kaplanh.pdf>
//
// Based on a Java implementation by Louis Wasserman;
// <https://github.com/lowasser/SoftSelect>
(function(exports) {

  var EPSILON = 1 / 3,
      r = Math.ceil(Math.log(1 / EPSILON) / Math.LN2) + 5;

  function pick(list) {
    // Picks an arbitrary element and removes from the list.
    var node = list.head,
        e = node.e;
    list.head = node.next;
    list.size--;
    if (list.head === null) list.tail = null;
    return e;
  }

  function LinkedListNode(e) {
    this.e = e;
    this.next = null;
  }

  function LinkedList(e) {
    if (e !== undefined) {
      this.head = this.tail = new LinkedListNode(e);
      this.size = 1;
    } else {
      this.head = this.tail = null;
      this.size = 0;
    }
  }

  LinkedList.prototype.clear = function() {
    this.head = this.tail = null;
    this.size = 0;
  }

  function Heap(compare) {
    compare = compare || function(a, b) { return a - b; };

    function Node(left, right) {
      if (right === undefined) { // e = left
        this.ckey = left;
        this.rank = 0;
        this.left = this.right = null;
        this.list = new LinkedList(left);
        this.size = 1;
      } else {
        this.ckey = null;
        this.rank = left.rank + 1;
        this.left = left;
        this.right = right;
        this.list = new LinkedList();
        this.size = this.rank <= r ? 1 : (3 * left.size + 1) / 2;
        this.sift();
      }
    }

    Node.prototype.sift = function() {
      var n = this;
      var list = n.list;
      while (list.size < n.size && (n.left !== null || n.right !== null)) {
        var left = n.left,
            right = n.right;
        if (right !== null && compare(left.ckey, right.ckey) > 0) {
          n.right = left;
          left = n.left = right;
        }

        // concat
        if (list.head === null) list.head = left.list.head;
        else list.tail.next = left.list.head;
        list.size += left.list.size;
        list.tail = left.list.tail;

        n.ckey = left.ckey;
        if (left.left !== null || left.right !== null) {
          left.list.clear();
          left.sift();
        } else {
          n.left = n.right;
          n.right = null;
        }
      }
    };

    function Tree(e) {
      this.root = new Node(e);
      this.next = this.prev = null;
      this.suffixMin = this;
    }

    function updateSuffixMin(t) {
      return t.suffixMin = (t.next !== null
        ? compare(t.root.ckey, getSuffixMin(t.next).root.ckey) < 0
          ? t : t.next.suffixMin
        : t);
    }

    function getSuffixMin(t) {
      return t.suffixMin.root === null ? updateSuffixMin(t) : t.suffixMin;
    }

    var heap = {
      first: null,
      rank: 0,
      size: 0
    };
 
    heap.insert = function(e) {
      if (this.first === null) {
        this.first = new Tree(e);
        this.size = 1;
      } else {
        var t2 = this.first;
        var t1 = this.first = new Tree(e);
        t1.next = t2;
        t2.prev = t1;
        var lastChanged = t1;
        do {
          t2 = t1.next;
          if (t1.root.rank === t2.root.rank) {
            var t2Root = t2.root.ckey;
            t1.root = new Node(t1.root, t2.root);
            if (t1.root.ckey == t2Root) {
              t1.suffixMin = t2.suffixMin;
            } else {
              lastChanged = t1;
            }
            t1.next = t2.next;
            t2.root = null;
            if (t2.next !== null) {
              t2.next.prev = t1;
            } else {
              break;
            }
          } else if (t1.rank > 0) {
            break;
          }
          t1 = t1.next;
        } while (t1.next !== null)
        if (t1.rank > this.rank) {
          this.rank = t1.rank;
        }
        this.updateSuffixMin(lastChanged);
        this.size++;
      }
      return true;
    };

    heap.removeTree = function(t) {
      if (t.prev !== null) {
        t.prev.next = t.next;
      } else {
        this.first = t.next;
      }
      if (t.next !== null) {
        t.next.prev = t.prev;
      }
      t.root = null;
    };

    heap.updateSuffixMin = function(t) {
      for (; t !== null; t = t.prev) {
        updateSuffixMin(t);
      }
    };

    heap.extractMin = function() {
      if (this.first === null) {
        throw {"error": "empty!"};
      }
      var t = getSuffixMin(this.first),
          x = t.root,
          e = pick(x.list);
      if (x.list.size * 2 <= x.size) {
        if (x.left !== null || x.right !== null) {
          x.sift();
          this.updateSuffixMin(t);
        } else if (x.list.head === null) {
          this.removeTree(t);
        }
      }
      this.size--;
      return e;
    };

    return heap;
  }

  exports.SoftHeap = Heap;

})(typeof exports !== "undefined" ? exports : this);
