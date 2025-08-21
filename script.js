// Theme toggle functionality
class ThemeToggle {
    constructor() {
        this.body = document.body;
        this.toggleButton = document.getElementById('theme-toggle');
        this.sunIcon = document.querySelector('.sun-icon');
        this.moonIcon = document.querySelector('.moon-icon');
        
        this.init();
    }
    
    init() {
        // Load saved theme or default to dark mode
        const savedTheme = localStorage.getItem('theme') || 'dark-mode';
        this.applyTheme(savedTheme);

        // Atualiza a classe do body ao carregar
        this.body.classList.remove('light-mode', 'dark-mode');
        this.body.classList.add(savedTheme);

        // Add click event listener
        this.toggleButton.addEventListener('click', () => {
            this.toggleTheme();
        });
    }
    
    toggleTheme() {
        const currentTheme = this.body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode';
        const newTheme = currentTheme === 'light-mode' ? 'dark-mode' : 'light-mode';
        
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    applyTheme(theme) {
        // Remove existing theme classes
        this.body.classList.remove('light-mode', 'dark-mode');
        
        // Add new theme class
        this.body.classList.add(theme);
        
        // Update icon visibility
        if (theme === 'light-mode') {
            this.sunIcon.style.display = 'none';
            this.moonIcon.style.display = 'block';
        } else {
            this.sunIcon.style.display = 'block';
            this.moonIcon.style.display = 'none';
        }
    }
}

// Initialize theme toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeToggle();
});