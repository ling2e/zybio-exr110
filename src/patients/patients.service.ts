import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';

@Injectable()
export class PatientsService {
  constructor(private readonly db: DatabaseService) {}

  findAll(filters: { search?: string; page?: number; limit?: number }) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    let where = '';
    const params: unknown[] = [];

    if (filters.search) {
      where = 'WHERE (name LIKE ? OR medical_record_no LIKE ?)';
      const term = `%${filters.search}%`;
      params.push(term, term);
    }

    const total = this.db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM patients ${where}`,
      params,
    )!.count;

    const data = this.db.all<Patient>(
      `SELECT * FROM patients ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return { data, total, page, limit };
  }

  findById(id: number): Patient {
    const row = this.db.get<Patient>(
      'SELECT * FROM patients WHERE id = ?',
      [id],
    );
    if (!row) throw new NotFoundException(`Patient #${id} not found`);
    return row;
  }

  create(dto: CreatePatientDto): Patient {
    const now = new Date().toISOString();
    const result = this.db.run(
      `INSERT INTO patients (name, sex, date_of_birth, medical_record_no, department, admission_no, blood_type, pregnant, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dto.name,
        dto.sex ?? null,
        dto.dateOfBirth ?? null,
        dto.medicalRecordNo ?? null,
        dto.department ?? null,
        dto.admissionNo ?? null,
        dto.bloodType ?? null,
        dto.pregnant ?? null,
        now,
        now,
      ],
    );
    return this.findById(result.lastInsertRowid as number);
  }

  update(id: number, dto: UpdatePatientDto): Patient {
    // Ensure patient exists
    this.findById(id);

    const now = new Date().toISOString();
    const fields: string[] = [];
    const params: unknown[] = [];

    if (dto.name !== undefined) { fields.push('name = ?'); params.push(dto.name); }
    if (dto.sex !== undefined) { fields.push('sex = ?'); params.push(dto.sex); }
    if (dto.dateOfBirth !== undefined) { fields.push('date_of_birth = ?'); params.push(dto.dateOfBirth); }
    if (dto.medicalRecordNo !== undefined) { fields.push('medical_record_no = ?'); params.push(dto.medicalRecordNo); }
    if (dto.department !== undefined) { fields.push('department = ?'); params.push(dto.department); }
    if (dto.admissionNo !== undefined) { fields.push('admission_no = ?'); params.push(dto.admissionNo); }
    if (dto.bloodType !== undefined) { fields.push('blood_type = ?'); params.push(dto.bloodType); }
    if (dto.pregnant !== undefined) { fields.push('pregnant = ?'); params.push(dto.pregnant); }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = ?');
    params.push(now);
    params.push(id);

    this.db.run(
      `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`,
      params,
    );

    return this.findById(id);
  }

  findResultsByPatientId(patientId: number) {
    // Ensure patient exists
    this.findById(patientId);

    return this.db.all(
      `SELECT * FROM test_results WHERE patient_id = ? ORDER BY created_at DESC`,
      [patientId],
    );
  }
}
