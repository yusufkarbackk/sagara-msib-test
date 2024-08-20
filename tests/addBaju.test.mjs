import request from 'supertest'
import { expect } from 'chai';
import sinon from 'sinon';
import { pool } from '../src/db/db.mjs';
import app from "../src/index.mjs";

describe('POST /api/sagara-store/', () => {
    afterEach(() => {
        sinon.restore(); // Restore original methods after each test
    });

    it('should create a new baju when valid data is provided', async () => {
        const mockResult = {
            rows: [
                { id: 1, warna: 'Merah', ukuran: 'M', harga: 100000, stok: 10 }
            ]
        };

        sinon.stub(pool, 'query').resolves(mockResult);

        const response = await request(app)
            .post('/api/sagara-store/')
            .send({
                warna: 'Merah',
                ukuran: 'M',
                harga: 100000,
                stok: 10
            });

        expect(response.status).to.equal(201);
        expect(response.body).to.deep.equal(mockResult.rows[0]);
    });

    it('should return 400 if data validation fails', async () => {
        const response = await request(app)
            .post('/api/sagara-store/')
            .send({
                warna: '', // Invalid value
                ukuran: 'M',
                harga: 'not_a_number', // Invalid value
                stok: 10
            });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errors').that.is.an('array');
    });

    it('should return 500 if there is a database error', async () => {
        sinon.stub(pool, 'query').throws(new Error('Database error'));

        const response = await request(app)
            .post('/api/sagara-store/')
            .send({
                warna: 'Merah',
                ukuran: 'M',
                harga: 100000,
                stok: 10
            });

        expect(response.status).to.equal(500);
        expect(response.body).to.have.property('error', 'Database error');
    });
});
