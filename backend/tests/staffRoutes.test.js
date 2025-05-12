import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import Employee from '../models/Employee.js';

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await Employee.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Staff API', () => {

  // ========== CREATE / POST ==========

  describe('Create (POST)', () => {
    it('creates a new employee with valid personnummer', async () => {
      const res = await request(app).post('/api/staff').send({
        name: 'Test User',
        personnummer: '8501011237',
        gender: 'Kvinna'
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Test User');
      expect(res.body.identifierType).toBe('personnummer');
    });

    it('creates valid samordningsnummer', async () => {
      const res = await request(app).post('/api/staff').send({
        name: 'Coord Sam',
        personnummer: '8501671234'  // Day 67 = valid samordningsnummer
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.identifierType).toBe('samordningsnummer');
      expect(res.body.personnummer).toMatch(/^\d{6}-\d{4}$/);
    });

    it('blocks duplicate personnummer', async () => {
      await Employee.create({
        name: 'Test One',
        personnummer: '8501011237'
      });

      const res = await request(app).post('/api/staff').send({
        name: 'Test Two',
        personnummer: '8501011237'
      });
      expect(res.statusCode).toBe(409);
    });
  });

  // ========== VALIDATION ==========

  describe('Validation', () => {
    it('rejects invalid personnummer (bad Luhn)', async () => {
      const res = await request(app).post('/api/staff').send({
        name: 'Bad Luhn',
        personnummer: '8501011234'
      });
      expect(res.statusCode).toBe(400);
    });

    it('rejects invalid samordningsnummer (day < 61)', async () => {
      const res = await request(app).post('/api/staff').send({
        name: 'Bad Coord',
        personnummer: '8501041234' // day 04 is invalid for samordningsnummer
      });
      expect(res.statusCode).toBe(400);
    });

    it('rejects invalid samordningsnummer (day > 91)', async () => {
      const res = await request(app).post('/api/staff').send({
        name: 'Too High Day',
        personnummer: '8501951234' // day 95 is too high
      });
      expect(res.statusCode).toBe(400);
    });
  });

  // ========== UPDATE / PUT ==========

  describe('Update (PUT)', () => {
    it('updates an employee name', async () => {
      const emp = await Employee.create({
        name: 'Before Update',
        personnummer: '8501011237'
      });

      const res = await request(app).put(`/api/staff/${emp._id}`).send({
        name: 'After Update'
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('After Update');
    });

    it('fails update with invalid personnummer (Luhn)', async () => {
      const emp = await Employee.create({
        name: 'Should Stay',
        personnummer: '8501011237'
      });

      const res = await request(app).put(`/api/staff/${emp._id}`).send({
        personnummer: '8501011234' // bad Luhn
      });
      expect(res.statusCode).toBe(400);
    });

    it('updates to a valid samordningsnummer and sets type correctly', async () => {
      const emp = await Employee.create({
        name: 'To Be Updated',
        personnummer: '8501011237'
      });

      const res = await request(app).put(`/api/staff/${emp._id}`).send({
        personnummer: '8501661234' // Day 66 = valid samordningsnummer
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.identifierType).toBe('samordningsnummer');
      expect(res.body.personnummer).toMatch(/^\d{6}-\d{4}$/);
    });

    it('fails update with invalid samordningsnummer (day > 91)', async () => {
      const emp = await Employee.create({
        name: 'Still Valid',
        personnummer: '8501011237'
      });

      const res = await request(app).put(`/api/staff/${emp._id}`).send({
        personnummer: '8501951234' // Day 95 = invalid
      });

      expect(res.statusCode).toBe(400);
    });
  });

  // ========== CRUD: GET / DELETE ==========

  describe('Read/Delete', () => {
    it('gets list of all employees', async () => {
      await Employee.create({
        name: 'List One',
        personnummer: '8501011237'
      });
      await Employee.create({
        name: 'List Two',
        personnummer: '8501671234'
      });

      const res = await request(app).get('/api/staff');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('deletes an employee', async () => {
      const emp = await Employee.create({
        name: 'To Delete',
        personnummer: '8501011237'
      });

      const res = await request(app).delete(`/api/staff/${emp._id}`);
      expect(res.statusCode).toBe(200);
    });

    it('fails to delete non-existing employee', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/staff/${fakeId}`);
      expect(res.statusCode).toBe(404);
    });
  });

  // ========== FORMATTING ==========

  describe('Formatting Checks', () => {
    it('stores formatted personnummer and phone', async () => {
      const res = await request(app).post('/api/staff').send({
        name: 'Testperson',
        personnummer: '5508671234',
        gender: 'Kvinna',
        phone: '0701234567',
        address: 'Kiko 41 170 77 Solna',
        role: 'Undersköterska',
        employmentStatus: 'Heltid',
        driversLicense: true,
        languages: ['Svenska']
      });

      expect(res.status).toBe(201);
      expect(res.body.personnummer).toMatch(/^\d{6}-\d{4}$/);
      expect(res.body.phone).toMatch(/^\d{3}-\d{3} \d{2} \d{2}$/);
    });
  });

});
