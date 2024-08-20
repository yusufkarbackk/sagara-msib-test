import expresss from "express";
import request from 'supertest'
import { expect } from 'chai';
import sinon from 'sinon';
import { pool } from '../src/db/db.mjs';
import app from "../src/index.mjs";

describe('GET /api/sagara-store/', () => {
    it('should retrieve all baju records', async () => {
        const mockResult = {
            rows: [
                { id: 1, warna: 'Merah', ukuran: 'M', harga: 100000, stok: 10 },
                { id: 2, warna: 'Biru', ukuran: 'L', harga: 150000, stok: 5 }
            ]
        };
        const poolQueryStub = sinon.stub(pool, 'query').resolves(mockResult);

        const response = await request(app).get('/api/sagara-store/');

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.equal(2);
        expect(response.body[0]).to.deep.equal(mockResult.rows[0]);
        expect(response.body[1]).to.deep.equal(mockResult.rows[1]);

        poolQueryStub.restore();
    });

    it('should handle database errors', async () => {
        const errorMessage = 'Database error';
        const poolQueryStub = sinon.stub(pool, 'query').throws(new Error(errorMessage));

        const response = await request(app).get('/api/sagara-store/');

        expect(response.status).to.equal(500);
        expect(response.body).to.have.property('error', errorMessage);

        poolQueryStub.restore();
    });
});