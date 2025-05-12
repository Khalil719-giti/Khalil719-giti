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
  it('creates a new employee', async () => {
    const res = await request(app).post('/api/staff').send({
      name: 'Test User',
      identifierType: 'personnummer',
      personnummer: '8501011234'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test User');
  });

  it('blocks duplicate personnummer', async () => {
    await Employee.create({ name: 'Test', identifierType: 'personnummer', personnummer: '8501011234' });
    const res = await request(app).post('/api/staff').send({
      name: 'Dup',
      identifierType: 'personnummer',
      personnummer: '8501011234'
    });
    expect(res.statusCode).toBe(409);
  });
});