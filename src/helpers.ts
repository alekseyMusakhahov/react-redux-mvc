import {mergeWith, isArray} from 'lodash';

export function merge(dst, src) {
  // чтобы не мержить массиы, возвращается исходный
  if (isArray(dst) && isArray(src)) {
    return src;
  }
  else {
    return {
      ...mergeWith(dst, src, (objValue, srcValue) => {
        // чтобы не мержить массиы, возвращается исходный
        if (isArray(objValue)) {
          return srcValue;
        }
      })
    };
  }
}

export function generateGuid(): string {
  const S4 = (): string => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
}