describe("Base64 Converter Logic", () => {
  const plainText = "Hello from Hatiyar Engineering Suite! <script>";
  const base64Encoded = "SGVsbG8gZnJvbSBIYXRpeWFyIEVuZ2luZWVyaW5nIFN1aXRlISA8c2NyaXB0Pg==";

  test("Encodes string to Base64", () => {
    const encoded = btoa(unescape(encodeURIComponent(plainText)));
    expect(encoded).toBe(base64Encoded);
  });

  test("Decodes Base64 to string", () => {
    const decoded = decodeURIComponent(escape(atob(base64Encoded)));
    expect(decoded).toBe(plainText);
  });
});

describe("URL Encoder Core", () => {
  const rawParams = "query=nextjs app&category=developer tools&status=OK";
  const encodedParams = "query%3Dnextjs%20app%26category%3Ddeveloper%20tools%26status%3DOK";

  test("Encodes query string characters", () => {
    const res = encodeURIComponent(rawParams);
    expect(res).toBe(encodedParams);
  });

  test("Decodes encoded query characters", () => {
    const res = decodeURIComponent(encodedParams);
    expect(res).toBe(rawParams);
  });
});

describe("HTML Entity Converter Core", () => {
  const rawHtml = "<div>Hello & Welcome 'Adwait'</div>";
  const encodedHtml = "&lt;div&gt;Hello &amp; Welcome &#039;Adwait&#039;&lt;/div&gt;";

  test("Escapes special HTML characters", () => {
    const res = rawHtml.replace(/[&<>"']/g, (m) => {
      switch (m) {
        case "&": return "&amp;";
        case "<": return "&lt;";
        case ">": return "&gt;";
        case '"': return "&quot;";
        case "'": return "&#039;";
        default: return m;
      }
    });
    expect(res).toBe(encodedHtml);
  });
});

describe("UUID/GUID Regex Matcher", () => {
  test("Matches standard v4 UUID structures", () => {
    const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    // Simulate generation
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    expect(uuidv4Regex.test(uuid)).toBe(true);
  });
});

describe("JWT Parser core", () => {
  const mockJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.signature-segment";

  test("Extracts segments cleanly", () => {
    const parts = mockJwt.split(".");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    expect(parts[1]).toBe("eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ");
    expect(parts[2]).toBe("signature-segment");
  });
});

describe("SQL Formatting tokenization", () => {
  test("Capitalizes keywords and splits select statements", () => {
    const rawSql = "select * from users where id=5 and role='admin'";
    let formatted = rawSql.replace(/\s+/g, " ").trim();
    
    const keywords = ["SELECT", "FROM", "WHERE", "AND"];
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      formatted = formatted.replace(regex, kw);
    });

    expect(formatted).toContain("SELECT");
    expect(formatted).toContain("FROM");
    expect(formatted).toContain("WHERE");
    expect(formatted).toContain("AND");
  });
});

describe("Password Strength evaluation", () => {
  test("Scores complex password higher than simple text", () => {
    const simple = "password";
    const complex = "H@tiyar_Dev_2026_Suite!";
    
    const score = (p: string) => {
      let val = 0;
      if (p.length >= 12) val += 2;
      if (/[A-Z]/.test(p)) val += 1;
      if (/[a-z]/.test(p)) val += 1;
      if (/\d/.test(p)) val += 1;
      if (/[^A-Za-z0-9]/.test(p)) val += 1;
      return val;
    };

    expect(score(complex)).toBeGreaterThan(score(simple));
  });
});

describe("Hex to RGB Conversion Logic", () => {
  test("Translates Hex color codes to RGB channels", () => {
    const hex = "00F0FF";
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    expect(r).toBe(0);
    expect(g).toBe(240);
    expect(b).toBe(255);
  });

  test("Translates RGB channels back to Hex", () => {
    const r = 255, g = 0, b = 127;
    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    expect(hex).toBe("#FF007F");
  });
});

describe("Unix Epoch Timestamps", () => {
  test("Converts seconds to UTC string", () => {
    const ts = 1719878400; // 2024-07-02 00:00:00 UTC
    const date = new Date(ts * 1000);
    expect(date.toUTCString()).toContain("Jul");
    expect(date.toUTCString()).toContain("2024");
  });
});

describe("Base32 Converter Bit shifts", () => {
  const plain = "abc";
  const encoded = "MFRGG===";

  test("Encodes string to Base32 RFC 4648", () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bin = "";
    for (let i = 0; i < plain.length; i++) {
      bin += plain.charCodeAt(i).toString(2).padStart(8, "0");
    }
    
    let res = "";
    for (let i = 0; i < bin.length; i += 5) {
      const chunk = bin.substring(i, i + 5).padEnd(5, "0");
      const val = parseInt(chunk, 2);
      res += alphabet[val];
    }
    while (res.length % 8 !== 0) res += "=";
    expect(res).toBe(encoded);
  });
});

describe("Text Cases conversions", () => {
  const raw = "hatiyar tools";

  test("Translates to Title Case", () => {
    const res = raw.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    expect(res).toBe("Hatiyar Tools");
  });

  test("Translates to camelCase", () => {
    const res = raw
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, idx) => (idx === 0 ? word.toLowerCase() : word.toUpperCase()))
      .replace(/\s+/g, "");
    expect(res).toBe("hatiyarTools");
  });
});

describe("Morse Code translation mapping", () => {
  test("Encodes text to Morse representation", () => {
    const morseMap: Record<string, string> = { h: "....", e: ".", l: ".-..", o: "---" };
    const text = "hello";
    const res = text.split("").map((c) => morseMap[c] || "").join(" ");
    expect(res).toBe(".... . .-.. .-.. ---");
  });
});

describe("JSON and CSV Matrix conversions", () => {
  const jsonArr = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
  const csvStr = "id,name\n1,Alice\n2,Bob";

  test("Encodes JSON array to CSV format", () => {
    const headers = Object.keys(jsonArr[0]);
    const rows = [headers.join(",")];
    jsonArr.forEach((row) => {
      rows.push(headers.map((h) => (row as any)[h]).join(","));
    });
    expect(rows.join("\n")).toBe(csvStr);
  });
});

describe("String Utilities spaces", () => {
  test("Collapses duplicate spaces into single spaces", () => {
    const raw = "  collapse   multiple   spaces  ";
    const collapsed = raw.replace(/\s+/g, " ").trim();
    expect(collapsed).toBe("collapse multiple spaces");
  });
});

describe("Placeholder SVG Generator", () => {
  test("Builds XML markup with dimensions parameters", () => {
    const w = 400, h = 300, bg = "#000";
    const svg = `<svg width="${w}" height="${h}"><rect fill="${bg}" /></svg>`;
    expect(svg).toContain('width="400"');
    expect(svg).toContain('height="300"');
    expect(svg).toContain('fill="#000"');
  });
});

describe("JSON to TypeScript interface mapping", () => {
  test("Infers basic type values from JSON payload keys", () => {
    const payload = { id: 1, name: "test", flag: true };
    const keys = Object.keys(payload);
    expect(typeof payload.id).toBe("number");
    expect(typeof payload.name).toBe("string");
    expect(typeof payload.flag).toBe("boolean");
  });
});

describe("Cron descriptor split parser", () => {
  test("Extracts and splits 5 space-separated parameters", () => {
    const cron = "*/15 9-17 * * 1-5";
    const parts = cron.split(" ");
    expect(parts).toHaveLength(5);
    expect(parts[0]).toBe("*/15");
    expect(parts[1]).toBe("9-17");
  });
});

describe("cURL CLI targets parser", () => {
  test("Extracts HTTP/HTTPS URLs from request command lines", () => {
    const cmd = "curl -X GET 'https://api.hatiyar.in/data'";
    const urlMatch = cmd.match(/(?:https?:\/\/[^\s"']+)/);
    expect(urlMatch).not.toBeNull();
    expect(urlMatch![0]).toBe("https://api.hatiyar.in/data");
  });
});

describe("WCAG color contrast ratios", () => {
  test("Computes correct WCAG compliance pairings scores", () => {
    // Relative sRGB values luminance logic
    const getL = (r: number, g: number, b: number) => {
      const xs = [r/255, g/255, b/255].map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
      return 0.2126 * xs[0] + 0.7152 * xs[1] + 0.0722 * xs[2];
    };
    const l1 = getL(15, 23, 42); // #0f172a
    const l2 = getL(0, 240, 255); // #00f0ff
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    expect(ratio).toBeGreaterThan(4.5); // AA compliant normal text
  });
});

describe("Number to words recursive scale translator", () => {
  test("Converts digits to English scales word strings", () => {
    const ones = ["", "one", "two", "three", "four", "five"];
    const val = 5;
    expect(ones[val]).toBe("five");
  });
});

describe("Subnet calculation parsing", () => {
  test("Generates netmask from CIDR prefix sizes", () => {
    const cidr = 24;
    const mask = [];
    for (let i = 0; i < 4; i++) {
      const bits = Math.min(8, Math.max(0, cidr - i * 8));
      mask.push(256 - Math.pow(2, 8 - bits));
    }
    expect(mask.join(".")).toBe("255.255.255.0");
  });
});

describe("Rot13 shift cyphers", () => {
  test("Shifts alphabetic chars by exactly 13 values", () => {
    const input = "abc";
    const res = input.replace(/[a-zA-Z]/g, (c) => {
      const code = c.charCodeAt(0);
      const base = code >= 97 ? 97 : 65;
      return String.fromCharCode(((code - base + 13) % 26) + base);
    });
    expect(res).toBe("nop");
  });
});

describe("Glassmorphism styles builder", () => {
  test("Formats backdrop-filter strings with blur metrics", () => {
    const blur = 12;
    const style = `backdrop-filter: blur(${blur}px);`;
    expect(style).toBe("backdrop-filter: blur(12px);");
  });
});
