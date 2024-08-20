import request from 'supertest'
import { expect } from 'chai';
import sinon from 'sinon';
import { pool } from '../src/db/db.mjs';
import app from "../src/index.mjs";

describe('PATCH /api/sagara-store/:id/kurangi-stok', () => {
    afterEach(() => {
        sinon.restore(); // Restore original methods after each test
    });

    it('should reduce the stock of the specified baju and return the updated baju', async () => {
        const mockCurrentStock = {
            rows: [{ stok: 10 }]
        };
        const mockUpdatedBaju = {
            rows: [{ id: 1, warna: 'Merah', ukuran: 'M', harga: 120000, stok: 5 }]
        };

        sinon.stub(pool, 'query')
            .onFirstCall().resolves(mockCurrentStock)
            .onSecondCall().resolves(mockUpdatedBaju);

        const response = await request(app)
            .patch('/api/sagara-store/1/kurangi-stok')
            .send({ jumlah: 5 });

        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal(mockUpdatedBaju.rows[0]);

        expect(pool.query.firstCall.args).to.deep.equal([
            'SELECT stok FROM baju WHERE id = $1',
            ['1']
        ]);

        expect(pool.query.secondCall.args).to.deep.equal([
            'UPDATE baju SET stok = stok - $1 WHERE id = $2 RETURNING *',
            [5, '1']
        ]);
    });

    it('should return 400 if jumlah is not a positive integer', async () => {
        const response = await request(app)
            .patch('/api/sagara-store/1/kurangi-stok')
            .send({ jumlah: -5 }); // Invalid amount

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errors').that.is.an('array');
    });

    it('should return 404 if the baju does not exist', async () => {
        sinon.stub(pool, 'query').resolves({ rows: [] });

        const response = await request(app)
            .patch('/api/sagara-store/1/kurangi-stok')
            .send({ jumlah: 5 });

        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Baju tidak ditemukan');
    });

    it('should return 400 if current stock is less than jumlah', async () => {
        const mockCurrentStock = {
            rows: [{ stok: 3 }]
        };

        sinon.stub(pool, 'query').resolves(mockCurrentStock);

        const response = await request(app)
            .patch('/api/sagara-store/1/kurangi-stok')
            .send({ jumlah: 5 });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error', 'Stok tidak mencukupi untuk dikurangi');
    });

    it('should return 500 if there is a database error', async () => {
        sinon.stub(pool, 'query').throws(new Error('Database error'));

        const response = await request(app)
            .patch('/api/sagara-store/1/kurangi-stok')
            .send({ jumlah: 5 });

        expect(response.status).to.equal(500);
        expect(response.text).to.equal('Server Error');
    });
});