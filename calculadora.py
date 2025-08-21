import sys

def main():
    if len(sys.argv) < 4:
        print("Uso: calculadora.py <operacao> <num1> <num2>")
        print("Operações: soma, subtrai, multiplica, divide")
        sys.exit(1)
    operacao = sys.argv[1]
    try:
        num1 = float(sys.argv[2])
        num2 = float(sys.argv[3])
    except ValueError:
        print("Os números devem ser válidos.")
        sys.exit(1)

    if operacao == "soma":
        print(num1 + num2)
    elif operacao == "subtrai":
        print(num1 - num2)
    elif operacao == "multiplica":
        print(num1 * num2)
    elif operacao == "divide":
        if num2 == 0:
            print("Erro: divisão por zero.")
            sys.exit(1)
        print(num1 / num2)
    else:
        print("Operação inválida.")

if __name__ == "__main__":
    main()
