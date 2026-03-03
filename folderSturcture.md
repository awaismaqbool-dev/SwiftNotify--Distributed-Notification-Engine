notification-engine/
├── src/
│   ├── producers/
│   │   └── notificationProducer.js   # API se data le kar Redis Stream mein dalega
│   ├── workers/
│   │   ├── emailWorker.js            # Email bhejne ki logic (Deep Offline users)
│   │   ├── pushWorker.js             # Push/In-App logic (Online/Away users)
│   │   └── deadLetterWorker.js       # Failed messages ko handle karega
│   ├── middleware/
│   │   └── activityTracker.js        # User ka last_seen update karne ke liye
│   ├── services/
│   │   ├── redisClient.js            # Central Redis connection setup
│   │   └── notificationService.js    # Logic: User status check kar ke routing decide karna
│   ├── utils/
│   │   └── logger.js                 # Logs ke liye (Professional touch)
│   └── app.js                        # Main Express entry point
├── assets/
│   └── architecture_diagram.png      # Jo diagram tumne banayi hai
├── .env                              # Redis URL, Ports, API Keys
├── package.json
└── README.md                         # Project documentation