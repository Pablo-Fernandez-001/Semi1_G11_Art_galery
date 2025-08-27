const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const md5 = require('md5');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10
});

// ------------------ AUTH ------------------
app.post('/registro', async (req, res) => {
    const { username, nombre_completo, password, foto_perfil = 'default_profile.jpg' } = req.body;
    if (!username || !nombre_completo || !password) return res.status(400).json({ error: "Faltan campos" });

    try {
        const conn = await pool.getConnection();
        const hashed = md5(password);
        await conn.execute(
            'INSERT INTO usuarios (username, nombre_completo, password_md5, foto_perfil) VALUES (?, ?, ?, ?)',
            [username, nombre_completo, hashed, foto_perfil]
        );
        conn.release();
        res.status(201).json({ mensaje: "Usuario registrado" });
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') res.status(409).json({ error: "username ya existe" });
        else res.status(500).json({ error: e.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Faltan campos" });

    const hashed = md5(password);
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
        'SELECT id, username, nombre_completo, saldo, foto_perfil FROM usuarios WHERE username=? AND password_md5=?',
        [username, hashed]
    );
    conn.release();
    if (rows.length > 0) res.json(rows[0]);
    else res.status(401).json({ error: "Credenciales inválidas" });
});

// ------------------ GALERÍA ------------------
app.get('/galeria', async (req, res) => {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
        'SELECT id, titulo, autor, año_publicacion, disponible, precio, imagen_url FROM obras_arte'
    );
    conn.release();
    res.json(rows);
});

app.post('/comprar', async (req, res) => {
    const { usuario_id, obra_id } = req.body;
    if (!usuario_id || !obra_id) return res.status(400).json({ error: "Faltan campos" });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Obtener obra y bloquear fila
        const [obraRows] = await conn.execute(
            'SELECT precio, disponible FROM obras_arte WHERE id=? FOR UPDATE',
            [obra_id]
        );
        if (obraRows.length === 0) throw { status: 404, message: "Obra no existe" };

        const precio = parseFloat(obraRows[0].precio);
        const disponible = obraRows[0].disponible;
        if (!disponible) throw { status: 400, message: "Obra no disponible" };

        // Obtener usuario y bloquear fila
        const [userRows] = await conn.execute(
            'SELECT saldo FROM usuarios WHERE id=? FOR UPDATE',
            [usuario_id]
        );
        if (userRows.length === 0) throw { status: 404, message: "Usuario no existe" };

        const saldo = parseFloat(userRows[0].saldo);
        if (saldo < precio) throw { status: 400, message: "Saldo insuficiente" };

        // Actualizar saldo, marcar obra como vendida e insertar en compras
        await conn.execute('UPDATE usuarios SET saldo = saldo - ? WHERE id=?', [precio, usuario_id]);
        await conn.execute('UPDATE obras_arte SET disponible = FALSE WHERE id=?', [obra_id]);
        await conn.execute('INSERT INTO obras_adquiridas (usuario_id, obra_id) VALUES (?, ?)', [usuario_id, obra_id]);

        await conn.commit();
        res.json({ mensaje: "Compra realizada" });
    } catch (e) {
        await conn.rollback();
        res.status(e.status || 500).json({ error: e.message || e });
    } finally {
        conn.release();
    }
});


// ------------------ PERFIL ------------------
app.get('/usuario/:id', async (req, res) => {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
        'SELECT id, username, nombre_completo, saldo, foto_perfil FROM usuarios WHERE id=?',
        [req.params.id]
    );
    conn.release();
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no existe" });
    res.json(rows[0]);
});

app.put('/usuario/:id', async (req, res) => {
    const uid = req.params.id;
    const { username, nombre_completo, foto_perfil, password } = req.body;
    if (!password) return res.status(400).json({ error: "Se requiere contraseña para confirmar" });
    const hashedConfirm = md5(password);

    const conn = await pool.getConnection();
    try {
        const [userRows] = await conn.execute('SELECT password_md5 FROM usuarios WHERE id=?', [uid]);
        if (userRows.length === 0) throw { status: 404, message: "Usuario no existe" };
        if (userRows[0].password_md5 !== hashedConfirm) throw { status: 401, message: "Contraseña incorrecta" };

        if (username) await conn.execute('UPDATE usuarios SET username=? WHERE id=?', [username, uid]);
        if (nombre_completo) await conn.execute('UPDATE usuarios SET nombre_completo=? WHERE id=?', [nombre_completo, uid]);
        if (foto_perfil !== undefined) await conn.execute('UPDATE usuarios SET foto_perfil=? WHERE id=?', [foto_perfil, uid]);

        res.json({ mensaje: "Perfil actualizado" });
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') res.status(409).json({ error: "username ya existe" });
        else res.status(e.status || 500).json({ error: e.message || e });
    } finally {
        conn.release();
    }
});

app.post('/usuario/:id/saldo', async (req, res) => {
    const { monto } = req.body;
    if (monto === undefined) return res.status(400).json({ error: "Falta monto" });

    const conn = await pool.getConnection();
    await conn.execute('UPDATE usuarios SET saldo = saldo + ? WHERE id=?', [monto, req.params.id]);
    conn.release();
    res.json({ mensaje: "Saldo actualizado" });
});

app.get('/usuario/:id/compras', async (req, res) => {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(`
        SELECT o.id, o.titulo, o.autor, o.año_publicacion, o.imagen_url, c.fecha_compra
        FROM obras_adquiridas c 
        JOIN obras_arte o ON c.obra_id = o.id
        WHERE c.usuario_id = ?`, [req.params.id]);
    conn.release();
    res.json(rows);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor Node.js corriendo en puerto ${PORT}`));
