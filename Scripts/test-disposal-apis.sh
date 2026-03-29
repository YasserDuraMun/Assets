# ===============================================
# Quick API Test Commands
# ????? ????? ??????? Disposal APIs
# ===============================================

echo "?? Testing Disposal APIs..."
echo ""

# Test 1: Basic Controller Test
echo "1. Testing Controller..."
curl -X GET "http://localhost:5002/api/disposals/test" -H "accept: application/json" -s | jq '.'

echo ""
echo "2. Testing Disposal Reasons..."
curl -X GET "http://localhost:5002/api/disposals/reasons" -H "accept: application/json" -s | jq '.'

echo ""
echo "3. Testing Disposals List..."
curl -X GET "http://localhost:5002/api/disposals?pageNumber=1&pageSize=5" -H "accept: application/json" -s | jq '.'

echo ""
echo "?? If you see JSON responses above, the APIs are working!"
echo "If you see errors, restart the backend application."