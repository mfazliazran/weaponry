setDebug(true);

__defineGetter__("someProperty", function () { evalInFrame(1, "var x = 'success'"); });
function caller(obj) {
  assertJit();
  obj.someProperty;
  return x;
}
assertEq(caller(this), "success");
