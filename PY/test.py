from flask import Flask, render_template , request, session, redirect, url_for
import sqlite3

app = Flask(__name__)

@app.route ('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password_plaintext = request.form.get('password')

        db = sqlite3.connect("database.sql")
        cursor = db.cursor()

        result = cursor.execute("SELECT username FROM user WHERE username=? AND password=?", (username, password_plaintext))
        data = result.fetchone()
        db.close()

        if data != None:
            session['user'] = username
            return redirect(url_for('HomePage'))
        else:
            return redirect(url_for('login'))
    else:
        return render_template('Login.html')
    
    
@app.route ('/Signup.html', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        password_plaintext = request.form.get('password')

        if password_plaintext == "password":
            session['user'] = username
            return redirect(url_for('Login'))
        else:
            return render_template('Login.html')
    else:
        return render_template('Signup.html')
    




@app.route ('/HomePage.html')
def HomePage():
    if 'user' in session:
        return render_template('HomePage.html')
    else:
        return redirect(url_for('login'))

@app.route ('/Foodvendor.html')
def Foodvendor():
    return render_template('Foodvendor.html')

@app.route ('/Logistics.html')
def Logistics():
    return render_template('Logistics.html')

@app.route ('/DonorApp.html')
def DonorApp():
    return render_template('DonorApp.html')

@app.route ('/navbar.html')
def navbar():
    return render_template('navbar.html')

@app.route ('/Login.html')
def logout():
    del(session['user'])
    return redirect(url_for('HomePage'))





#app.secret_key = "milf"
#app.run(host= '0.0.0.0', port=8080, debug=True)

if __name__ == '__main__':
    app.secret_key = "milf"
    app.run(host='0.0.0.0', port=8080, debug=True)





