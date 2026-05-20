#include <Arduino.h>
#include <driver/i2s.h>
#include <math.h>
#include <WiFi.h>
#include <WebSocketServer.h>
#include <ArduinoJson.h>

// --- HARDWARE SETTINGS ---
#define I2S_WS   25
#define I2S_SCK  26
#define I2S_SD   33
#define I2S_PORT I2S_NUM_0

// --- WIFI SETTINGS ---
#define WIFI_SSID     "Maija"
#define WIFI_PASSWORD "sanipossu"

// --- WEBSOCKET SETTINGS ---
#define SERVER_PORT 80

// --- TDOA & AUDIO SETTINGS ---
const int SAMPLE_RATE = 16000;
const int CHUNK_SAMPLES = 512;
const float SPEED_OF_SOUND = 343.0f;   // m/s
const float MIC_DISTANCE_M = 0.15f;    // recommended minimum 15 cm

// Maximum possible delay in samples
const int MAX_LAG = (int)ceil((MIC_DISTANCE_M / SPEED_OF_SOUND) * SAMPLE_RATE);

// Audio buffers
int32_t i2sBuffer[CHUNK_SAMPLES * 2];
int16_t leftBuffer[CHUNK_SAMPLES];
int16_t rightBuffer[CHUNK_SAMPLES];

// Networking
WiFiServer server(SERVER_PORT);
WebSocketServer webSocketServer;

// Outgoing JSON string
String outgoingData;

// Mock data state
float xPos = 0.0f;
float yPos = 0.0f;
float zPos = 0.0f;
unsigned long sequenceNumber = 0;
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 200;

int connectToWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Connecting to WiFi...");

  int attempts = 0;

  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    return 1;
  } else {
    Serial.println("\nFailed to connect to WiFi");
    return 0;
  }
}

float clampValue(float value, float minValue, float maxValue) {
  if (value < minValue) return minValue;
  if (value > maxValue) return maxValue;
  return value;
}

void updateMockCoordinates() {
  xPos += random(-15, 16) / 10.0f;
  yPos += random(-15, 16) / 10.0f;
  zPos += random(-5, 6) / 10.0f;

  xPos = clampValue(xPos, -50.0f, 50.0f);
  yPos = clampValue(yPos, -50.0f, 50.0f);
  zPos = clampValue(zPos, 0.0f, 10.0f);
}

String buildMockJson() {
  updateMockCoordinates();
  sequenceNumber++;

  int rssi = random(-90, -40);

  StaticJsonDocument<512> json;
  json["type"] = "radio-coordinates";
  json["sensorModel"] = "XM-125";
  json["source"] = "esp32-mock";
  json["seq"] = sequenceNumber;
  json["timestampMs"] = millis();
  json["valid"] = true;
  json["x"] = xPos;
  json["y"] = yPos;
  json["z"] = zPos;
  json["rssi"] = rssi;

  String data;
  serializeJson(json, data);

  Serial.print("MOCK JSON: ");
  Serial.println(data);

  return data;
}

bool initializeI2S() {
  i2s_config_t i2sConfig = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = CHUNK_SAMPLES,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  i2s_pin_config_t pinConfig = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = -1,
    .data_in_num = I2S_SD
  };

  esp_err_t result;

  result = i2s_driver_install(I2S_PORT, &i2sConfig, 0, NULL);
  if (result != ESP_OK) {
    Serial.printf("i2s_driver_install failed: %d\n", result);
    return false;
  }

  result = i2s_set_pin(I2S_PORT, &pinConfig);
  if (result != ESP_OK) {
    Serial.printf("i2s_set_pin failed: %d\n", result);
    return false;
  }

  result = i2s_zero_dma_buffer(I2S_PORT);
  if (result != ESP_OK) {
    Serial.printf("i2s_zero_dma_buffer failed: %d\n", result);
    return false;
  }

  return true;
}

void setup() {
  Serial.begin(115200);
  randomSeed(micros());
  delay(1000);

  if (connectToWiFi() == 0) {
    Serial.println("WiFi connection failed - stopping");
    while (true) {
      delay(1000);
    }
  }

  server.begin();
  Serial.println("Server started");

  Serial.println("\n===========================================");
  Serial.println("   ESP32 Acoustic Direction Finder (RAW)   ");
  Serial.println("===========================================\n");
  Serial.printf("Mic distance: %.2f meters\n", MIC_DISTANCE_M);
  Serial.printf("Max calculated lag: %d samples\n\n", MAX_LAG);

  if (!initializeI2S()) {
    Serial.println("I2S initialization failed - stopping");
    while (true) {
      delay(1000);
    }
  }
}

void loop() {
  WiFiClient client = server.available();

  if (client && client.connected() && webSocketServer.handshake(client)) {
    Serial.println("WebSocket connection established");

    while (client.connected()) {
      String incomingData = webSocketServer.getData();
      if (incomingData.length() > 0) {
        Serial.print("Received: ");
        Serial.println(incomingData);
      }

      // Send mock JSON every 200 ms
      unsigned long now = millis();
      if (now - lastSendTime >= sendInterval) {
        lastSendTime = now;
        outgoingData = buildMockJson();
        webSocketServer.sendData(outgoingData);
      }

      size_t bytesRead = 0;
      i2s_read(I2S_PORT, i2sBuffer, sizeof(i2sBuffer), &bytesRead, portMAX_DELAY);

      size_t framesRead = bytesRead / (sizeof(int32_t) * 2);
      if (framesRead == 0) {
        delay(10);
        continue;
      }

      uint64_t totalEnergy = 0;

      for (size_t i = 0; i < framesRead; i++) {
        leftBuffer[i]  = (int16_t)(i2sBuffer[i * 2 + 1] >> 16);
        rightBuffer[i] = (int16_t)(i2sBuffer[i * 2 + 0] >> 16);
        totalEnergy += (uint64_t)abs(leftBuffer[i]) + (uint64_t)abs(rightBuffer[i]);
      }

      if (totalEnergy > 350000) {
        float bestCorrelation = -1.0e30f;
        int bestLag = 0;

        for (int lag = -MAX_LAG; lag <= MAX_LAG; lag++) {
          float currentCorrelation = 0.0f;

          for (int i = MAX_LAG; i < (int)framesRead - MAX_LAG; i++) {
            currentCorrelation += (float)leftBuffer[i] * (float)rightBuffer[i + lag];
          }

          if (currentCorrelation > bestCorrelation) {
            bestCorrelation = currentCorrelation;
            bestLag = lag;
          }
        }

        float timeDifference = (float)bestLag / (float)SAMPLE_RATE;
        float ratio = (timeDifference * SPEED_OF_SOUND) / MIC_DISTANCE_M;

        if (ratio > 1.0f) ratio = 1.0f;
        if (ratio < -1.0f) ratio = -1.0f;

        float angleDegrees = asin(ratio) * (180.0f / PI);

        Serial.printf("%.1f,%llu\n", angleDegrees, totalEnergy);

        StaticJsonDocument<200> json;
        json["type"] = "audio-angle";
        json["angle"] = angleDegrees;
        json["energy"] = totalEnergy;
        json["lag"] = bestLag;
        json["timestampMs"] = millis();

        outgoingData = "";
        serializeJson(json, outgoingData);
        webSocketServer.sendData(outgoingData);
      }

      delay(10);
    }

    Serial.println("Client disconnected");
    client.stop();
    delay(100);
  }

  delay(10);
}