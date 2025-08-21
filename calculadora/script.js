function calculate(operation) {
    const num1 = parseFloat(document.getElementById('num1').value);
    const num2 = parseFloat(document.getElementById('num2').value);
    let result = 0;

    if (isNaN(num1) || isNaN(num2)) {
        alert('Por favor, insira números válidos.');
        return;
    }

    switch (operation) {
        case 'add':
            result = num1 + num2;
            break;
        case 'subtract':
            result = num1 - num2;
            break;
        case 'multiply':
            result = num1 * num2;
            break;
        case 'divide':
            if (num2 === 0) {
                alert('Divisão por zero não é permitida.');
                return;
            }
            result = num1 / num2;
            break;
    }

    document.getElementById('resultado').textContent = result;
}

if (typeof document !== 'undefined') {
    document.querySelectorAll('a.nav-link').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

if (typeof window === 'undefined' && typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { calculate };
}
