import { Injectable } from '@nestjs/common';
import {
  Hl7Message,
  Hl7Segment,
  MshSegment,
  Hl7ParseError,
} from './hl7.types';

const FIELD_SEP = '|';

/**
 * Pure-logic HL7 v2.3.1 parser for the Zybio EXR subset.
 * No I/O dependencies — only string manipulation.
 */
@Injectable()
export class Hl7ParserService {
  /**
   * Parse a raw HL7 message string into structured segments + MSH header.
   * Throws Hl7ParseError on invalid input (never crashes with unhandled exceptions).
   */
  parse(raw: string): Hl7Message {
    try {
      if (!raw || typeof raw !== 'string') {
        throw new Hl7ParseError('Empty or non-string input');
      }

      // Split into segments by CR (0x0D). Also handle \n and \r\n for tolerance.
      const lines = raw.split(/\r\n|\r|\n/).filter((l) => l.length > 0);

      if (lines.length === 0) {
        throw new Hl7ParseError('No segments found');
      }

      // First segment MUST be MSH
      if (!lines[0].startsWith('MSH')) {
        throw new Hl7ParseError('First segment is not MSH', 100);
      }

      const segments: Hl7Segment[] = lines.map((line) =>
        this.parseSegment(line),
      );

      const msh = this.parseMsh(segments[0]);

      return { raw, segments, msh };
    } catch (e) {
      if (e instanceof Hl7ParseError) throw e;
      throw new Hl7ParseError(
        `Unexpected parse error: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  /**
   * Parse a single segment line into name + fields array.
   * For MSH, field[0] is the encoding characters (^~\&), NOT the field separator.
   */
  private parseSegment(line: string): Hl7Segment {
    const name = line.substring(0, 3);

    if (name === 'MSH') {
      // MSH is special: MSH-1 IS the field separator character (|)
      // MSH-2 is the encoding characters (^~\& typically)
      // So we split starting AFTER the 4th character (MSH|)
      const rest = line.substring(4); // everything after "MSH|"
      const fields = rest.split(FIELD_SEP);
      // fields[0] = encoding chars (^~\&) = MSH-2
      // fields[1] = sending app = MSH-3
      // fields[2] = sending facility = MSH-4
      // etc.
      return { name, fields };
    }

    // Normal segments: split by pipe, first element is segment name
    const parts = line.split(FIELD_SEP);
    // parts[0] = segment name, parts[1..] = field values
    // fields[0] = first field after segment name (e.g. OBX-1)
    const fields = parts.slice(1);
    return { name, fields };
  }

  /**
   * Extract MSH header fields into a structured object.
   * MSH field numbering (1-indexed from spec):
   *   MSH-1 = field separator (|) — implicit, not in fields array
   *   MSH-2 = encoding chars — fields[0]
   *   MSH-3 = sending app — fields[1]
   *   MSH-4 = sending facility — fields[2]
   *   MSH-5 = receiving app — fields[3]
   *   MSH-6 = receiving facility — fields[4]
   *   MSH-7 = dateTime — fields[5]
   *   MSH-8 = security — fields[6]
   *   MSH-9 = message type — fields[7]
   *   MSH-10 = control ID — fields[8]
   *   MSH-11 = processing ID — fields[9]
   *   MSH-12 = version ID — fields[10]
   */
  private parseMsh(segment: Hl7Segment): MshSegment {
    const f = segment.fields;

    if (!f || f.length < 9) {
      throw new Hl7ParseError('MSH segment has too few fields', 101);
    }

    return {
      sendingApp: f[1] ?? '',
      sendingFacility: f[2] ?? '',
      receivingApp: f[3] ?? '',
      receivingFacility: f[4] ?? '',
      dateTime: f[5] ?? '',
      messageType: f[7] ?? '',
      controlId: f[8] ?? '',
      processingId: f[9] ?? '',
      versionId: f[10] ?? '',
    };
  }

  /**
   * Unescape HL7 escape sequences in a field value.
   * Call this on individual field values when you need the decoded content.
   *
   * Sequences: \F\ → |, \S\ → ^, \T\ → &, \R\ → ~, \E\ → \, \.br\ → \r
   * Order matters: \E\ must be processed LAST (it produces the escape char itself).
   */
  unescape(value: string): string {
    if (!value || !value.includes('\\')) return value;

    return value
      .replace(/\\\.br\\/g, '\r')
      .replace(/\\F\\/g, '|')
      .replace(/\\S\\/g, '^')
      .replace(/\\T\\/g, '&')
      .replace(/\\R\\/g, '~')
      .replace(/\\E\\/g, '\\');
  }
}
