#include <Arduino.h>
#include <driver/i2s.h>
#include <math.h>

// --- HARDWARE SETTINGS ---
#define I2S_WS 25
#define I2S_SCK 26
#define I2S_SD 33
#define I2S_PORT I2S_NUM_0

// --- TDOA & AUDIO SETTINGS ---
const int SAMPLE_RATE = 16000;
const int CHUNK_SAMPLES = 512;
const float SPEED_OF_SOUND = 343.0; // m/s

// !!! IMPORTANT: THIS SHOULD BE AT LEAST 0.15 (15cm) TO WORK WELL !!!
const float MIC_DISTANCE_M = 0.15;  // 15 cm between microphones

// Calculate the maximum possible delay (in samples)
const int MAX_LAG = ceil((MIC_DISTANCE_M / SPEED_OF_SOUND) * SAMPLE_RATE); 

// Buffers
int32_t i2sBuf[CHUNK_SAMPLES * 2]; 
int16_t leftBuf[CHUNK_SAMPLES];
int16_t rightBuf[CHUNK_SAMPLES];

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n===========================================");
  Serial.println("  ESP32 Acoustic Direction Finder (RAW)    ");
  Serial.println("===========================================\n");
  Serial.printf("Mic Distance: %.2f meters\n", MIC_DISTANCE_M);
  Serial.printf("Max calculated lag: %d samples\n\n", MAX_LAG);

  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT, // Stereo
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = CHUNK_SAMPLES,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = -1,
    .data_in_num = I2S_SD
  };

  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_PORT, &pin_config);
  i2s_zero_dma_buffer(I2S_PORT);
}

void loop() {
  size_t bytesRead = 0;
  i2s_read(I2S_PORT, i2sBuf, sizeof(i2sBuf), &bytesRead, portMAX_DELAY);

  size_t frames = bytesRead / (sizeof(int32_t) * 2);
  if (frames == 0) return;

  uint64_t totalEnergy = 0;

  // Split the stereo data into Left and Right 16-bit arrays
  for (size_t i = 0; i < frames; i++) {
    leftBuf[i]  = i2sBuf[i * 2 + 1] >> 16;
    rightBuf[i] = i2sBuf[i * 2 + 0] >> 16;
    totalEnergy += abs(leftBuf[i]) + abs(rightBuf[i]);
  }

  // Gate 1: Is it loud enough? (Lowered to 50k for testing)
  if (totalEnergy > 350000) { 
    
    // Cross-Correlation: Slide the arrays over each other to find the best match
    float bestCorrelation = 0;
    int bestLag = 0;

    for (int lag = -MAX_LAG; lag <= MAX_LAG; lag++) {
      float currentCorrelation = 0;
      for (int i = MAX_LAG; i < frames - MAX_LAG; i++) {
        currentCorrelation += (float)leftBuf[i] * (float)rightBuf[i + lag];
      }
      if (currentCorrelation > bestCorrelation) {
        bestCorrelation = currentCorrelation;
        bestLag = lag;
      }
    }

    // Math
    float timeDiff = (float)bestLag / (float)SAMPLE_RATE;
    float mathRatio = (timeDiff * SPEED_OF_SOUND) / MIC_DISTANCE_M;
    
    // Clamp to avoid NaN errors
    if (mathRatio > 1.0) mathRatio = 1.0;
    if (mathRatio < -1.0) mathRatio = -1.0;
    
    float angleDegrees = asin(mathRatio) * (180.0 / PI);

    // --- MACHINE-READABLE TELEMETRY FORMAT ---
    // Prints exactly: Angle,Energy (e.g. "45.2,150394")
    Serial.printf("%.1f,%llu\n", angleDegrees, totalEnergy);
    
    delay(200); 
  }
}