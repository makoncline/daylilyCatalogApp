// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getIsFree = (freeUntil: string | null | undefined) => {
  return true;
  // TODO: turn this back on once fixed
  // return freeUntil
  //   ? new Date() < new Date(freeUntil)
  //   : false;
};
