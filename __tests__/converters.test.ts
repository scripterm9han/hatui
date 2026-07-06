describe("Unit Converter Math Core", () => {
  // Test length conversions
  test("Length Conversion Logic", () => {
    const metersToFtRatio = 3.28084;
    const value = 10;
    const result = value * metersToFtRatio;
    expect(result).toBeCloseTo(32.8084, 4);
  });

  // Test weight conversions
  test("Weight Conversion Logic", () => {
    const kgToLbRatio = 2.20462;
    const value = 5;
    const result = value * kgToLbRatio;
    expect(result).toBeCloseTo(11.0231, 4);
  });

  // Test temperature conversions
  test("Temperature Celsius to Fahrenheit", () => {
    const celsius = 100;
    const fahrenheit = celsius * 1.8 + 32;
    expect(fahrenheit).toBe(212);
  });

  test("Temperature Fahrenheit to Celsius", () => {
    const fahrenheit = 32;
    const celsius = (fahrenheit - 32) / 1.8;
    expect(celsius).toBe(0);
  });
});

describe("JSON Formatter Utilities", () => {
  const rawJson = '{"name":"Hatiyar","isAwesome":true,"version":1}';

  test("Formats JSON with 2 spaces", () => {
    const parsed = JSON.parse(rawJson);
    const formatted = JSON.stringify(parsed, null, 2);
    expect(formatted).toContain("  ");
    expect(formatted).toContain("\n");
  });

  test("Minifies JSON", () => {
    const parsed = JSON.parse(rawJson);
    const minified = JSON.stringify(parsed);
    expect(minified).not.toContain("\n");
    expect(minified).not.toContain(" ");
  });

  test("Detects Invalid JSON", () => {
    const badJson = '{"name": "Hatiyar", version}'; // missing value
    expect(() => JSON.parse(badJson)).toThrow();
  });
});

describe("Regex Matching Utility", () => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const testText = "Email us at developer@hatiyar.in or support@hatiyar.in";

  test("Finds email addresses in text", () => {
    const matches = testText.match(emailRegex);
    expect(matches).toHaveLength(2);
    expect(matches?.[0]).toBe("developer@hatiyar.in");
    expect(matches?.[1]).toBe("support@hatiyar.in");
  });

  test("Captures groups from match", () => {
    const regex = /(\d+)\s+items/i;
    const text = "Found 42 items in list";
    const match = text.match(regex);
    expect(match).not.toBeNull();
    expect(match?.[1]).toBe("42");
  });
});
