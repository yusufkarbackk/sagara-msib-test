import expresss from "express";
import request from 'supertest'
import { expect } from 'chai';
import sinon from 'sinon';
import { pool } from '../src/db/db.mjs';
import app from "../src/index.mjs";

describe('DELETE /api/sagara-store/:id', () => {
    afterEach(() => {
        sinon.restore(); // Restore original methods after each test
    });

    it('should delete the baju and return a success message', async () => {
        const poolQueryStub = sinon.stub(pool, 'query').resolves();

        const response = await request(app).delete('/api/sagara-store/1');

        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({ msg: "delete success" });

        expect(poolQueryStub.calledOnceWithExactly(
            'DELETE FROM baju WHERE id = $1',
            ['1']
        )).to.be.true;
    });

    it('should return 500 if there is a database error', async () => {
        const poolQueryStub = sinon.stub(pool, 'query').throws(new Error('Database error'));

        const response = await request(app).delete('/api/sagara-store/1');

        expect(response.status).to.equal(500);
        expect(response.body).to.have.property('error', 'Database error');

        expect(poolQueryStub.calledOnceWithExactly(
            'DELETE FROM baju WHERE id = $1',
            ['1']
        )).to.be.true;
    });
});
