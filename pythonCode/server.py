import serial
import time
import base64
from flask import Flask, send_file
from io import BytesIO
import threading


ser = serial.Serial('COM3', 115200, timeout=2)  # Adjust the port and baud rate as needed
app = Flask(__name__)
latest_image = None


def read_serial_data():
    global latest_image
    while True:
        time.sleep(1)  # simulate waiting for data
        base64_data = b""
        while ser.in_waiting:  # While there's data to be read from the serial port
            base64_data += ser.read(ser.in_waiting)

        if base64_data:
            try:
                # Decode the Base64 data into image bytes
                image_data = base64.b64decode(base64_data)

                # Save the image data into memory (BytesIO object)
                latest_image = BytesIO(image_data)
                print("Received and decoded new image.")
            except base64.binascii.Error:
                print("Failed to decode Base64 data.")
        time.sleep(1)  # Delay before reading more data

@app.route('/api/getImage')
def serve_image():
    global latest_image
    if latest_image:
        # Stream the image in response to a web request
        latest_image.seek(0)  # Go to the beginning of the BytesIO object
        return send_file(latest_image, mimetype='image/jpeg')
    else:
        return "No image available", 404

    # Start the thread for reading serial data

if __name__ == '__main__':
        
    threading.Thread(target=read_serial_data, daemon=True).start()
    app.run(debug=True, host='0.0.0.0', port=5000)

    
