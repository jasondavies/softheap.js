var SoftHeap = typeof window === "undefined" ? require("./softheap").SoftHeap : SoftHeap;

var MAX = 1000000;

for (var j=1; j<100; j+=10) {
  var h = new SoftHeap();
  var max = MAX / j;
  var start = +new Date;
  for (var i=0; i<max; i++) {
    h.insert(Math.floor(Math.random() * 1e6));
  }
  console.log(1000 * ((+new Date) - start) / max + " us per insert");
  var start = +new Date;
  for (var i=0; i<max; i++) {
    h.extractMin();
  }
  console.log(1000 * ((+new Date) - start) / max + " us per extractMin");
}
