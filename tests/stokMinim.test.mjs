import request from 'supertest'
import { expect } from 'chai';
import sinon from 'sinon';
import { pool } from '../src/db/db.mjs';
import app from "../src/index.mjs";

describe('GET /api/sagara-store/stok-minim', () => {
    afterEach(() => {
        sinon.restore(); // Restore original methods after each test
    });

    it('should return a list of baju with stok < 5', async () => {
        const mockBajuWithStokMinim = {
            rows: [
                { id: 1, warna: 'Merah', ukuran: 'M', harga: 120000, stok: 2 },
                { id: 2, warna: 'Biru', ukuran: 'L', harga: 150000, stok: 3 },
            ]
        };

        sinon.stub(pool, 'query').resolves(mockBajuWithStokMinim);

        const response = await request(app)
            .get('/api/sagara-store/stok-minim');

        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal(mockBajuWithStokMinim.rows);

        expect(pool.query.calledOnce).to.be.true;
        expect(pool.query.firstCall.args).to.deep.equal([
            'SELECT * FROM baju WHERE stok < 5'
        ]);
    });

    it('should return 500 if there is a database error', async () => {
        sinon.stub(pool, 'query').throws(new Error('Database error'));

        const response = await request(app)
            .get('/api/sagara-store/stok-minim');

        expect(response.status).to.equal(500);
        expect(response.body).to.have.property('error', 'Database error');
    });
});