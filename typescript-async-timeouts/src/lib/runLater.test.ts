import {runLater} from "./runLater";

const measure = async (callable: () => Promise<void>): Promise<number> => {
  const startTime = new Date().getTime();
  await callable();
  const endTime = new Date().getTime();
  return endTime - startTime;
};

describe("runLater works", () => {
  const mockCallback = jest.fn();
  beforeEach(() => {
    mockCallback.mockReset();
    mockCallback.mockReturnValue("abc");
  });

  it ("can be scheduled", async () => {
    const time = await measure(async () => {
      await expect(runLater(mockCallback, 100)).resolves.toBe("abc");
    });
    expect(mockCallback).toBeCalledTimes(1);
    expect(time).toBeGreaterThan(100);
    expect(time).toBeLessThan(200);
  });

  it ("schedule immediately", async () => {
    const time = await measure(async () => {
      await expect(runLater(mockCallback)).resolves.toBe("abc");
    });
    expect(mockCallback).toBeCalledTimes(1);
    expect(time).toBeLessThan(10);
  });

  it ("When exception is thrown in 100ms", async () => {
    const result = runLater(() =>{
      throw new Error("lorem ipsum est")
    } , 100);
    await expect(result).rejects.toThrowError(new Error("lorem ipsum est"));
    // let's try again
    result.cancel();
    await expect(result).rejects.toThrowError(new Error("lorem ipsum est"));
  });

  it ("When exception is thrown", async () => {
    const result = runLater(() =>{
      throw new Error("lorem ipsum est")
    });
    await expect(result).rejects.toThrowError(new Error("lorem ipsum est"));
    // let's try again
    result.cancel();
    await expect(result).rejects.toThrowError(new Error("lorem ipsum est"));
  });

  it ("can be cancelled", async () => {
    const time = await measure(async () => {
      const result = runLater(mockCallback, 1000);
      result.cancel();
      await expect(result).rejects.toThrowError(new Error("Method cancelled!"));
      // let's try again
      result.cancel();
    });
    expect(mockCallback).toBeCalledTimes(0);
    expect(time).toBeLessThan(100);
  });

  it ("will not be cancelled when scheduled immediately", async () => {
    const result = runLater(mockCallback);
    result.cancel();
    await expect(result).rejects.toThrowError(new Error("Method cancelled!"));
    // let's try again
    result.cancel();
    expect(mockCallback).toBeCalledTimes(1);
  });
});
