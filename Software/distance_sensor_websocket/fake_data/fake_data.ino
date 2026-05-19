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

// Mock-datan tila
float xPos = 0.0;
float yPos = 0.0;
float zPos = 0.0;
unsigned long seq = 0;
unsigned long viimeLahetys = 0;
const unsigned long lahetysVali = 200;

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

float rajoitaArvo(float arvo, float minArvo, float maxArvo) {
  if (arvo < minArvo) return minArvo;
  if (arvo > maxArvo) return maxArvo;
  return arvo;
}

void paivitaMockKoordinaatit() {
  xPos += random(-15, 16) / 10.0;
  yPos += random(-15, 16) / 10.0;
  zPos += random(-5, 6) / 10.0;

  xPos = rajoitaArvo(xPos, -50.0, 50.0);
  yPos = rajoitaArvo(yPos, -50.0, 50.0);
  zPos = rajoitaArvo(zPos, 0.0, 10.0);
}
//TODO: if z-distance changes, the frontend generates a new target on the interface. Z-distance used as the parameter to determine a new object
//7m maximum (ideal distance with the best results
//z-axis change--> värin muutos, koon muutos
//x ja y axis --> liikkuminen näytöllä, range määritys frontissa

String muodostaJson() {
  paivitaMockKoordinaatit();
  seq++;

  int rssi = random(-90, -40);

  StaticJsonDocument<512> json;
  json["type"] = "radio-coordinates";
  json["sensorModel"] = "XM-125";
  json["source"] = "esp32-mock";
  json["seq"] = seq;
  json["timestampMs"] = millis();
  json["valid"] = true;
  json["x"] = xPos;
  json["y"] = yPos;
  json["z"] = zPos;
  json["rssi"] = rssi;


  String data;
  serializeJson(json, data);

  Serial.print("MUODOSTETTU JSON: ");
  Serial.println(data);

  return data;
}

void setup() {
  Serial.begin(9600);
  randomSeed(micros());

  if (yhteydenotto() == 0) {
    Serial.println("Yhteyttä ei saatu - pysäytetään");
    while (true);
  }

  serveri.begin();
  Serial.println("Serveri käynnissä");
}

void loop() {
  WiFiClient kuuntelija = serveri.available();

  if (kuuntelija && kuuntelija.connected()) {
    if (sokettiServeri.handshake(kuuntelija)) {
      Serial.println("WebSocket yhteys muodostettu");

      String aloitusData = muodostaJson();
      sokettiServeri.sendData(aloitusData);
      Serial.print("Lähetetty aloitusdata: ");
      Serial.println(aloitusData);

      while (kuuntelija.connected()) {
        String tieto = sokettiServeri.getData();
        if (tieto.length() > 0) {
          Serial.print("Saapunut: ");
          Serial.println(tieto);

          if (tieto == "ping" || tieto == "getCoordinates" || tieto == "getReadings") {
            String vastaus = muodostaJson();
            sokettiServeri.sendData(vastaus);
            Serial.print("Lähetetty pyynnöstä: ");
            Serial.println(vastaus);
          }
        }

        if (millis() - viimeLahetys >= lahetysVali) {
          lahetettavaData = muodostaJson();
          sokettiServeri.sendData(lahetettavaData);

          Serial.print("Lähetetty automaattisesti: ");
          Serial.println(lahetettavaData);

          viimeLahetys = millis();
        }

        delay(500);
      }

      Serial.println("Yhteys katkaistu");
      kuuntelija.stop();
    }
  }
}