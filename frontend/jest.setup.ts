import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
// @ts-expect-error missing in jsdom types
global.TextDecoder = TextDecoder
