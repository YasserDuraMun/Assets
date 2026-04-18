@echo off
echo ================================================
echo ?? ?????? API Backend Connection ??????
echo Backend: http://10.0.0.17:8099/api/Auth/login
echo ================================================
echo.

echo 1?? ?????? Swagger...
curl -s -o nul -w "Swagger Status: %%{http_code}" "http://10.0.0.17:8099/swagger/index.html"
echo.
echo.

echo 2?? ?????? Login API...
echo Sending POST request to Auth/login...
curl -X POST "http://10.0.0.17:8099/api/Auth/login" ^
     -H "Content-Type: application/json" ^
     -d "{\"email\":\"admin@assets.ps\",\"password\":\"Admin@123\"}" ^
     -w "Status: %%{http_code} | Time: %%{time_total}s" ^
     -s

echo.
echo.

echo 3?? ?????? Network Connectivity...
ping -n 2 10.0.0.17

echo.
echo ================================================
echo ?? ??????? ????????:
echo    ? Swagger Status: 200
echo    ? Login Status: 200 ?? token
echo    ? Ping: Successful
echo.
echo ?? ??? ???? ??????????:
echo    1. ???? ?? ????? Backend
echo    2. ??? Firewall settings  
echo    3. ???? ?? IIS configuration
echo.

pause