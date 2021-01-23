export function deepFind(obj, props) {
  if (!obj) {
    return null;
  }

  return props.reduce((result, prop) => {
    return result == null ? null : result[prop];
  }, obj);
}
