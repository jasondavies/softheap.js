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

The term "soft heap" stems from the fact that a fixed percentage of values have
their keys "corrupted".  The purpose of these corruptions is to lower the
information entropy of the data, enabling the data structure to break through
information-theoretic barriers regarding heaps.

[1]: http://www.siam.org/proceedings/soda/2009/SODA09_053_kaplanh.pdf
[2]: https://github.com/lowasser/SoftSelect
[3]: http://en.wikipedia.org/wiki/Soft_heap
