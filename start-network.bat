@echo off
echo Starting ONIX-ERP-V2 with network access...
echo.
echo Your local IP address: 192.168.1.147
echo.
echo Access URLs:
echo - Local: http://localhost:3000
echo - Network: http://192.168.1.147:3000
echo.
echo Make sure your firewall allows connections on port 3000
echo.
set HOST=0.0.0.0
npm start

