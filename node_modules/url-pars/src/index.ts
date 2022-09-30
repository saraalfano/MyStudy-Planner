/**
 * url 地址拼接。"https://www.abc.com?t=55", { par1: "abc", par2: "123" } => https://www.abc.com?t=55&par1=abc&par2=123
 * @param url
 * @param pars
 */
export function urlPars(url: string, pars?: { [key: string]: string }) {
  const urlStr = url.trim().replace(/[\?\&]*$/, ""); // 去掉结尾的 ?&

  if (!pars) {
    return urlStr;
  }

  const list: string[] = [];
  Object.getOwnPropertyNames(pars).map(key => {
    list.push(`${key}=${encodeURIComponent(pars[key])}`);
  });
  const urlParsStr = list.join("&");
  if (urlStr.indexOf("?") > -1) {
    return `${urlStr}&${urlParsStr}`;
  } else {
    return `${urlStr}?${urlParsStr}`;
  }
}
