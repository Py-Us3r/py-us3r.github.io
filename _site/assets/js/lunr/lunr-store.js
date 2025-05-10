var store = [{
        "title": "Appointment - Hack The Box",
        "excerpt":"Introduction In this machine, we are exploiting an SQL Injection in the login panel. Reconnaissance Connectivity ping -c1 10.129.242.134 Nmap nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.242.134 Exploitation Password –&gt; admin ‘ or 1=1– - SQL query example: select flag from users where user=='admin' and password=='admin' or...","categories": ["hackthebox","Very Easy"],
        "tags": ["SQL Injection"],
        "url": "http://localhost:4000/htb-writeup-appointment/",
        "teaser":"http://localhost:4000/img2/appointment.png"},{
        "title": "Crocodile - Hack The Box",
        "excerpt":"Introduction In this machine, we are taking advantage of FTP anonymous login and exploiting the login anel with Hydra. Reconnaissance Connectivity ping -c1 10.129.1.15 Nmap nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.1.15 Vulnerability scanning with nmap nmap -sV -sC -p21,80 10.129.1.15 Fuzzing with gobuster gobuster dir -u...","categories": ["hackthebox","Very Easy"],
        "tags": ["ftp"],
        "url": "http://localhost:4000/htb-writeup-crocodile/",
        "teaser":"http://localhost:4000/img2/crocodile.png"},{
        "title": "Dancing - Hack The Box",
        "excerpt":"Introduction In this machine we are taking advantage of resource sharing misconfiguration in SMB service. Reconnaissance Connectivity ping -c1 10.129.77.89 Nmap nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.77.89 See available sources with smbclient smbclient -L 10.129.77.89 -N Exploitation smbclient //10.129.77.89/WorkShares -N Task What does the 3-letter acronym...","categories": ["hackthebox","Very Easy"],
        "tags": ["smb"],
        "url": "http://localhost:4000/htb-writeup-dancing/",
        "teaser":"http://localhost:4000/img2/dancing.png"},{
        "title": "Fawn - Hack The Box",
        "excerpt":"Introduction In this machine we are taking advantage of ftp anonymous login. Reconnaissance Connectivity ping -c1 10.129.245.175 Nmap nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.245.175 Vulnerability scanning with nmap nmap -sV -sC -p21 10.129.245.175 Exploitation ftp 10.129.245.175 Password –&gt; anonymous Task What does the 3-letter acronym FTP...","categories": ["hackthebox","Very Easy"],
        "tags": ["ftp"],
        "url": "http://localhost:4000/htb-writeup-fawn/",
        "teaser":"http://localhost:4000/img2/fawn.png"},{
        "title": "Meow - Hack The Box",
        "excerpt":"Introduction In this machine, we are taking advantage of a misconfigured Telnet service using blank password. Reconnaissance Connectivity ping -c1 10.129.147.154 Nmap nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.147.154 Exploitation telnet 10.129.147.154 Login root with blank password Tasks What does the acronym VM stand for? Virtual Machine...","categories": ["hackthebox","Very Easy"],
        "tags": ["telnet"],
        "url": "http://localhost:4000/htb-writeup-meow/",
        "teaser":"http://localhost:4000/img2/meow.png"},{
        "title": "Redeemer - Hack The Box",
        "excerpt":"Introduction In this machine, we are exploiting a misconfigured Redis service that has no credentials. Reconnaissance Connectivity ping -c1 10.129.199.109 Nmap nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.199.109 Exploitation redis-cli -h 10.129.199.109 Task Which TCP port is open on the machine? 6379 Which service is running on...","categories": ["hackthebox","Very Easy"],
        "tags": ["redis"],
        "url": "http://localhost:4000/htb-writeup-redeemer/",
        "teaser":"http://localhost:4000/img2/redeemer.png"},{
        "title": "Responder - Hack The Box",
        "excerpt":"Introduction In this machine, we exploit LLMNR/NBT-NS poisoning to capture NTLMv2 hashes and crack them. Reconnaissance Connectivity ping -c1 10.129.208.162 Nmap nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.208.162 Add domain to /etc/hosts echo \"10.129.208.162 unika.htb\" &gt;&gt; /etc/hosts See the machine technologies whatweb unika.htb Check source code of...","categories": ["hackthebox","Very Easy"],
        "tags": ["LLMNR/NBT-NS poisoning","NTLMv2s"],
        "url": "http://localhost:4000/htb-writeup-responder/",
        "teaser":"http://localhost:4000/img2/responder.png"},{
        "title": "Sequel - Hack The Box",
        "excerpt":"Introduction In this machine we are taking advantage of misconfigured MariaDB server credentials. Reconnaissance Connectivity ping -c1 10.129.235.41 Nmap nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.235.41 Check MySQL version with nmap nmap -sV -sC -p3306 10.129.235.41 Exploitation mysql -h 10.129.235.41 -u root --ssl=OFF Tasks During our scan,...","categories": ["hackthebox","Very Easy"],
        "tags": ["MariaDB"],
        "url": "http://localhost:4000/htb-writeup-sequel/",
        "teaser":"http://localhost:4000/img2/sequel.png"},{
        "title": "Three - Hack The Box",
        "excerpt":"Introduction In this machine, we are taking advantage of a misconfigured Amazon S3 service by uploading malicious PHP files. Reconnaissance Connectivity ping -c1 10.129.11.67 Nmap nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.11.67 See the version of the service nmap -sV -sC -p22,80 10.129.11.67 Discover web technologies whatweb...","categories": ["hackthebox","Very Easy"],
        "tags": ["Amazon S3","cloud","aws"],
        "url": "http://localhost:4000/htb-writeup-three/",
        "teaser":"http://localhost:4000/img2/three.png"}]
