import request from 'supertest'
import { expect } from 'chai';
import sinon from 'sinon';
import { pool } from '../src/db/db.mjs';
import app from "../src/index.mjs";

describe('GET /api/sagara-store/stok-habis', () => {
    afterEach(() => {
        sinon.restore(); // Restore original methods after each test
    });

    it('should return a list of baju with stok = 0', async () => {
        const mockBajuWithStokHabis = {
            rows: [
                { id: 1, warna: 'Merah', ukuran: 'M', harga: 120000, stok: 0 },
                { id: 2, warna: 'Biru', ukuran: 'L', harga: 150000, stok: 0 },
            ]
        };

        sinon.stub(pool, 'query').resolves(mockBajuWithStokHabis);

        const response = await request(app)
            .get('/api/sagara-store/stok-habis');

        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal(mockBajuWithStokHabis.rows);

        expect(pool.query.calledOnce).to.be.true;
        expect(pool.query.firstCall.args).to.deep.equal([
            'SELECT * FROM baju WHERE stok = 0'
        ]);
    });

    it('should return 500 if there is a database error', async () => {
        sinon.stub(pool, 'query').throws(new Error('Database error'));

        const response = await request(app)
            .get('/api/sagara-store/stok-habis');

        expect(response.status).to.equal(500);
        expect(response.body).to.have.property('error', 'Database error');
    });
});