import os
import hashlib
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "artgallery")
PORT = int(os.getenv("FLASK_PORT", 5000))

app = Flask(__name__)
CORS(app)

def get_conn():
    return mysql.connector.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME
    )

# ------------------ AUTH ------------------
@app.route("/registro", methods=["POST"])
def registro():
    data = request.json
    username = data.get("username")
    nombre = data.get("nombre") or data.get("nombre_completo")
    password = data.get("password")
    foto = data.get("foto_perfil", "default_profile.jpg")

    if not (username and nombre and password):
        return jsonify({"error":"Faltan campos"}), 400

    hashed = hashlib.md5(password.encode()).hexdigest()
    conn = get_conn()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO usuarios (username, nombre_completo, password_md5, foto_perfil) VALUES (%s,%s,%s,%s)",
            (username, nombre, hashed, foto))
        conn.commit()
        return jsonify({"mensaje":"Usuario registrado"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"error":"username ya existe"}), 409
    finally:
        cursor.close(); conn.close()

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if not (username and password):
        return jsonify({"error":"Faltan campos"}), 400
    hashed = hashlib.md5(password.encode()).hexdigest()
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username, nombre_completo, saldo, foto_perfil FROM usuarios WHERE username=%s AND password_md5=%s", (username, hashed))
    user = cursor.fetchone()
    cursor.close(); conn.close()
    if user:
        return jsonify(user)
    else:
        return jsonify({"error":"Credenciales inválidas"}), 401

# ------------------ GALERÍA ------------------
@app.route("/galeria", methods=["GET"])
def galeria():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, titulo, autor, año_publicacion, disponible, precio, imagen_url FROM obras_arte")
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(rows)

@app.route("/comprar", methods=["POST"])
def comprar():
    data = request.json
    usuario_id = data.get("usuario_id")
    obra_id = data.get("obra_id")
    if not (usuario_id and obra_id):
        return jsonify({"error":"Faltan campos"}), 400

    conn = get_conn()
    cursor = conn.cursor()
    try:
        conn.start_transaction()
        cursor.execute("SELECT precio, disponible FROM obras_arte WHERE id=%s FOR UPDATE", (obra_id,))
        row = cursor.fetchone()
        if not row:
            conn.rollback(); return jsonify({"error":"Obra no existe"}), 404
        precio, disponible = row
        if not disponible:
            conn.rollback(); return jsonify({"error":"Obra no disponible"}), 400

        cursor.execute("SELECT saldo FROM usuarios WHERE id=%s FOR UPDATE", (usuario_id,))
        r = cursor.fetchone()
        if not r:
            conn.rollback(); return jsonify({"error":"Usuario no existe"}), 404
        saldo = r[0]
        if saldo < precio:
            conn.rollback(); return jsonify({"error":"Saldo insuficiente"}), 400

        cursor.execute("UPDATE usuarios SET saldo = saldo - %s WHERE id=%s", (precio, usuario_id))
        cursor.execute("UPDATE obras_arte SET disponible = FALSE WHERE id=%s", (obra_id,))
        cursor.execute("INSERT INTO obras_adquiridas (usuario_id, obra_id) VALUES (%s,%s)", (usuario_id, obra_id))
        conn.commit()
        return jsonify({"mensaje":"Compra realizada"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close(); conn.close()

# ------------------ PERFIL ------------------
@app.route("/usuario/<int:uid>", methods=["GET"])
def get_usuario(uid):
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username, nombre_completo, saldo, foto_perfil FROM usuarios WHERE id=%s", (uid,))
    row = cursor.fetchone()
    cursor.close(); conn.close()
    if not row: return jsonify({"error":"Usuario no existe"}), 404
    return jsonify(row)

@app.route("/usuario/<int:uid>", methods=["PUT"])
def edit_usuario(uid):
    data = request.json
    new_username = data.get("username")
    new_nombre = data.get("nombre") or data.get("nombre_completo")
    new_foto = data.get("foto_perfil")
    password_confirm = data.get("password")  # contraseña para confirmar cambios

    if not password_confirm:
        return jsonify({"error":"Se requiere contraseña para confirmar"}), 400
    hashed_confirm = hashlib.md5(password_confirm.encode()).hexdigest()

    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT password_md5 FROM usuarios WHERE id=%s", (uid,))
    r = cursor.fetchone()
    if not r: cursor.close(); conn.close(); return jsonify({"error":"Usuario no existe"}),404
    if r[0] != hashed_confirm:
        cursor.close(); conn.close(); return jsonify({"error":"Contraseña incorrecta"}),401

    try:
        if new_username:
            cursor.execute("UPDATE usuarios SET username=%s WHERE id=%s", (new_username, uid))
        if new_nombre:
            cursor.execute("UPDATE usuarios SET nombre_completo=%s WHERE id=%s", (new_nombre, uid))
        if new_foto is not None:
            cursor.execute("UPDATE usuarios SET foto_perfil=%s WHERE id=%s", (new_foto, uid))
        conn.commit()
        return jsonify({"mensaje":"Perfil actualizado"})
    except mysql.connector.IntegrityError:
        conn.rollback()
        return jsonify({"error":"username ya existe"}),409
    finally:
        cursor.close(); conn.close()

@app.route("/usuario/<int:uid>/saldo", methods=["POST"])
def add_saldo(uid):
    data = request.json
    monto = data.get("monto")
    if monto is None:
        return jsonify({"error":"Falta monto"}),400
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("UPDATE usuarios SET saldo = saldo + %s WHERE id=%s", (monto, uid))
    conn.commit()
    cursor.close(); conn.close()
    return jsonify({"mensaje":"Saldo actualizado"})

@app.route("/usuario/<int:uid>/compras", methods=["GET"])
def compras_usuario(uid):
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT o.id, o.titulo, o.autor, o.año_publicacion, o.imagen_url, c.fecha_compra
        FROM obras_adquiridas c 
        JOIN obras_arte o ON c.obra_id = o.id
        WHERE c.usuario_id = %s
        """, (uid,))
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(rows)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
