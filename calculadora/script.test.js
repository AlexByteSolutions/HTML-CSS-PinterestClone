const { calculate } = require('./script');

describe('Calculadora', () => {
    test('Soma de 2 e 3 deve ser 5', () => {
        document.body.innerHTML = `
            <input id="num1" value="2">
            <input id="num2" value="3">
            <span id="resultado"></span>
        `;
        calculate('add');
        expect(document.getElementById('resultado').textContent).toBe('5');
    });

    test('Subtração de 5 e 3 deve ser 2', () => {
        document.body.innerHTML = `
            <input id="num1" value="5">
            <input id="num2" value="3">
            <span id="resultado"></span>
        `;
        calculate('subtract');
        expect(document.getElementById('resultado').textContent).toBe('2');
    });

    test('Multiplicação de 4 e 5 deve ser 20', () => {
        document.body.innerHTML = `
            <input id="num1" value="4">
            <input id="num2" value="5">
            <span id="resultado"></span>
        `;
        calculate('multiply');
        expect(document.getElementById('resultado').textContent).toBe('20');
    });

    test('Divisão de 10 por 2 deve ser 5', () => {
        document.body.innerHTML = `
            <input id="num1" value="10">
            <input id="num2" value="2">
            <span id="resultado"></span>
        `;
        calculate('divide');
        expect(document.getElementById('resultado').textContent).toBe('5');
    });

    test('Divisão por zero deve exibir alerta', () => {
        document.body.innerHTML = `
            <input id="num1" value="10">
            <input id="num2" value="0">
            <span id="resultado"></span>
        `;
        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
        calculate('divide');
        expect(alertMock).toHaveBeenCalledWith('Divisão por zero não é permitida.');
        alertMock.mockRestore();
    });
});
