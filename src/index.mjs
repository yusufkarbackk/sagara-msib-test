import expresss from "express";
import pg from 'pg'
import { pool } from "./db/db.mjs";
import { updateBajuVaidationSchema } from "./utils/vallidationSchema.mjs";
import { createBajuValidationSchema } from "./utils/vallidationSchema.mjs";
import { validationResult, matchedData, checkSchema, query, body } from "express-validator";

const app = expresss()
export default app
const { Pool } = pg
const PORT = process.env.PORT || 3000

app.use(expresss.json())

app.get('/', (request, response) => {
    response.send('hello sagara')
})

app.get('/api/sagara-store/', async (request, response) => {
    try {
        const result = await pool.query('SELECT * FROM baju')
        response.status(200).json(result.rows)
    } catch (error) {
        console.log(error)
        response.status(500).json({ error: error.message })
    }
})

app.post('/api/sagara-store/', checkSchema(createBajuValidationSchema), async (request, response) => {
    const result = validationResult(request)
    console.log(result)

    if (!result.isEmpty()) {
        return response.status(400).send({ errors: result.array() })
    }
    const data = matchedData(request)
    try {
        const { warna, ukuran, harga, stok } = data;
        const result = await pool.query(
            'INSERT INTO baju (warna, ukuran, harga, stok) VALUES ($1, $2, $3, $4) RETURNING *',
            [warna, ukuran, harga, stok]
        )
        response.status(201).send(result.rows[0]);
    } catch (error) {
        response.status(500).json({ error: error.message })
    }
})

app.patch('/api/sagara-store/:id', checkSchema(updateBajuVaidationSchema), async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }

    const data = matchedData(request);
    const { id } = request.params;

    // Generate the SQL query dynamically based on which fields are present
    const fields = Object.keys(data);
    console.log(fields)

    const values = Object.values(data);
    console.log(values)

    const setQuery = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    console.log(setQuery)

    if (fields.length === 0) {
        return res.status(400).json({ error: "No valid fields provided for update." });
    }

    try {
        const query = `UPDATE baju SET ${setQuery} WHERE id = $${fields.length + 1} RETURNING *`;
        const result = await pool.query(query, [...values, id]);

        if (result.rows.length === 0) {
            return response.status(404).json({ error: "Record not found" });
        }

        response.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Server Error');
    }
});

app.delete('/api/sagara-store/:id', async (request, response) => {
    const { id } = request.params
    try {
        await pool.query('DELETE FROM baju WHERE id = $1', [id])
        response.status(200).json({ msg: "delete success" })
    } catch (error) {
        console.log(error)

        response.status(500).json({ error: error.message })
    }
})

app.get('/api/sagara-store/search', [
    query('warna').isString().custom(value => isNaN(value)).withMessage('Warna harus bertipe string'),
    query('ukuran').isString().custom(value => isNaN(value)).withMessage('Ukuran harus bertipe string'),
], async (request, response) => {
    const errors = validationResult(request)

    if (!errors.isEmpty()) {
        return response.status(400).json({ "errors": errors.array() })
    }

    const { warna, ukuran } = request.query

    try {
        let query = 'SELECT * FROM baju WHERE 1=1';
        const values = [];

        if (warna) {
            query += ' AND warna = $1';
            values.push(warna);
        }

        if (ukuran) {
            query += ` AND ukuran = $${values.length + 1}`;
            values.push(ukuran);
        }

        const result = await pool.query(query, values);

        response.json(result.rows);
    } catch (error) {
        console.error(error);
        response.status(500).send('Server Error');
    }
})

app.patch('/api/sagara-store/:id/tambah-stok', [
    body('jumlah').isInt({ min: 1 }).withMessage('jumlah harus bilangan positif')
], async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }

    const { id } = request.params;
    const { jumlah } = request.body;

    try {
        const result = await pool.query(
            'UPDATE baju SET stok = stok + $1 WHERE id = $2 RETURNING *',
            [jumlah, id]
        );

        if (result.rows.length === 0) {
            return response.status(404).json({ error: "Baju tidak ditemukan" });
        }

        response.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Server Error');
    }
});

app.patch('/api/sagara-store/:id/kurangi-stok', [
    body('jumlah').isInt({ min: 1 }).withMessage('Jumlah harus berupa angka positif'),
], async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }

    const { id } = request.params;
    const { jumlah } = request.body;

    try {
        // Cek stok saat ini
        const currentStockResult = await pool.query(
            'SELECT stok FROM baju WHERE id = $1',
            [id]
        );

        if (currentStockResult.rows.length === 0) {
            return response.status(404).json({ error: "Baju tidak ditemukan" });
        }

        const currentStock = currentStockResult.rows[0].stok;

        if (currentStock < jumlah) {
            return response.status(400).json({ error: "Stok tidak mencukupi untuk dikurangi" });
        }

        // Kurangi stok
        const result = await pool.query(
            'UPDATE baju SET stok = stok - $1 WHERE id = $2 RETURNING *',
            [jumlah, id]
        );

        response.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Server Error');
    }
});

app.get('/api/sagara-store/stok-habis', async (request, response) => {
    try {
        const result = await pool.query('SELECT * FROM baju WHERE stok = 0')
        response.status(200).json(result.rows)
    } catch (error) {
        response.status(500).json({ error: error.message })
    }
})

app.get('/api/sagara-store/stok-minim', async (request, response) => {
    try {
        const result = await pool.query('SELECT * FROM baju WHERE stok < 5')
        response.status(200).json(result.rows)
    } catch (error) {
        response.status(500).json({ error: error.message })
    }
})

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`)
})
