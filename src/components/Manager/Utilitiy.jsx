export const ellipsisString = (str, num) => {
  if (typeof str == 'string' && str.length > num) {
    return str.slice(0, num) + '...';
  } else {
    return str;
  }
};
