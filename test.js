var SoftHeap = typeof window === "undefined" ? require("./softheap").SoftHeap : SoftHeap;

var MAX = 1000000;

var h = new SoftHeap();
var start = +new Date;
for (var i=0; i<MAX; i++) {
  h.insert(Math.floor(Math.random() * 1e6));
}
console.log(1000 * ((+new Date) - start) / MAX + " µs per insert");
var start = +new Date;
for (var i=0; i<MAX; i++) {
  h.extractMin();
}
console.log(1000 * ((+new Date) - start) / MAX + " µs per extractMin");
