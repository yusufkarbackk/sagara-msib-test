import expresss from "express";
import request from 'supertest'
import { expect } from 'chai';
import sinon from 'sinon';
import { pool } from '../src/db/db.mjs';
import app from "../src/index.mjs";

describe('PATCH /api/sagara-store/:id', () => {
    afterEach(() => {
        sinon.restore(); // Restore original methods after each test
    });

    it('should update baju when valid data is provided', async () => {
        const mockResult = {
            rows: [
                { id: 1, warna: 'Merah', ukuran: 'M', harga: 120000, stok: 15 }
            ]
        };

        sinon.stub(pool, 'query').resolves(mockResult);

        const response = await request(app)
            .patch('/api/sagara-store/1')
            .send({
                warna: 'Merah',
                harga: 120000,
                stok: 15
            });

        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal(mockResult.rows[0]);
    });

    it('should return 400 if data validation fails', async () => {
        const response = await request(app)
            .patch('/api/sagara-store/1')
            .send({
                warna: '', // Invalid value
                harga: 'not_a_number', // Invalid value
            });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errors').that.is.an('array');
    });

    it('should return 404 if the record is not found', async () => {
        sinon.stub(pool, 'query').resolves({ rows: [] });

        const response = await request(app)
            .patch('/api/sagara-store/999') // Assuming 999 does not exist
            .send({
                warna: 'Hijau',
                ukuran: 'L',
            });

        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Record not found');
    });

    it('should return 500 if there is a database error', async () => {
        sinon.stub(pool, 'query').throws(new Error('Database error'));

        const response = await request(app)
            .patch('/api/sagara-store/1')
            .send({
                warna: 'Merah',
                harga: 120000,
                stok: 15
            });

        expect(response.status).to.equal(500);
        expect(response.text).to.equal('Server Error');
    });
});
