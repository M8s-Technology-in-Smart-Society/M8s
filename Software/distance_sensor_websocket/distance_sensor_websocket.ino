#define sigPin 18

#include <WiFi.h>
#include <WebSocketServer.h>
#include <ArduinoJson.h>

// WiFi tiedot
#define WIFI_YHTEYS "Maija"
#define WIFI_SALASANA "sanipossu"

#define PORTTI 80

WiFiServer serveri(PORTTI);
WebSocketServer sokettiServeri;

String lahetettavaData;

int yhteydenotto() {
  WiFi.begin(WIFI_YHTEYS, WIFI_SALASANA);
  Serial.println("Odotellaan wifiä");

  int yritykset = 0;

  while (WiFi.status() != WL_CONNECTED && yritykset < 20) {
    delay(500);
    Serial.print(".");
    yritykset++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWifi yhteys yhdistetty");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    return 1;
  } else {
    Serial.println("\nWifi yhteyttä ei saatu");
    return 0;
  }
}

void setup() {
  Serial.begin(9600);

  if (yhteydenotto() == 0) {
    Serial.println("Yhteyttä ei saatu - pysäytetään");
    while (true); // stop
  }

  serveri.begin();
  Serial.println("Serveri käynnissä");
}

void loop() {
  WiFiClient kuuntelija = serveri.available();

  if (kuuntelija && kuuntelija.connected()) {

    if (sokettiServeri.handshake(kuuntelija)) {
      Serial.println("WebSocket yhteys muodostettu");

      while (kuuntelija.connected()) {

        // Vastaanotetaan mahdollinen data
        String tieto = sokettiServeri.getData();
        if (tieto.length() > 0) {
          Serial.print("Saapunut: ");
          Serial.println(tieto);
        }

        // Ultraääni mittaus (1 pin versio)
        long duration;
        float distance;

        pinMode(sigPin, OUTPUT);
        digitalWrite(sigPin, LOW);
        delayMicroseconds(2);

        digitalWrite(sigPin, HIGH);
        delayMicroseconds(10);
        digitalWrite(sigPin, LOW);

        pinMode(sigPin, INPUT);
        duration = pulseIn(sigPin, HIGH, 30000); // timeout 30ms

        // jos ei saada lukemaa
        if (duration == 0) {
          distance = -1;
        } else {
          distance = duration * 0.034 / 2;
        }

        Serial.print("Distance: ");
        Serial.print(distance);
        Serial.println(" cm");

        // JSON muodostus
        StaticJsonDocument<200> json;
        json["distance"] = distance;

        lahetettavaData = "";
        serializeJson(json, lahetettavaData);

        // Lähetetään websocketiin
        sokettiServeri.sendData(lahetettavaData);

        delay(200);
      }

      Serial.println("Yhteys katkaistu");
      kuuntelija.stop();
    }
  }
}

