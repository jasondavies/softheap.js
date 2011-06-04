softheap.js
===========

A JavaScript implementation of [A simpler implementation and analysis of
Chazelle’s Soft Heaps][1] by Haim Kaplan and Uri Zwick.

[1]: http://www.siam.org/proceedings/soda/2009/SODA09_053_kaplanh.pdf

**Note**: There appears to be a serious bug, which is that `extractMin` doesn't
work after calling `insert`.  Watch this space.
