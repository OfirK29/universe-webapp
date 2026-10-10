const app = {
    settings: {
        forceNumber: "",
        captureSlots: 3
    },

    init() {
        this.loadSettings();
        this.populateUI();
        this.navigate('home');
    },

    loadSettings() {
        try {
            const saved = localStorage.getItem('universe_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {}
    },

    saveSettings() {
        localStorage.setItem('universe_settings', JSON.stringify(this.settings));
    },

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    },

    populateUI() {
        const forceInput = document.getElementById('forceNumber');
        if (forceInput && this.settings.forceNumber) forceInput.value = this.settings.forceNumber;
    },

    navigate(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${screenId}-screen`).classList.add('active');
    },

    // מנגנון הקסם וזיהוי הדיבור
    performance: {
        slots: [],
        sum: 0,
        peak: null,
        recognition: null,
        state: 'setup',

        start() {
            if (!app.settings.forceNumber) {
                alert("אנא הגדר מספר יעד תחילה!");
                app.navigate('settings-target');
                return;
            }

            // איפוס נתוני ההופעה
            this.slots = [];
            this.sum = 0;
            this.state = 'listening';
            document.getElementById('reveal-container').classList.remove('visible');
            document.getElementById('status-indicator').style.opacity = '0.3';
            
            app.navigate('performance');
            this.initSpeech();
        },

        initSpeech() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("זיהוי דיבור אינו נתמך בדפדפן זה.");
                this.updateIndicator('error');
                return;
            }

            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'he-IL';
            this.recognition.continuous = true; // האזנה רציפה
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.updateIndicator('listening'); // המחוון הופך לצהוב בעת האזנה
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.trim();
                this.processSpeech(transcript);
            };

            this.recognition.onend = () => {
                // הדלקה מחדש אוטומטית אם אנחנו עדיין באמצע ההופעה
                if (this.state === 'listening') {
                    try { this.recognition.start(); } catch(e){}
                }
            };

            try {
                this.recognition.start(); // כאן הדפדפן יבקש הרשאת מיקרופון בפעם הראשונה
            } catch(e) {}
        },

        processSpeech(transcript) {
            // ה-Number Parser: מחפש ספרות בתוך המשפט שנאמר (סעיף 27)
            const matches = transcript.match(/\d+/g);
            
            // תמיכה בסיסית במספרים שנאמרים כמילים (1-10)
            const hebrewNumbers = {"אחת":1,"אחד":1,"שתיים":2,"שניים":2,"שלוש":3,"ארבע":4,"חמש":5,"שש":6,"שבע":7,"שמונה":8,"תשע":9,"עשר":10};
            
            let numFound = null;
            if (matches) {
                numFound = parseInt(matches[0], 10);
            } else {
                for (let word in hebrewNumbers) {
                    if (transcript.includes(word)) {
                        numFound = hebrewNumbers[word];
                        break;
                    }
                }
            }

            // אם נמצא מספר ויש מקום פנוי בקליטות
            if (numFound !== null && this.slots.length < app.settings.captureSlots) {
                this.slots.push(numFound);
                this.sum += numFound;
                
                this.updateIndicator('captured'); // משוב ירוק קצר
                setTimeout(() => {
                    if (this.state === 'listening') this.updateIndicator('listening');
                }, 1000);

                // אם סיימנו לקלוט את כל 3 המספרים
                if (this.slots.length === app.settings.captureSlots) {
                    this.state = 'ready'; // מוכן לחשיפה
                    this.updateIndicator('waiting'); // חיווי לבן מעומעם
                    if(this.recognition) this.recognition.stop();
                }
            }
        },

        handleScreenTap() {
            // כשהמערכת מוכנה (ready), לחיצה על המסך חושפת את התוצאה
            if (this.state === 'ready') {
                this.state = 'reveal';
                
                // חישוב מספר השיא (סעיף 29)
                const force = parseInt(app.settings.forceNumber, 10);
                this.peak = force - this.sum;
                
                document.getElementById('peak-number').innerText = this.peak;
                document.getElementById('reveal-container').classList.add('visible');
                document.getElementById('status-indicator').style.opacity = '0'; // העלמת המחוון
            }
        },

        exit(event) {
            // מניעת לחיצה כפולה
            if(event) event.stopPropagation();
            
            this.state = 'setup';
            if (this.recognition) {
                this.recognition.stop();
            }
            app.navigate('home');
        },

        updateIndicator(status) {
            const ind = document.getElementById('status-indicator');
            ind.className = 'indicator ' + status;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
