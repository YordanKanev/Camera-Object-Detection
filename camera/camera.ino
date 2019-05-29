#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_http_server.h"
#include "esp_timer.h"
#include <base64.h>

//
// WARNING!!! Make sure that you have either selected ESP32 Wrover Module,
//            or another board which has PSRAM enabled
//

// Select camera model
//#define CAMERA_MODEL_WROVER_KIT
//#define CAMERA_MODEL_M5STACK_PSRAM
#define CAMERA_MODEL_AI_THINKER

const char* ssid = "FMI-AIR-NEW";
const char* password = "";
#define SENSOR GPIO_NUM_15
#define BAUD_RATE 115200
#define EXT_WAKEUP_PIN_BITMASK 0x1000  //  2^12
#define MINIMUM_WAKE_PERIOD_MILLIS 60e3

#if defined(CAMERA_MODEL_WROVER_KIT)
#define PWDN_GPIO_NUM    -1
#define RESET_GPIO_NUM   -1
#define XCLK_GPIO_NUM    21
#define SIOD_GPIO_NUM    26
#define SIOC_GPIO_NUM    27

#define Y9_GPIO_NUM      35
#define Y8_GPIO_NUM      34
#define Y7_GPIO_NUM      39
#define Y6_GPIO_NUM      36
#define Y5_GPIO_NUM      19
#define Y4_GPIO_NUM      18
#define Y3_GPIO_NUM       5
#define Y2_GPIO_NUM       4
#define VSYNC_GPIO_NUM   25
#define HREF_GPIO_NUM    23
#define PCLK_GPIO_NUM    22

#elif defined(CAMERA_MODEL_M5STACK_PSRAM)
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    15
#define XCLK_GPIO_NUM     27
#define SIOD_GPIO_NUM     25
#define SIOC_GPIO_NUM     23

#define Y9_GPIO_NUM       19
#define Y8_GPIO_NUM       36
#define Y7_GPIO_NUM       18
#define Y6_GPIO_NUM       39
#define Y5_GPIO_NUM        5
#define Y4_GPIO_NUM       34
#define Y3_GPIO_NUM       35
#define Y2_GPIO_NUM       32
#define VSYNC_GPIO_NUM    22
#define HREF_GPIO_NUM     26
#define PCLK_GPIO_NUM     21

#elif defined(CAMERA_MODEL_AI_THINKER)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#else
#error "Camera model not selected"
#endif


void sendPhoto(camera_fb_t * fb, int dev_id) {
  if (WiFi.status()== WL_CONNECTED) {   //Check WiFi connection status

    HTTPClient http;
    http.begin("https://exerceo.serveo.net/device/");  //Specify destination for HTTP request
    http.addHeader("Content-Type", "application/json");  //Specify content-type header

    String payload = "{\"deviceId\" : \""; 
    payload += dev_id;
    payload += "\",\"image\" : \"data:image/jpeg;base64,";
    payload += base64::encode(fb->buf, fb->len);
    payload += "\"}";
    Serial.println("send");
    int httpResponseCode = http.POST(payload);   //Send the actual POST request

    if (httpResponseCode>0) {
      String response = http.getString();                       //Get the response to the request

      Serial.println(httpResponseCode);   //Print return code
      Serial.println(response);           //Print request answer
    
    } else {
      
      Serial.print("Error on sending POST: ");
      Serial.println(http.getString());
      Serial.println(httpResponseCode);
    }
    http.end();  //Free resources
  } else {
    Serial.println("Error in WiFi connection");
  }

}


void startCameraServer(void(*sendPhoto)(camera_fb_t*, int));

void motionDetected(){
  Serial.println("Motion detected!");
  delay(1000);
}
unsigned long lastWakeupPinHigh = 0;

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  //init with high specs to pre-allocate larger buffers
  if (psramFound()) {
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  // camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  //drop down frame size for higher initial frame rate
  sensor_t * s = esp_camera_sensor_get();
  s->set_framesize(s, FRAMESIZE_QVGA);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  startCameraServer(sendPhoto);

  Serial.print("Camera Ready! Use 'http://");
  Serial.print(WiFi.localIP());
  Serial.println("' to connect");

  pinMode(SENSOR, INPUT);
  lastWakeupPinHigh = millis();
  Serial.println("PIR ready");
  HTTPClient http;
  http.begin("http://10.108.4.88/stream");  //Specify destination for HTTP request
  int httpResponseCode = http.GET();   //Send the actual POST request 
}

void gotoSleep(){
  Serial.println("Deep sleep enabled");
  (SENSOR, HIGH);
  esp_deep_sleep_start();
}

unsigned long secs() {
  return millis() / 1e3L;
}



void loop() {
 

//  delay(7000);
//
//   unsigned long now=millis();
//   int wakeupPinState=digitalRead(SENSOR);
//   if(wakeupPinState==HIGH){
//     lastWakeupPinHigh=now;
//   
//     camera_fb_t * fb = esp_camera_fb_get();
//     if (!fb) {
//      ESP_LOGE(TAG, "Camera Capture Failed");
//     }
//     //replace this with your own function
//     sendPhoto(fb, 1);
//
//     //return the frame buffer back to the driver for reuse
//     esp_camera_fb_return(fb);
//    
//   } else if(now-lastWakeupPinHigh >= MINIMUM_WAKE_PERIOD_MILLIS){
//       gotoSleep();
//   }
//   if(now % 2000 == 0){
//     Serial.printf("%u wakeupPinState %u \n", secs(), wakeupPinState);
//  }

}
