# Notes

State-of-the-art writing on tree-edit distance describes solutions based
on three kinds of edit operations:

1.  _insert_ a node between existing children

2.  _delete_ a node, promoting all of the deleted node's children to
    children of the deleted node's parent, preserving traversal order

3.  _update_ a node by changing its label

4.  _match_ a node in the input tree to a node in the output tree

RFC6902's edit operations differ:

1.  _add_ an Array element or Object property

2.  _remove_ an Array element or Object property

3.  _replace_ a value

4.  _move_, equivalent to a _remove_ and _insert_ for the same value,
    at different paths

5.  _copy_, equivalent to an _insert_ for the same value

6.  _test_, for making sure patches apply cleanly

Tree-edit _insert_ and _delete_ differ from RFC6902 _add_ and _remove_
in that RFC6902 values add and remove nested values.

A _remove_ on a value like `[[]]` removes two Arrays.  A _delete_ on the
containing Array would remove just that Array, promoting the remaining
Array into its place.

An _add_ with a value like `[[]]` adds two Arrays.  Tree-edit algorithms
will return edit scripts with two _insert_ operations, one for each Array.
