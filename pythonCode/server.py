import serial
import time
import base64



ser = serial.Serial('/dev/cu.usbmodem101', 115200, timeout=2)  # Adjust the port and baud rate as needed

swap = None

def read_serial_data():
    global latest_image, lastSend, swap
    data = ""
    while True:
        try:
            base64_data = ser.readline().decode("utf-8")
            f = open("../web-view/img.jpg", "wb+")
            f.seek(0)
            image_data = base64.b64decode(base64_data)
            f.write(image_data)
            print("Image received",len(image_data))
        except Exception as e:
            print(e)
            print("Error reading serial data")
            
    


read_serial_data()
