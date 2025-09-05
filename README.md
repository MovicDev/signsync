# Sign Language Recognition App

A real-time ASL (American Sign Language) recognition app built with React Native and a Keras model backend.

## Architecture

- **Frontend**: React Native with Expo (camera capture and UI)
- **Backend**: Node.js Express server (API gateway)
- **Model Service**: Python Flask server (Keras model inference)
- **Model**: MobileNetV2-based ASL recognition model

## Setup Instructions

### Prerequisites

1. **Python 3.8+** with pip
2. **Node.js 16+** with npm
3. **Expo CLI**: `npm install -g @expo/cli`
4. **Mobile device** or emulator with camera access

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   Create a `.env` file in the backend directory with:
   ```
   PORT=3000
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd fonted
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Application

### Option 1: Using the Startup Script (Windows)

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Run the startup script**:
   ```bash
   start_services.bat
   ```

This will automatically start both the Python model service and Node.js backend.

### Option 2: Manual Startup

1. **Start Python Model Service** (Terminal 1):
   ```bash
   cd backend
   python model_service.py
   ```
   The model service will run on `http://localhost:5001`

2. **Start Node.js Backend** (Terminal 2):
   ```bash
   cd backend
   node index.js
   ```
   The backend API will run on `http://localhost:3000`

3. **Start React Native App** (Terminal 3):
   ```bash
   cd fonted
   expo start
   ```

## Using the App

1. **Login** to your account
2. **Navigate to the main tab** where you'll see "Open Video"
3. **Tap "Open Video"** to access the sign language camera
4. **Allow camera permissions** when prompted
5. **Hold your hand** in front of the camera to perform ASL letters
6. **View real-time predictions** with confidence scores

## API Endpoints

### Backend (Node.js) - Port 3000

- `POST /api/sign/predict` - Send image for sign language prediction
- `GET /api/sign/health` - Check model service health

### Model Service (Python) - Port 5001

- `POST /predict` - Direct model prediction
- `GET /health` - Service health check

## Features

- **Real-time ASL Recognition**: Captures camera frames every 1.5 seconds
- **Confidence Scoring**: Shows prediction confidence percentages
- **Top 3 Predictions**: Displays alternative predictions
- **Connection Status**: Visual indicator of backend connectivity
- **Pause/Resume**: Control prediction processing
- **User-friendly UI**: Modern, intuitive interface

## Supported ASL Letters

The model recognizes all 26 ASL letters (A-Z) plus:
- `del` - Delete gesture
- `nothing` - No gesture detected
- `space` - Space gesture

## Troubleshooting

### Backend Connection Issues

1. **Check if both services are running**:
   - Python service: `http://localhost:5001/health`
   - Node.js backend: `http://localhost:3000/api/sign/health`

2. **Verify network connectivity**:
   - Make sure your mobile device and computer are on the same network
   - Check firewall settings

3. **Update API URL**:
   - The app automatically detects your IP address
   - For manual configuration, update `config.js`

### Camera Issues

1. **Grant camera permissions** in your device settings
2. **Ensure good lighting** for better recognition
3. **Hold hand clearly** in front of the camera
4. **Wait for processing** - predictions happen every 1.5 seconds

### Model Loading Issues

1. **Check Python dependencies** are installed correctly
2. **Verify model file** exists at `backend/asl_mobilenetv2_finetuned.keras`
3. **Check Python service logs** for error messages

## Development

### Project Structure

```
Sign/
├── backend/
│   ├── controllers/
│   │   └── prediction.controller.js
│   ├── routes/
│   │   └── prediction.routes.js
│   ├── model_service.py
│   ├── requirements.txt
│   ├── start_services.bat
│   └── asl_mobilenetv2_finetuned.keras
└── fonted/
    ├── components/
    │   └── SignLanguageCamera.jsx
    ├── app/
    │   └── (pages)/
    │       └── sign-language-camera.jsx
    └── config.js
```

### Adding New Features

1. **New ASL gestures**: Update the `class_names` array in `model_service.py`
2. **UI improvements**: Modify `SignLanguageCamera.jsx`
3. **API enhancements**: Add new routes in the backend

## Performance Tips

- **Good lighting** improves recognition accuracy
- **Clear hand positioning** in center of camera view
- **Stable hand gestures** for 1-2 seconds
- **Close camera app** when not in use to save battery

## Support

If you encounter issues:

1. Check the console logs in both services
2. Verify all dependencies are installed
3. Ensure camera permissions are granted
4. Test API endpoints directly using tools like Postman

---

**Happy signing! 🤟**
