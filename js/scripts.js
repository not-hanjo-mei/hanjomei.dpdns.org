// scripts.js

function init() {
    typeWriter();
    autoDarkMode();
    internationalization();
    setupLanguageSwitcher();
}

function setupLanguageSwitcher() {
    // Build the language switcher
    const languageSwitcher = document.getElementById('languageSwitcher');
    if (languageSwitcher) {
        languageSwitcher.addEventListener('change', function () {
            switchLanguage(this.value);
        });
        // Set the value of the language switcher based on the saved language
        if (localStorage.getItem('language')) {
            languageSwitcher.value = localStorage.getItem('language');
        }
    }
}

function loadComponent(id, file, callback) {
    console.log(`Start loading component: ${file} into element with ID: ${id}`);
    fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${file}: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = html;
                console.log(`Component loaded: ${file}`);
                if (callback) callback();
                // Reapply internationalization after loading the component
                internationalization();
            } else {
                console.error(`Element with ID "${id}" not found.`);
            }
        })
        .catch(error => console.error(error));
}

// Load sidebar and floating button components
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded. Initializing components...');
    loadComponent('sidebar', 'sidebar.html', () => {
        setupLanguageSwitcher();
        internationalization(); // Reapply internationalization after loading the component
    });
    loadComponent('floating-button', 'floating-button.html');
    init();
});

// Existing functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const headerText = document.getElementById('terminalEffect');
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('sidebar-open');
    adjustHeaderTextMargin();
}

function adjustHeaderTextMargin() {
    const sidebar = document.getElementById('sidebar');
    const headerText = document.getElementById('terminalEffect');
    if (sidebar.classList.contains('open')) {
        headerText.style.marginLeft = '130px'; // Adjust this value based on your sidebar width
    } else {
        headerText.style.marginLeft = '20px';
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('#darkModeToggle i');
    icon.textContent = document.body.classList.contains('dark-mode') ? 'brightness_7' : 'brightness_4';
}

// Close sidebar when clicking outside
document.addEventListener('click', function (event) {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const headerText = document.getElementById('terminalEffect');
    const sidebarButton = document.querySelector('.floating-button');
    if (!sidebar.contains(event.target) && event.target !== sidebarButton && !sidebarButton.contains(event.target)) {
        sidebar.classList.remove('open');
        mainContent.classList.remove('sidebar-open');
        headerText.style.marginLeft = '20px';
    }
});

// Terminal effect for the header
const text = "Hanjo Mei's Cyber Crib";
terminalElement = document.getElementById('terminalEffect');
let i = 0;
function typeWriter() {
    if (i < text.length) {
        terminalElement.innerHTML += text.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
    }
}

function showTooltip(element, message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerText = message;
    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY}px`;

    element.onmouseout = () => {
        document.body.removeChild(tooltip);
    };
}

function autoDarkMode() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.toggle('dark-mode');
    }
}

function internationalization() {
    let defaultLang = localStorage.getItem('language') || 'en-US';
    $("[i18n]").i18n({
        defaultLang: defaultLang,
        filePath: "i18n/",
        filePrefix: "",
        fileSuffix: "",
        forever: true,
        callback: function () {
            console.log('Internationalization applied.');
        }
    });
}

function switchLanguage(lang) {
    console.log(`Switching language to: ${lang}`);
    localStorage.setItem('language', lang);
    internationalization();
    // Reload sidebar and floating button components
    loadComponent('sidebar', 'sidebar.html', () => {
        setupLanguageSwitcher();
        // If you have any other components that need to be reloaded, add them here
    });
    loadComponent('floating-button', 'floating-button.html');
}