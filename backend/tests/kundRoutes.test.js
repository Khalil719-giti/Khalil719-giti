import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js'; // assumes Express app is exported
import Kund from '../models/Kund.js';

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await Kund.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Kund API', () => {
  it('creates a new kund with valid personnummer', async () => {
    const res = await request(app).post('/api/kunder').send({
      name: 'Test Kund',
      identifierType: 'personnummer',
      personnummer: '850101-1237',
      gender: 'Kvinna',
      phone: '0705413658',
      address: 'Kiko 41 17077Solna'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Kund');
    expect(res.body.personnummer).toBe('850101-1237');
    expect(res.body.phone).toMatch(/\d{3}-\d{3} \d{2} \d{2}/);
  });

  it('rejects duplicate kund personnummer', async () => {
    await Kund.create({
      name: 'Already Exists',
      identifierType: 'personnummer',
      personnummer: '850101-1237'
    });

    const res = await request(app).post('/api/kunder').send({
      name: 'Duplicate',
      identifierType: 'personnummer',
      personnummer: '850101-1237'
    });

    expect(res.statusCode).toBe(409);
  });

  it('rejects kund with invalid Luhn personnummer', async () => {
    const res = await request(app).post('/api/kunder').send({
      name: 'Bad Luhn',
      identifierType: 'personnummer',
      personnummer: '850101-1234' // Invalid Luhn
    });
    expect(res.statusCode).toBe(400);
  });

  it('rejects invalid samordningsnummer day', async () => {
    const res = await request(app).post('/api/kunder').send({
      name: 'Invalid Coord Day',
      identifierType: 'samordningsnummer',
      personnummer: '850104-1234' // 04 is not 61–91
    });
    expect(res.statusCode).toBe(400);
  });

  it('accepts valid samordningsnummer', async () => {
    const res = await request(app).post('/api/kunder').send({
      name: 'Coord Valid',
      identifierType: 'samordningsnummer',
      personnummer: '850167-1234',
      phone: '0705413658',
      address: 'Kiko 41 17077Solna'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.identifierType).toBe('samordningsnummer');
  });

  it('rejects invalid address format', async () => {
    const res = await request(app).post('/api/kunder').send({
      name: 'Bad Address',
      identifierType: 'personnummer',
      personnummer: '850101-1237',
      address: 'JustWrongFormat',
      phone: '0701234567'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/adressen ska innehålla/i);
  });

  it('updates kund with valid data', async () => {
    const kund = await Kund.create({
      name: 'Initial',
      personnummer: '850101-1237',
      identifierType: 'personnummer'
    });

    const res = await request(app).put(`/api/kunder/${kund._id}`).send({
      name: 'Updated',
      address: 'Kiko 41 170 77 Solna',
      phone: '0705413658'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated');
    expect(res.body.address).toMatch(/170 77 Solna/);
  });

  it('fails update with bad personnummer', async () => {
    const kund = await Kund.create({
      name: 'Valid',
      personnummer: '850101-1237',
      identifierType: 'personnummer'
    });

    const res = await request(app).put(`/api/kunder/${kund._id}`).send({
      personnummer: '850101-1234'
    });

    expect(res.statusCode).toBe(400);
  });

  it('lists all kunder', async () => {
    await Kund.create({ name: 'One', personnummer: '850101-1237', identifierType: 'personnummer' });
    await Kund.create({ name: 'Two', personnummer: '850167-1234', identifierType: 'samordningsnummer' });

    const res = await request(app).get('/api/kunder');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('deletes a kund', async () => {
    const kund = await Kund.create({
      name: 'Delete Me',
      personnummer: '850101-1237',
      identifierType: 'personnummer'
    });

    const res = await request(app).delete(`/api/kunder/${kund._id}`);
    expect(res.statusCode).toBe(200);
  });

  it('fails to delete non-existent kund', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/kunder/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });
});
