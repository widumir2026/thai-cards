Thai A1 Lernkarten (PWA) - offline faehig

Dateien:
- index.html
- app.js
- sw.js
- manifest.webmanifest
- icon-192.png
- icon-512.png

Wichtig:
- Offline geht nur, wenn die App einmal ueber HTTP/HTTPS geladen wurde.
- file:// (Datei direkt oeffnen) aktiviert keinen Service Worker -> kein Offline.

Start lokal (Laptop im WLAN):
1) In den Ordner wechseln
2) python3 -m http.server 8080
3) Am Handy im gleichen WLAN oeffnen:
   http://<IP-DEINES-LAPTOPS>:8080
4) Installieren:
   iPhone: Safari -> Teilen -> Zum Home-Bildschirm
   Android: Chrome -> Installieren

CSV Import:
- CSV Header: th,roman,en,de
- UTF-8

Hinweis:
- Lernstand + Wortliste werden lokal im Browser gespeichert (localStorage).
