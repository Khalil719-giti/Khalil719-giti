import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import Schedule from '../models/Schedule.js';
import Employee from '../models/Employee.js';

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await Schedule.deleteMany();
  await Employee.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Schedule API', () => {
  it('creates a new schedule with valid staff', async () => {
    const staff = await Employee.create({
      name: 'Scheduled Staff',
      identifierType: 'personnummer',
      personnummer: '8501011237'
    });

    const res = await request(app).post('/api/schedule').send({
      staffId: staff._id,
      date: '2025-05-10',
      startTime: '08:00',
      endTime: '12:00'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.staffId).toBe(staff._id.toString());
  });

  it('fails to create schedule with missing fields', async () => {
    const res = await request(app).post('/api/schedule').send({});
    expect(res.statusCode).toBe(400);
  });

  it('lists all schedules', async () => {
    const staff = await Employee.create({
      name: 'Viewer',
      identifierType: 'personnummer',
      personnummer: '8501011237'
    });

    await Schedule.create({
      staffId: staff._id,
      date: '2025-05-10',
      startTime: '08:00',
      endTime: '10:00'
    });

    const res = await request(app).get('/api/schedule');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('updates a schedule entry', async () => {
    const staff = await Employee.create({
      name: 'Updater',
      identifierType: 'personnummer',
      personnummer: '8501011237'
    });

    const entry = await Schedule.create({
      staffId: staff._id,
      date: '2025-05-10',
      startTime: '08:00',
      endTime: '10:00'
    });

    const res = await request(app).put(`/api/schedule/${entry._id}`).send({
      endTime: '11:00'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.endTime).toBe('11:00');
  });

  it('deletes a schedule entry', async () => {
    const staff = await Employee.create({
      name: 'Deleter',
      identifierType: 'personnummer',
      personnummer: '8501011237'
    });

    const entry = await Schedule.create({
      staffId: staff._id,
      date: '2025-05-10',
      startTime: '08:00',
      endTime: '10:00'
    });

    const res = await request(app).delete(`/api/schedule/${entry._id}`);
    expect(res.statusCode).toBe(200);
  });
});
