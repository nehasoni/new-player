export default function() {
  var eme = "MediaKeys" in window || "WebKitMediaKeys" in window || "MSMediaKeys" in window;
  if (eme) {
    return true;
  }
  return false;
};
