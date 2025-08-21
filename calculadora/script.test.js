const fs = require('fs');
const path = require('path');

// Carrega o código da calculadora no ambiente JSDOM
const scriptCode = fs.readFileSync(path.resolve(__dirname, 'script.js'), 'utf8');
eval(scriptCode);

describe('Calculadora', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="num1">
            <input id="num2">
            <span id="resultado"></span>
        `;
    });

    test('Soma de 2 e 3 deve ser 5', () => {
        document.getElementById('num1').value = '2';
        document.getElementById('num2').value = '3';
        calculate('add');
        expect(document.getElementById('resultado').textContent).toBe('5');
    });

    test('Subtração de 5 e 3 deve ser 2', () => {
        document.getElementById('num1').value = '5';
        document.getElementById('num2').value = '3';
        calculate('subtract');
        expect(document.getElementById('resultado').textContent).toBe('2');
    });

    test('Multiplicação de 4 e 5 deve ser 20', () => {
        document.getElementById('num1').value = '4';
        document.getElementById('num2').value = '5';
        calculate('multiply');
        expect(document.getElementById('resultado').textContent).toBe('20');
    });

    test('Divisão de 10 por 2 deve ser 5', () => {
        document.getElementById('num1').value = '10';
        document.getElementById('num2').value = '2';
        calculate('divide');
        expect(document.getElementById('resultado').textContent).toBe('5');
    });

    test('Divisão por zero deve exibir alerta', () => {
        document.getElementById('num1').value = '10';
        document.getElementById('num2').value = '0';
        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
        calculate('divide');
        expect(alertMock).toHaveBeenCalledWith('Divisão por zero não é permitida.');
        alertMock.mockRestore();
    });
});