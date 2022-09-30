import { expect } from "chai";
import "mocha";
import { urlPars } from "../src/index";

describe("index", function() {
  before(() => {
    // clearTestFiles();
    // initTestFiles();
  });

  after(() => {
    // clearTestFiles();
  });

  it("urlPars ", () => {
    expect(urlPars("https://www.abc.com")).to.equal(`https://www.abc.com`);
    expect(urlPars("https://www.abc.com?")).to.equal(`https://www.abc.com`);
    expect(urlPars("https://www.abc.com?&")).to.equal(`https://www.abc.com`);
    expect(urlPars("https://www.abc.com", { par1: "abc", par2: "123" })).to.equal(`https://www.abc.com?par1=abc&par2=123`);
    expect(urlPars("https://www.abc.com?", { par1: "abc", par2: "123" })).to.equal(`https://www.abc.com?par1=abc&par2=123`);
    expect(urlPars("https://www.abc.com?t=55", { par1: "abc", par2: "123" })).to.equal(`https://www.abc.com?t=55&par1=abc&par2=123`);
    expect(urlPars("https://www.abc.com?t=55", { par1: "", par2: "" })).to.equal(`https://www.abc.com?t=55&par1=&par2=`);
    expect(urlPars("https://www.abc.com?t=55", { par1: "abc==", par2: "abc++" })).to.equal(`https://www.abc.com?t=55&par1=abc%3D%3D&par2=abc%2B%2B`);
  });
});
