import { MllpService } from './mllp.service';

const SB = 0x0b;
const EB = 0x1c;
const CR = 0x0d;

describe('MllpService — frame logic', () => {
  describe('wrapFrame', () => {
    it('should wrap a simple body with SB prefix and EB+CR suffix', () => {
      const frame = MllpService.wrapFrame('hello');
      expect(frame[0]).toBe(SB);
      expect(frame.subarray(1, 6).toString()).toBe('hello');
      expect(frame[6]).toBe(EB);
      expect(frame[7]).toBe(CR);
      expect(frame.length).toBe(8);
    });

    it('should handle empty body', () => {
      const frame = MllpService.wrapFrame('');
      expect(frame.length).toBe(3);
      expect(frame[0]).toBe(SB);
      expect(frame[1]).toBe(EB);
      expect(frame[2]).toBe(CR);
    });

    it('should handle unicode content', () => {
      const body = 'μg/mL 测试';
      const frame = MllpService.wrapFrame(body);
      expect(frame[0]).toBe(SB);
      expect(frame[frame.length - 2]).toBe(EB);
      expect(frame[frame.length - 1]).toBe(CR);
      // Extract back
      const extracted = frame.subarray(1, frame.length - 2).toString('utf-8');
      expect(extracted).toBe(body);
    });
  });

  describe('extractFrames', () => {
    it('should extract a single complete frame', () => {
      const frame = MllpService.wrapFrame('MSH|^~\\&|test');
      const { messages, remaining } = MllpService.extractFrames(frame);
      expect(messages).toEqual(['MSH|^~\\&|test']);
      expect(remaining.length).toBe(0);
    });

    it('should extract multiple frames from a single buffer', () => {
      const f1 = MllpService.wrapFrame('msg1');
      const f2 = MllpService.wrapFrame('msg2');
      const combined = Buffer.concat([f1, f2]);
      const { messages, remaining } = MllpService.extractFrames(combined);
      expect(messages).toEqual(['msg1', 'msg2']);
      expect(remaining.length).toBe(0);
    });

    it('should return partial data as remaining when frame is incomplete', () => {
      // Only SB + some data, no EB+CR
      const partial = Buffer.from([SB, 0x41, 0x42, 0x43]);
      const { messages, remaining } = MllpService.extractFrames(partial);
      expect(messages).toEqual([]);
      expect(remaining).toEqual(partial);
    });

    it('should handle split frames (EB present but no CR yet)', () => {
      const partial = Buffer.from([SB, 0x41, EB]);
      const { messages, remaining } = MllpService.extractFrames(partial);
      expect(messages).toEqual([]);
      expect(remaining).toEqual(partial);
    });

    it('should handle garbage bytes before SB', () => {
      // Some garbage then a valid frame
      const garbage = Buffer.from([0x00, 0x01, 0x02]);
      const valid = MllpService.wrapFrame('body');
      const combined = Buffer.concat([garbage, valid]);
      const { messages, remaining } = MllpService.extractFrames(combined);
      expect(messages).toEqual(['body']);
      expect(remaining.length).toBe(0);
    });

    it('should return empty for empty buffer', () => {
      const { messages, remaining } = MllpService.extractFrames(Buffer.alloc(0));
      expect(messages).toEqual([]);
      expect(remaining.length).toBe(0);
    });
  });
});
