import request from 'supertest'
import { expect } from 'chai';
import sinon from 'sinon';
import { pool } from '../src/db/db.mjs';
import app from "../src/index.mjs";
import { validationResult } from 'express-validator';
describe('GET /api/sagara-store/search', () => {
    afterEach(() => {
        sinon.restore(); // Restore original methods after each test
    });

    it('should return baju based on warna and ukuran', async () => {
        const mockResult = {
            rows: [
                { id: 1, warna: 'Merah', ukuran: 'M', harga: 120000, stok: 10 }
            ]
        };

        sinon.stub(pool, 'query').resolves(mockResult);

        const response = await request(app)
            .get('/api/sagara-store/search')
            .query({ warna: 'Merah', ukuran: 'M' });

        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal(mockResult.rows);

        expect(pool.query.calledOnceWithExactly(
            'SELECT * FROM baju WHERE 1=1 AND warna = $1 AND ukuran = $2', 
            ['Merah', 'M']
        )).to.be.true;
    });

    it('should return 400 if query parameters are invalid', async () => {
        const response = await request(app)
            .get('/api/sagara-store/search')
            .query({ warna: 123, ukuran: 456 }); // Invalid data types

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errors').that.is.an('array');
    });

    it('should return 500 if there is a database error', async () => {
        sinon.stub(pool, 'query').throws(new Error('Database error'));

        const response = await request(app)
            .get('/api/sagara-store/search')
            .query({ warna: 'Merah', ukuran: 'M' });

        expect(response.status).to.equal(500);
        expect(response.text).to.equal('Server Error');
    });
});