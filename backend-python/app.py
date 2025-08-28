import os
import hashlib
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv("PORT", 5000))

# Función para conectar a la base de datos
def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),   # corregido (antes DB_PASS)
            database=os.getenv("DB_NAME"),
            port=int(os.getenv("DB_PORT", 3306)) # default mysql port
        )
        return conn
    except Error as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None

# Endpoint de prueba
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"mensaje": "Soy la API de Python"}), 200

@app.route('/test-db', methods=['GET'])
def test_db():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        return jsonify({"tables": tables})
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ------------------ AUTH ------------------
@app.route("/registro", methods=["POST"])
def registro():
    data = request.json
    username = data.get("username")
    nombre = data.get("nombre") or data.get("nombre_completo")
    password = data.get("password")
    foto = data.get("foto_perfil", "default_profile.jpg")

    if not (username and nombre and password):
        return jsonify({"error": "Faltan campos"}), 400

    hashed = hashlib.md5(password.encode()).hexdigest()
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, full_name, password_hash, profile_picture) VALUES (%s,%s,%s,%s)",
            (username, nombre, hashed, foto)
        )
        conn.commit()
        return jsonify({"mensaje": "Usuario registrado"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"error": "username ya existe"}), 409
    finally:
        cursor.close()
        conn.close()

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if not (username and password):
        return jsonify({"error": "Faltan campos"}), 400
    hashed = hashlib.md5(password.encode()).hexdigest()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, username, full_name AS nombre_completo, profile_picture AS foto_perfil FROM users WHERE username=%s AND password_hash=%s",
        (username, hashed)
    )
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if user:
        # saldo ya no existe -> devolvemos saldo=0 por compatibilidad
        user["saldo"] = 0
        return jsonify(user)
    else:
        return jsonify({"error": "Credenciales inválidas"}), 401

# ------------------ GALERÍA ------------------
@app.route("/galeria", methods=["GET"])
def galeria():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, title AS titulo, artist AS autor, created_at AS año_publicacion, price AS precio, image_url FROM artworks")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    # en la nueva BD no existe "disponible", así que lo ponemos como siempre disponible
    for row in rows:
        row["disponible"] = True
    return jsonify(rows)

@app.route("/comprar", methods=["POST"])
def comprar():
    data = request.json
    usuario_id = data.get("usuario_id")
    obra_id = data.get("obra_id")
    if not (usuario_id and obra_id):
        return jsonify({"error": "Faltan campos"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # verificamos que la obra exista
        cursor.execute("SELECT id FROM artworks WHERE id=%s", (obra_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Obra no existe"}), 404

        # verificamos que el usuario exista
        cursor.execute("SELECT id FROM users WHERE id=%s", (usuario_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Usuario no existe"}), 404

        # en esta BD no hay saldo, así que simplemente registramos la compra
        cursor.execute("INSERT INTO purchases (user_id, artwork_id) VALUES (%s,%s)", (usuario_id, obra_id))
        conn.commit()
        return jsonify({"mensaje": "Compra realizada"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ------------------ PERFIL ------------------
@app.route("/usuario/<int:uid>", methods=["GET"])
def get_usuario(uid):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username, full_name AS nombre_completo, profile_picture AS foto_perfil FROM users WHERE id=%s", (uid,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if not row:
        return jsonify({"error": "Usuario no existe"}), 404
    row["saldo"] = 0  # compatibilidad
    return jsonify(row)

@app.route("/usuario/<int:uid>", methods=["PUT"])
def edit_usuario(uid):
    data = request.json
    new_username = data.get("username")
    new_nombre = data.get("nombre") or data.get("nombre_completo")
    new_foto = data.get("foto_perfil")
    password_confirm = data.get("password")  # contraseña para confirmar cambios

    if not password_confirm:
        return jsonify({"error": "Se requiere contraseña para confirmar"}), 400
    hashed_confirm = hashlib.md5(password_confirm.encode()).hexdigest()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE id=%s", (uid,))
    r = cursor.fetchone()
    if not r:
        cursor.close()
        conn.close()
        return jsonify({"error": "Usuario no existe"}), 404
    if r[0] != hashed_confirm:
        cursor.close()
        conn.close()
        return jsonify({"error": "Contraseña incorrecta"}), 401

    try:
        if new_username:
            cursor.execute("UPDATE users SET username=%s WHERE id=%s", (new_username, uid))
        if new_nombre:
            cursor.execute("UPDATE users SET full_name=%s WHERE id=%s", (new_nombre, uid))
        if new_foto is not None:
            cursor.execute("UPDATE users SET profile_picture=%s WHERE id=%s", (new_foto, uid))
        conn.commit()
        return jsonify({"mensaje": "Perfil actualizado"})
    except mysql.connector.IntegrityError:
        conn.rollback()
        return jsonify({"error": "username ya existe"}), 409
    finally:
        cursor.close()
        conn.close()

@app.route("/usuario/<int:uid>/saldo", methods=["POST"])
def add_saldo(uid):
    # en la nueva BD no existe saldo, devolvemos OK "simulado"
    data = request.json
    return jsonify({"mensaje": "Saldo actualizado (simulado)"}), 200

@app.route("/usuario/<int:uid>/compras", methods=["GET"])
def compras_usuario(uid):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT a.id, a.title AS titulo, a.artist AS autor, a.created_at AS año_publicacion, 
               a.image_url, p.purchase_date AS fecha_compra
        FROM purchases p 
        JOIN artworks a ON p.artwork_id = a.id
        WHERE p.user_id = %s
        """, (uid,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
