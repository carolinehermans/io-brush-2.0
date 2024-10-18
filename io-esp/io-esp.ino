#include <Arduino.h>
#include <TFT_eSPI.h>
#include <SPI.h>
#include "esp_camera.h"
#include "FS.h"
#include "SD.h"
#include "SPI.h"
#include "Base64_t.h"

#define CAMERA_MODEL_XIAO_ESP32S3 // Has PSRAM
#define TOUCH_INT D7

#include "camera_pins.h"
#define PAYLOAD_SIZE 300000
char *payload;

// Width and height of round display
const int camera_width = 240;
const int camera_height = 240;

// File Counter
int imageCount = 1;
bool camera_sign = false;          // Check camera status
// bool sd_sign = false;              // Check sd status

TFT_eSPI tft = TFT_eSPI();

camera_fb_t *fb;

bool display_is_pressed(void)
{
    if(digitalRead(TOUCH_INT) != LOW) {
        delay(3);
        if(digitalRead(TOUCH_INT) != LOW)
        return false;
    }
    return true;
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);


  // Camera pinout
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
//  config.frame_size = FRAMESIZE_UXGA;
  config.frame_size = FRAMESIZE_240X240;
 config.pixel_format = PIXFORMAT_JPEG; // for streaming
  // config.pixel_format = PIXFORMAT_RGB565;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;
  
  // if PSRAM IC present, init with UXGA resolution and higher JPEG quality
  //                      for larger pre-allocated frame buffer.
  if(config.pixel_format == PIXFORMAT_JPEG){
    if(psramFound()){
      config.jpeg_quality = 10;
      config.fb_count = 2;
      config.grab_mode = CAMERA_GRAB_LATEST;
    } else {
      // Limit the frame size when PSRAM is not available
      config.frame_size = FRAMESIZE_SVGA;
      config.fb_location = CAMERA_FB_IN_DRAM;
    }
  } else {
    // Best option for face detection/recognition
    config.frame_size = FRAMESIZE_240X240;
#if CONFIG_IDF_TARGET_ESP32S3
    config.fb_count = 2;
#endif
  }

  // camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    // Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
  // Serial.println("Camera ready");
  camera_sign = true; // Camera initialization check passes

  // Display initialization
  // tft.init();
  // tft.setRotation(1);
  // tft.fillScreen(TFT_WHITE);


  payload = (char *)ps_malloc(PAYLOAD_SIZE * sizeof(char));
  if (payload == 0) {
    // Serial.println("ERROR: can't allocated PSRAM to payload variable");
  }
  memset(payload, 0, PAYLOAD_SIZE * sizeof(char));

  
}

void loop() {
  if(camera_sign){
    // Take a photo
    fb = esp_camera_fb_get();
    if (!fb) {
      // Serial.println("Failed to get camera frame buffer");
      return;
    }
    
    if(display_is_pressed()){

      //convert to base64
      // size_t _jpg_buf_len;
      // uint8_t *_jpg_buf;
      // uint8_t* _jpg_buf = fb->buf;
      // uint32_t _jpg_buf_len = fb->len;
      // bool jpeg_converted = frame2jpg(fb, 80, &_jpg_buf, &_jpg_buf_len);
      // Serial.println("converted to jpg");
      // int encodedLength = Base64.encodedLength(_jpg_buf_len);
      // Base64.encode(payload, (char *)_jpg_buf, _jpg_buf_len);
      // int encodedLength = Base64.encodedLength(_jpg_buf_len);
      // payload[encodedLength++] = '\n';
      // payload[encodedLength] = 0;
      // Serial.write(payload,strlen(payload));
      // Serial.println(strlen(payload);
      Serial.write(fb->buf,fb->len);
      Serial.write("helloworld",strlen("helloworld"));
    }
  
    // Decode JPEG images
    // uint8_t* buf = fb->buf;
    // uint32_t len = fb->len;
    // tft.startWrite();
    // tft.setAddrWindow(0, 0, camera_width, camera_height);
    // tft.pushColors(buf, len);
    // tft.endWrite();
      
    // Release image buffer
    esp_camera_fb_return(fb);

    delay(10);
  }
}