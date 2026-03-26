#!/bin/bash

BASE_URL="http://localhost:3000"
BEARER_TOKEN="test-bearer-token-12345"
DEVICE_ID="test-device-001"

echo "=========================================="
echo "云端 API 端点测试"
echo "=========================================="
echo ""

echo "0. 登录获取 JWT Token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
JWT_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "JWT Token: ${JWT_TOKEN:0:50}..."
echo ""

echo "1. 配置 Bearer Auth Key..."
curl -s -X PUT "$BASE_URL/api/system-config" \
  -H "x-auth-token: $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "routing": {
      "enableBearerAuth": true,
      "bearerAuthKey": "'$BEARER_TOKEN'"
    }
  }' | jq .
echo ""

echo "2. 测试无认证访问 (应该失败)..."
curl -s "$BASE_URL/api/devices" | jq .
echo ""

echo "3. 测试 Bearer Auth 认证访问设备列表..."
curl -s "$BASE_URL/api/devices" \
  -H "Authorization: Bearer $BEARER_TOKEN" | jq .
echo ""

echo "4. 创建测试设备..."
curl -s -X POST "$BASE_URL/api/devices" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'$DEVICE_ID'",
    "name": "测试设备"
  }' | jq .
echo ""

echo "5. 获取设备列表..."
curl -s "$BASE_URL/api/devices" \
  -H "Authorization: Bearer $BEARER_TOKEN" | jq .
echo ""

echo "6. 创建闹钟 (定时闹钟)..."
curl -s -X POST "$BASE_URL/api/devices/$DEVICE_ID/alarms" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "起床闹钟",
    "hour": 8,
    "minute": 30,
    "repeat": -1
  }' | jq .
echo ""

echo "7. 创建闹钟 (倒计时闹钟)..."
curl -s -X POST "$BASE_URL/api/devices/$DEVICE_ID/alarms" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "提醒",
    "delay": 300
  }' | jq .
echo ""

echo "8. 获取设备闹钟列表..."
curl -s "$BASE_URL/api/devices/$DEVICE_ID/alarms" \
  -H "Authorization: Bearer $BEARER_TOKEN" | jq .
echo ""

echo "9. 同步闹钟 (模拟设备上传 - 使用 /alarms/report)..."
curl -s -X POST "$BASE_URL/api/devices/$DEVICE_ID/alarms/report" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alarms": [
      {
        "id": 100,
        "name": "设备端闹钟1",
        "trigger_time": 1711353600,
        "hour": 9,
        "minute": 0,
        "repeat_count": 1,
        "interval": 86400,
        "enabled": true,
        "type": 1
      }
    ]
  }' | jq .
echo ""

echo "10. 再次获取闹钟列表 (验证同步)..."
curl -s "$BASE_URL/api/devices/$DEVICE_ID/alarms" \
  -H "Authorization: Bearer $BEARER_TOKEN" | jq .
echo ""

echo "11. 更新闹钟 (ID=100)..."
ALARM_ID=100
curl -s -X PUT "$BASE_URL/api/devices/$DEVICE_ID/alarms/$ALARM_ID" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "更新后的闹钟",
    "hour": 7,
    "minute": 30,
    "enabled": false
  }' | jq .
echo ""

echo "12. 删除闹钟 (ID=100)..."
curl -s -X DELETE "$BASE_URL/api/devices/$DEVICE_ID/alarms/$ALARM_ID" \
  -H "Authorization: Bearer $BEARER_TOKEN" | jq .
echo ""

echo "13. 获取设备信息 (含闹钟数量)..."
curl -s "$BASE_URL/api/devices/with-alarm-count" \
  -H "Authorization: Bearer $BEARER_TOKEN" | jq .
echo ""

echo "=========================================="
echo "测试完成!"
echo "=========================================="
