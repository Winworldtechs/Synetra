  # ScreenCast 🎥

A cloud-connected system to **remotely control outdoor screen video content** using a **Raspberry Pi** device linked to a **Flask API hosted on AWS**.  
Admins can upload or change video content from a **web or mobile application**, and the Raspberry Pi automatically syncs to display updated content.

---

## 📑 Table of Contents

- [⚙️ Installation](#️-installation)
  - [Backend Setup (Flask + AWS)](#backend-setup-flask--aws)
  - [Raspberry Pi Setup](#raspberry-pi-setup)
  - [Frontend (Web/Mobile App)](#frontend-webmobile-app)
- [▶️ Usage](#️-usage)
- [🚀 Deployment](#-deployment)
- [🗺 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## 📖 Overview
**ScreenCast** enables businesses and individuals to easily manage outdoor display content remotely.  
The Raspberry Pi acts as a playback device, fetching video content from the cloud-based Flask API whenever updates are available.

Example use cases:
- Digital billboards
- Outdoor advertising displays
- Event or venue video signage
- Informational screens for public spaces

---

## ✨ Features
- 🎬 Upload and manage video files remotely
- 🔄 Automatic sync between AWS and Raspberry Pi
- 📱 Control via Web/Mobile app
- ⏯️ Start, stop, or schedule video playback
- 🌍 Cloud-hosted backend with scalable deployment
- 🔒 Secure API with authentication

---

## 🛠 Tech Stack
- **Hardware**: Raspberry Pi (with HDMI-connected screen)
- **Backend**: Flask (Python), hosted on AWS (EC2 / Lambda + API Gateway + S3)
- **Database**: AWS RDS or DynamoDB
- **Frontend**: React.js (Web) / React Native (Mobile)
- **CI/CD**: Jenkins, GitHub Actions, or AWS CodePipeline
- **Containerization**: Docker / Podman

---

## 🏗 Architecture

flowchart TD
    User[User: Web/Mobile App] -->|Upload Video / Send Commands| API[Flask API on AWS]
    API -->|Stores Video| S3[AWS S3 Bucket]
    API -->|Stores Metadata| DB[(AWS RDS/DynamoDB)]
    RPi[Raspberry Pi Device] -->|Fetches Latest Video| API
    RPi --> Screen[Outdoor Screen Display]



---

## ⚙️ Installation

### Backend Setup (Flask + AWS)

Clone the repo:

```bash
git clone https://github.com/yourusername/screencast.git
cd screencast/backend
```

Create virtual environment:

```bash
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate    # Windows
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure AWS credentials (IAM user with S3 + RDS permissions).

Run the Flask server locally:

```bash
flask run
```

---

### Raspberry Pi Setup

Flash Raspberry Pi OS (Lite recommended).

Install dependencies:

```bash
sudo apt update && sudo apt install python3 python3-pip omxplayer -y
pip3 install requests
```

Clone repo on Pi:

```bash
git clone https://github.com/yourusername/screencast.git
cd screencast/pi-client
```

Configure `.env` with your API URL:

```env
API_URL=https://your-api-endpoint.amazonaws.com
DEVICE_ID=pi01
```

Run the Pi client:

```bash
python3 player.py
```

---

### Frontend (Web/Mobile App)

- **Web**: React.js + Tailwind CSS  
- **Mobile**: React Native

Install dependencies:

```bash
npm install
npm start
```

---

## ▶️ Usage

1. Open the web/mobile app.  
2. Upload a video or choose existing content.  
3. The Flask API stores it in AWS S3.  
4. The Raspberry Pi automatically fetches and plays the latest video.  
5. Control playback (**play/pause/stop/schedule**) from the app.  

---

## 🚀 Deployment

- **Backend**: Deploy Flask app on AWS EC2, Elastic Beanstalk, or Docker container.  
- **Frontend**: Deploy React app via AWS Amplify / Netlify.  
- **CI/CD**: Set up Jenkins or GitHub Actions for automatic deployments.  
- **Pi Device**: Configure as a `systemd` service for auto-start on boot.  

---

## 🗺 Roadmap

- [ ] Add scheduling feature for multiple videos  
- [ ] Offline fallback mode  
- [ ] Push notifications for playback errors  
- [ ] Support for multiple screens in a group  
- [ ] Role-based access control (RBAC)  

---

## 🤝 Contributing

1. Fork the repo  
2. Create your feature branch (`git checkout -b feature/new-feature`)  
3. Commit changes (`git commit -m 'Add new feature'`)  
4. Push to the branch (`git push origin feature/new-feature`)  
5. Create a Pull Request  

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.


