import serial
import time
import base64
from flask import Flask, send_file
from io import BytesIO
import threading
from flask_cors import CORS,cross_origin  # Import CORS

app = Flask(__name__)
# CORS(app)  # Initialize CORS for the Flask app
CORS(app, supports_credentials=True)


ser = serial.Serial('/dev/cu.usbmodem101', 115200, timeout=2)  # Adjust the port and baud rate as needed

swap = None

def read_serial_data():
    global latest_image, lastSend, swap
    data = ""
    while True:
        base64_data = ser.readline().decode("utf-8")
        
        if base64_data:
            try:
                print(len(base64_data))
                if(len(base64_data) >= 2000):
                    # Decode the Base64 data into image bytes
                    image_data = base64.b64decode(base64_data)

                    # Save the image data into memory (BytesIO object)
                                    
                    if latest_image is not None:
                        swap = latest_image.getvalue()
                     
                    latest_image = BytesIO(image_data)
                    #duplicate latest_image
                    
                    lastSend = None

                    print("Received and decoded new image.")
                else:
                    print("Data too short")
            except base64.binascii.Error:
                print("Failed to decode Base64 data.")
                

# @app.route('/api/getImage')
# @cross_origin()
# def serve_image():
#     global latest_image, lastSend
#     if latest_image:
#         try:
#             if lastSend is None:
#                 print("first time")
#                 latest_image.seek(0)
#                 lastSend = send_file(latest_image, mimetype='image/jpeg')
#                 return lastSend
#             else:
#                 print("not first time")
#                 return lastSend
#         except Exception as e:
#             print(e)
#             return "Error serving image", 500
#     else:
#         return "No image available", 404

def serve_image():
    global swap, lastSend
    # f = open("../web-view/img.jpg", "wb+")
    f = open("../web-view/img.jpg", "wb+")
    f.seek(0)
    f.write(swap)
    f.seek(0)
    lastSend = send_file(f, mimetype='image/jpeg')
    return lastSend


@app.route('/status')
def status():
    return "OK"

# Uncomment the line below to enable serial communication once ready

# Start the thread for reading serial data

threading.Thread(target=read_serial_data).start()

if __name__ == '__main__':
    global lastSend, latest_image
    latest_image = None
    lastSend = None
    app.run(debug=True, host='0.0.0.0', port=5001, use_reloader=False)