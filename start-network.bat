@echo off
echo Starting React app on network...
set HOST=0.0.0.0
set PORT=3000
set REACT_APP_API_URL=http://192.168.1.54:3001/api
set NODE_OPTIONS=--max_old_space_size=4096
npm start
