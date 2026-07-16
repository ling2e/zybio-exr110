// Feature: lis-server-api, Property 1: MLLP Frame Round-Trip
import * as fc from 'fast-check';
import { MllpService } from './mllp.service';

/**
 * **Validates: Requirements FR-1.2, FR-1.5**
 *
 * Property: For any valid UTF-8 string body (not containing MLLP control chars
 * SB=0x0B, EB=0x1C, CR=0x0D), wrapping via wrapFrame then extracting via
 * extractFrames yields the original body unchanged.
 */
describe('MLLP Frame Round-Trip (Property 1)', () => {
  // Generator: arbitrary unicode strings excluding MLLP control characters
  const validBody = fc.string().filter((s) => {
    // Exclude strings containing MLLP control bytes (SB, EB, CR)
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i);
      if (code === 0x0b || code === 0x1c || code === 0x0d) return false;
    }
    return true;
  });

  it('wrap then extract yields original body for any valid string', () => {
    fc.assert(
      fc.property(validBody, (body) => {
        const frame = MllpService.wrapFrame(body);
        const { messages, remaining } = MllpService.extractFrames(frame);

        expect(messages).toHaveLength(1);
        expect(messages[0]).toBe(body);
        expect(remaining.length).toBe(0);
      }),
      { numRuns: 200 },
    );
  });

  it('wrap then extract preserves empty string body', () => {
    const frame = MllpService.wrapFrame('');
    const { messages, remaining } = MllpService.extractFrames(frame);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toBe('');
    expect(remaining.length).toBe(0);
  });

  it('wrap then extract preserves unicode (Chinese, emoji)', () => {
    // Use stringMatching to generate strings with unicode characters
    // but exclude MLLP control chars (0x0B, 0x1C, 0x0D)
    const unicodeSamples = [
      '你好世界',
      '测试数据',
      'Ñoño señor',
      'données résultats',
      '日本語テスト',
      '🧪🔬💉',
      'αβγδ εζηθ',
      'مرحبا',
      '한국어',
      '混合Mixed内容Content',
    ];

    for (const body of unicodeSamples) {
      const frame = MllpService.wrapFrame(body);
      const { messages, remaining } = MllpService.extractFrames(frame);

      expect(messages).toHaveLength(1);
      expect(messages[0]).toBe(body);
      expect(remaining.length).toBe(0);
    }
  });

  it('multiple frames concatenated are all extracted correctly', () => {
    fc.assert(
      fc.property(
        fc.array(validBody, { minLength: 1, maxLength: 10 }),
        (bodies) => {
          // Concatenate all wrapped frames into a single buffer
          const frames = bodies.map((b) => MllpService.wrapFrame(b));
          const combined = Buffer.concat(frames);

          const { messages, remaining } = MllpService.extractFrames(combined);

          expect(messages).toHaveLength(bodies.length);
          expect(remaining.length).toBe(0);
          for (let i = 0; i < bodies.length; i++) {
            expect(messages[i]).toBe(bodies[i]);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
