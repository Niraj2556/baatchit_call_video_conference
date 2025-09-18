export class DOMUtils {
    static getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    }

    static createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'srcObject') {
                element.srcObject = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static addClass(element, className) {
        if (element) {
            element.classList.add(className);
        }
    }

    static removeClass(element, className) {
        if (element) {
            element.classList.remove(className);
        }
    }

    static toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    }

    static hasClass(element, className) {
        return element ? element.classList.contains(className) : false;
    }

    static show(element) {
        this.removeClass(element, 'hidden');
    }

    static hide(element) {
        this.addClass(element, 'hidden');
    }

    static isHidden(element) {
        return this.hasClass(element, 'hidden');
    }
}