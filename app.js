const app = {
    // מבנה נתונים מוצע - סעיף 111
    settings: {
        version: 1,
        forceNumber: "",
        triggerMode: "single",
        triggers: {
            primary: "",
            backup: "",
            celebrity: "",
            offByOne: "",
            finish: ""
        },
        capture: {
            slots: 3,
            timeoutMs: 5000
        },
        dateFormat: "DDMM",
        appearance: {
            coverMode: "color",
            coverColor: "#08090c",
            showIndicators: true,
            showRunningTotal: false,
            revealStyle: "number"
        }
    },

    init() {
        this.loadSettings();
        this.populateUI();
        this.navigate('home');
    },

    // טעינת הגדרות מקומיות - סעיף 11
    loadSettings() {
        try {
            const saved = localStorage.getItem('universe_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                // שילוב הגדרות קיימות עם ברירות המחדל
                this.settings = { ...this.settings, ...parsed };
            }
        } catch (e) {
            console.error("שגיאה בטעינת הגדרות", e);
        }
    },

    // שמירת הגדרות
    saveSettings() {
        try {
            localStorage.setItem('universe_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error("שגיאה בשמירת הגדרות", e);
        }
    },

    // עדכון הגדרה ספציפית מהממשק
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    },

    // אכלוס הממשק בנתונים שנשמרו
    populateUI() {
        const forceNumberInput = document.getElementById('forceNumber');
        if (forceNumberInput && this.settings.forceNumber) {
            forceNumberInput.value = this.settings.forceNumber;
        }
    },

    // מערכת ניווט - סעיף 117
    navigate(screenId) {
        // הסתרת כל המסכים
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // הצגת המסך המבוקש
        const targetScreen = document.getElementById(`${screenId}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }
};

// הפעלת האפליקציה כשה-DOM נטען
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
