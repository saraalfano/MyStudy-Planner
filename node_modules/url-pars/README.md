# install

```sh
npm i url-pars -D
```

# usage

```ts
import { urlPars } from "url-pars";

urlPars("https://www.abc.com");  // https://www.abc.com
urlPars("https://www.abc.com?");  // https://www.abc.com
urlPars("https://www.abc.com?&");  // https://www.abc.com
urlPars("https://www.abc.com", { par1: "abc", par2: "123" });  // https://www.abc.com?par1=abc&par2=123
urlPars("https://www.abc.com?", { par1: "abc", par2: "123" });  // https://www.abc.com?par1=abc&par2=123
urlPars("https://www.abc.com?t=55", { par1: "abc", par2: "123" });  // https://www.abc.com?t=55&par1=abc&par2=123
urlPars("https://www.abc.com?t=55", { par1: "", par2: "" });  // https://www.abc.com?t=55&par1=&par2=
urlPars("https://www.abc.com?t=55", { par1: "abc==", par2: "abc++" });  // https://www.abc.com?t=55&par1=abc%3D%3D&par2=abc%2B%2B
```
