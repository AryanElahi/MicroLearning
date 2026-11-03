const otp = require("../../src/services/otp.services");
const logger = require("../../src/utils/logger");

const PHONE = "09120000000";

const sendAndCapture = async () => {
  const spy = jest.spyOn(logger, "warn").mockImplementation(() => {});
  await otp.sendCode(PHONE);
  const message = spy.mock.calls[0][0];
  spy.mockRestore();
  return message.match(/(\d{5})$/)[1];
};

describe("otp service", () => {
  beforeEach(() => otp.clearStore());
  afterEach(() => jest.useRealTimers());

  it("generates 5-digit codes that verify exactly once", async () => {
    const code = await sendAndCapture();
    expect(code).toMatch(/^\d{5}$/);
    expect(otp.verifyCode(PHONE, code)).toBe(true);
    expect(otp.verifyCode(PHONE, code)).toBe(false);
  });

  it("rejects wrong codes and locks after too many attempts", async () => {
    const code = await sendAndCapture();
    const wrong = code === "11111" ? "22222" : "11111";
    for (let i = 0; i < 5; i += 1) expect(otp.verifyCode(PHONE, wrong)).toBe(false);
    expect(otp.verifyCode(PHONE, code)).toBe(false);
  });

  it("expires codes", async () => {
    jest.useFakeTimers({ now: Date.now() });
    const code = await sendAndCapture();
    jest.advanceTimersByTime(121 * 1000);
    expect(otp.verifyCode(PHONE, code)).toBe(false);
  });
});
