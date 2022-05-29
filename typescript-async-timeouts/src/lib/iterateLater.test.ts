import {iterateLater} from "./iterateLater";
import {ArrayJobRunningError} from "../type/Exceptions";

const measure = async (callable: () => Promise<void>): Promise<number> => {
  const startTime = new Date().getTime();
  await callable();
  const endTime = new Date().getTime();
  return endTime - startTime;
};

describe("iterateLater works", () => {
  it ("can be scheduled", async () => {
    const time = await measure(async () => {
      const results: string[] = [];
      await iterateLater(["ab", "cd", "ef"], (value) => { results.push(value); }, 30);
      expect(results).toStrictEqual(["ab", "cd", "ef"])
    });
    expect(time).toBeGreaterThan(89);
    expect(time).toBeLessThan(200);
  });

  it ("schedule immediately", async () => {
    const results: string[] = [];
    const time = await measure(async () => {
      await iterateLater(["ab", "cd", "ef"], (value) => { results.push(value); });
    });
    expect(results).toStrictEqual(["ab", "cd", "ef"])
    expect(time).toBeLessThan(20);
  });

  it ("When exception is thrown in 100ms", async () => {
    const results: string[] = [];
    const iterator = iterateLater(["ab", "cd", "ef"], (value) => {
      results.push(value);
      throw new Error("lorem ipsum est");
      }, 100);
    await expect(iterator).rejects.toThrowError(new Error("lorem ipsum est"));
    // let's try again
    iterator.cancel();
    await expect(iterator).rejects.toThrowError(new Error("lorem ipsum est"));
    expect(results).toStrictEqual(["ab"]);
  });

  it ("When exception is thrown", async () => {
    const results: string[] = [];
    const iterator = iterateLater(["ab", "cd", "ef"], (value) => {
      results.push(value);
      throw new Error("lorem ipsum est");
    });
    await expect(iterator).rejects.toThrowError(new Error("lorem ipsum est"));
    // let's try again
    iterator.cancel();
    await expect(iterator).rejects.toThrowError(new Error("lorem ipsum est"));
    expect(results).toStrictEqual(["ab"]);
  });

  it ("can be cancelled immediately", async () => {
    const results: string[] = [];
    const time = await measure(async () => {
      const iterator = iterateLater(["ab", "cd", "ef"], (value) => { results.push(value); }, 100);
      iterator.cancel();
      await expect(iterator).rejects.toThrowError(new ArrayJobRunningError(0));
      // let's try again
      iterator.cancel();
      await expect(iterator).rejects.toThrowError(new ArrayJobRunningError(0));
    });
    expect(results.length).toBe(0);
    expect(time).toBeLessThan(100);
  });

  it ("can be cancelled later", async () => {
    const results: string[] = [];
    const time = await measure(async () => {
      const iterator = iterateLater(["ab", "cd", "ef"], (value, index, cancel) => {
        if (index === 1) cancel();
        results.push(value);
        }, 30);
      await expect(iterator).rejects.toThrowError(new ArrayJobRunningError(1));
    });
    expect(results).toStrictEqual(["ab", "cd"]);
    expect(time).toBeGreaterThan(60);
    expect(time).toBeLessThan(200);
  });

  it ("might work a bit when no timeout even when cancelled", async () => {
    const results: string[] = [];
    const time = await measure(async () => {
      const iterator = iterateLater(["ab", "cd", "ef"], (value) => { results.push(value); });
      iterator.cancel();
      await expect(iterator).rejects.toThrowError(new ArrayJobRunningError(0));
      // let's try again
      iterator.cancel();
      await expect(iterator).rejects.toThrowError(new ArrayJobRunningError(0));
      iterator.cancel();
      await expect(iterator).rejects.toThrowError(new ArrayJobRunningError(0));
    });
    expect(results).toStrictEqual(["ab"]);
    expect(time).toBeLessThan(20);
  });

  it ("When no timeout we can strictly say when to stop", async () => {
    const results: string[] = [];
    const iterator = iterateLater(["ab", "cd", "ef"], (value, index, cancel) => {
      if (index === 1) cancel();
      results.push(value);
    });
    await expect(iterator).rejects.toThrowError(new ArrayJobRunningError(2));
    expect(results).toStrictEqual(["ab", "cd"]);
  });
});
