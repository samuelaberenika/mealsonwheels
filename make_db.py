import sqlite3

SCHEMA = """CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  
);

"""

try:
    db = sqlite3.connect("database.sql")
    cursor = db.cursor()

    result = cursor.execute(SCHEMA)

    result = cursor.execute("INSERT INTO user (username, password) VALUES ('me', 'test');")
    db.commit()
except sqlite3.Error as error:
    print("error: ", error)

result = cursor.execute("SELECT * FROM user;")
data = result.fetchall()
print(data)

db.close()