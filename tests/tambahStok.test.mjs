import request from 'supertest'
import { expect } from 'chai';
import sinon from 'sinon';
import { pool } from '../src/db/db.mjs';
import app from "../src/index.mjs";

describe('PATCH /api/sagara-store/:id/tambah-stok', () => {
    afterEach(() => {
        sinon.restore(); // Restore original methods after each test
    });

    it('should add stock to the specified baju and return the updated baju', async () => {
        const mockResult = {
            rows: [
                { id: 1, warna: 'Merah', ukuran: 'M', harga: 120000, stok: 15 }
            ]
        };

        sinon.stub(pool, 'query').resolves(mockResult);

        const response = await request(app)
            .patch('/api/sagara-store/1/tambah-stok')
            .send({ jumlah: 5 });

        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal(mockResult.rows[0]);

        expect(pool.query.calledOnceWithExactly(
            'UPDATE baju SET stok = stok + $1 WHERE id = $2 RETURNING *',
            [5, '1']
        )).to.be.true;
    });

    it('should return 400 if jumlah is not a positive integer', async () => {
        const response = await request(app)
            .patch('/api/sagara-store/1/tambah-stok')
            .send({ jumlah: -5 }); // Invalid amount

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('errors').that.is.an('array');
    });

    it('should return 404 if the baju does not exist', async () => {
        sinon.stub(pool, 'query').resolves({ rows: [] });

        const response = await request(app)
            .patch('/api/sagara-store/1/tambah-stok')
            .send({ jumlah: 5 });

        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Baju tidak ditemukan');
    });

    it('should return 500 if there is a database error', async () => {
        sinon.stub(pool, 'query').throws(new Error('Database error'));

        const response = await request(app)
            .patch('/api/sagara-store/1/tambah-stok')
            .send({ jumlah: 5 });

        expect(response.status).to.equal(500);
        expect(response.text).to.equal('Server Error');
    });
});