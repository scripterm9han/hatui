import "@testing-library/jest-dom";

// Expose standard TextEncoder/TextDecoder and streams which are missing in Jest's jsdom env
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { ReadableStream } = require("node:stream/web");
global.ReadableStream = ReadableStream;

const { MessageChannel, MessagePort } = require("worker_threads");
global.MessageChannel = MessageChannel;
global.MessagePort = MessagePort;

// Restore global Web API classes which JSDOM clears out
const undici = require("undici");
if (!global.Request) {
  global.Request = undici.Request;
}
if (!global.Response) {
  global.Response = undici.Response;
}
if (!global.Headers) {
  global.Headers = undici.Headers;
}

// Mock fetch globally
global.fetch = jest.fn();

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn().mockReturnValue(null),
    };
  },
}));
