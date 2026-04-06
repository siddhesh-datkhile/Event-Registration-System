import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
// @ts-expect-error missing in jsdom types
global.TextDecoder = TextDecoder

if (typeof global.Headers === 'undefined') {
  class TestHeaders {
    private readonly map = new Map<string, string>()

    constructor(init?: Record<string, string> | Array<[string, string]>) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.set(key, value))
      } else if (init) {
        Object.entries(init).forEach(([key, value]) => this.set(key, value))
      }
    }

    set(key: string, value: string) {
      this.map.set(key.toLowerCase(), String(value))
    }

    get(key: string) {
      return this.map.get(key.toLowerCase()) ?? null
    }
  }

  // @ts-expect-error missing in jsdom types
  global.Headers = TestHeaders
}

if (typeof global.Request === 'undefined') {
  class TestRequest {
    url: string
    method: string
    headers: InstanceType<typeof Headers>
    signal: AbortSignal | null
    body: BodyInit | null

    constructor(input: string | URL | { url: string }, init: RequestInit = {}) {
      this.url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      this.method = init.method ?? 'GET'
      this.headers = new Headers(init.headers as Record<string, string> | Array<[string, string]> | undefined)
      this.signal = init.signal ?? null
      this.body = init.body ?? null
    }

    clone() {
      return new TestRequest(this.url, {
        method: this.method,
        headers: this.headers as unknown as Record<string, string>,
        signal: this.signal ?? undefined,
        body: this.body ?? undefined,
      })
    }
  }

  // @ts-expect-error missing in jsdom types
  global.Request = TestRequest
}

if (typeof global.Response === 'undefined') {
  class TestResponse {
    constructor(public body: BodyInit | null = null, public init: ResponseInit = {}) {}
  }

  // @ts-expect-error missing in jsdom types
  global.Response = TestResponse
}
