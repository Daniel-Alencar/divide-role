// Gerador de QR Code (ISO/IEC 18004) sem dependências, para o Pix copia e cola.
// Modo byte, correção de erro nível M (~15%), versão escolhida automaticamente.
// Baseado no algoritmo de referência de Project Nayuki (licença MIT).

// Índice = versão (1 a 40), nível M.
const ECC_POR_BLOCO = [
  -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28,
  28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
];
const NUMERO_DE_BLOCOS = [
  -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29,
  31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
];
const BITS_FORMATO_NIVEL_M = 0;

const bit = (valor: number, i: number) => ((valor >>> i) & 1) !== 0;

function modulosDeDados(versao: number) {
  let total = (16 * versao + 128) * versao + 64;
  if (versao >= 2) {
    const alinhamentos = Math.floor(versao / 7) + 2;
    total -= (25 * alinhamentos - 10) * alinhamentos - 55;
    if (versao >= 7) total -= 36;
  }
  return total;
}

const palavrasDeDados = (versao: number) =>
  Math.floor(modulosDeDados(versao) / 8) - ECC_POR_BLOCO[versao] * NUMERO_DE_BLOCOS[versao];

// Reed-Solomon sobre GF(256) com polinômio 0x11D.
function multiplicarGF(x: number, y: number) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function divisorRS(grau: number) {
  const resultado = new Array<number>(grau).fill(0);
  resultado[grau - 1] = 1;
  let raiz = 1;
  for (let i = 0; i < grau; i++) {
    for (let j = 0; j < resultado.length; j++) {
      resultado[j] = multiplicarGF(resultado[j], raiz);
      if (j + 1 < resultado.length) resultado[j] ^= resultado[j + 1];
    }
    raiz = multiplicarGF(raiz, 0x02);
  }
  return resultado;
}

function restoRS(dados: number[], divisor: number[]) {
  const resultado = divisor.map(() => 0);
  for (const b of dados) {
    const fator = b ^ (resultado.shift() as number);
    resultado.push(0);
    divisor.forEach((coef, i) => (resultado[i] ^= multiplicarGF(coef, fator)));
  }
  return resultado;
}

/** Divide os dados em blocos, calcula a correção de cada um e intercala tudo. */
function adicionarCorrecao(dados: number[], versao: number) {
  const numBlocos = NUMERO_DE_BLOCOS[versao];
  const eccPorBloco = ECC_POR_BLOCO[versao];
  const palavrasTotais = Math.floor(modulosDeDados(versao) / 8);
  const blocosCurtos = numBlocos - (palavrasTotais % numBlocos);
  const tamanhoCurto = Math.floor(palavrasTotais / numBlocos);
  const divisor = divisorRS(eccPorBloco);

  const blocos: number[][] = [];
  for (let i = 0, k = 0; i < numBlocos; i++) {
    const bloco = dados.slice(k, k + tamanhoCurto - eccPorBloco + (i < blocosCurtos ? 0 : 1));
    k += bloco.length;
    const ecc = restoRS(bloco, divisor);
    if (i < blocosCurtos) bloco.push(0);
    blocos.push(bloco.concat(ecc));
  }

  const resultado: number[] = [];
  for (let i = 0; i < blocos[0].length; i++) {
    blocos.forEach((bloco, j) => {
      if (i !== tamanhoCurto - eccPorBloco || j >= blocosCurtos) resultado.push(bloco[i]);
    });
  }
  return resultado;
}

const MASCARAS: ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

class Matriz {
  readonly tamanho: number;
  readonly modulos: boolean[][];
  readonly funcao: boolean[][];
  readonly versao: number;

  constructor(versao: number) {
    this.versao = versao;
    this.tamanho = versao * 4 + 17;
    this.modulos = Array.from({ length: this.tamanho }, () => new Array<boolean>(this.tamanho).fill(false));
    this.funcao = Array.from({ length: this.tamanho }, () => new Array<boolean>(this.tamanho).fill(false));
  }

  fixar(x: number, y: number, escuro: boolean) {
    this.modulos[y][x] = escuro;
    this.funcao[y][x] = true;
  }

  desenharPadroes() {
    const n = this.tamanho;
    for (let i = 0; i < n; i++) {
      this.fixar(6, i, i % 2 === 0);
      this.fixar(i, 6, i % 2 === 0);
    }
    for (const [cx, cy] of [[3, 3], [n - 4, 3], [3, n - 4]]) {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const d = Math.max(Math.abs(dx), Math.abs(dy));
          const x = cx + dx;
          const y = cy + dy;
          if (x >= 0 && x < n && y >= 0 && y < n) this.fixar(x, y, d !== 2 && d !== 4);
        }
      }
    }
    const pos = this.posicoesAlinhamento();
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const cantoDeLocalizador =
          (i === 0 && j === 0) || (i === 0 && j === pos.length - 1) || (i === pos.length - 1 && j === 0);
        if (cantoDeLocalizador) continue;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            this.fixar(pos[i] + dx, pos[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
          }
        }
      }
    }
    this.desenharFormato(0);
    this.desenharVersao();
  }

  posicoesAlinhamento() {
    if (this.versao === 1) return [];
    const quantidade = Math.floor(this.versao / 7) + 2;
    const passo = Math.floor((this.versao * 8 + quantidade * 3 + 5) / (quantidade * 4 - 4)) * 2;
    const resultado = [6];
    for (let p = this.tamanho - 7; resultado.length < quantidade; p -= passo) resultado.splice(1, 0, p);
    return resultado;
  }

  desenharFormato(mascara: number) {
    const dados = (BITS_FORMATO_NIVEL_M << 3) | mascara;
    let resto = dados;
    for (let i = 0; i < 10; i++) resto = (resto << 1) ^ ((resto >>> 9) * 0x537);
    const bits = ((dados << 10) | resto) ^ 0x5412;
    const n = this.tamanho;

    for (let i = 0; i <= 5; i++) this.fixar(8, i, bit(bits, i));
    this.fixar(8, 7, bit(bits, 6));
    this.fixar(8, 8, bit(bits, 7));
    this.fixar(7, 8, bit(bits, 8));
    for (let i = 9; i < 15; i++) this.fixar(14 - i, 8, bit(bits, i));

    for (let i = 0; i < 8; i++) this.fixar(n - 1 - i, 8, bit(bits, i));
    for (let i = 8; i < 15; i++) this.fixar(8, n - 15 + i, bit(bits, i));
    this.fixar(8, n - 8, true);
  }

  desenharVersao() {
    if (this.versao < 7) return;
    let resto = this.versao;
    for (let i = 0; i < 12; i++) resto = (resto << 1) ^ ((resto >>> 11) * 0x1f25);
    const bits = (this.versao << 12) | resto;
    for (let i = 0; i < 18; i++) {
      const a = this.tamanho - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.fixar(a, b, bit(bits, i));
      this.fixar(b, a, bit(bits, i));
    }
  }

  desenharDados(palavras: number[]) {
    const n = this.tamanho;
    let i = 0;
    for (let direita = n - 1; direita >= 1; direita -= 2) {
      if (direita === 6) direita = 5;
      for (let v = 0; v < n; v++) {
        for (let j = 0; j < 2; j++) {
          const x = direita - j;
          const subindo = ((direita + 1) & 2) === 0;
          const y = subindo ? n - 1 - v : v;
          if (!this.funcao[y][x] && i < palavras.length * 8) {
            this.modulos[y][x] = bit(palavras[i >>> 3], 7 - (i & 7));
            i++;
          }
        }
      }
    }
  }

  aplicarMascara(mascara: number) {
    const regra = MASCARAS[mascara];
    for (let y = 0; y < this.tamanho; y++) {
      for (let x = 0; x < this.tamanho; x++) {
        if (!this.funcao[y][x] && regra(x, y)) this.modulos[y][x] = !this.modulos[y][x];
      }
    }
  }

  /** Penalidade da norma: quanto menor, mais fácil de ler pela câmera. */
  penalidade() {
    const n = this.tamanho;
    const m = this.modulos;
    let total = 0;
    const linhas = [
      ...m,
      ...Array.from({ length: n }, (_, x) => m.map((linha) => linha[x])),
    ];
    const padrao = [true, false, true, true, true, false, true, false, false, false, false];
    const invertido = [...padrao].reverse();

    for (const linha of linhas) {
      let sequencia = 1;
      for (let i = 1; i <= n; i++) {
        if (i < n && linha[i] === linha[i - 1]) {
          sequencia++;
        } else {
          if (sequencia >= 5) total += sequencia - 2;
          sequencia = 1;
        }
      }
      for (let i = 0; i + padrao.length <= n; i++) {
        const trecho = linha.slice(i, i + padrao.length);
        if (trecho.every((v, k) => v === padrao[k]) || trecho.every((v, k) => v === invertido[k])) total += 40;
      }
    }

    for (let y = 0; y < n - 1; y++) {
      for (let x = 0; x < n - 1; x++) {
        const c = m[y][x];
        if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) total += 3;
      }
    }

    const escuros = m.flat().filter(Boolean).length;
    total += (Math.ceil(Math.abs(escuros * 20 - n * n * 10) / (n * n)) - 1) * 10;
    return total;
  }
}

/** Matriz do QR Code: true = módulo escuro. Não inclui a margem branca. */
export function gerarQrCode(texto: string): boolean[][] {
  const bytes = [...new TextEncoder().encode(texto)];

  let versao = 1;
  const bitsNecessarios = (v: number) => 4 + (v <= 9 ? 8 : 16) + bytes.length * 8;
  while (bitsNecessarios(versao) > palavrasDeDados(versao) * 8) {
    if (++versao > 40) throw new Error("Texto grande demais para um QR Code");
  }

  const bits: boolean[] = [];
  const anexar = (valor: number, tamanho: number) => {
    for (let i = tamanho - 1; i >= 0; i--) bits.push(bit(valor, i));
  };
  anexar(0b0100, 4); // modo byte
  anexar(bytes.length, versao <= 9 ? 8 : 16);
  for (const b of bytes) anexar(b, 8);

  const capacidade = palavrasDeDados(versao) * 8;
  anexar(0, Math.min(4, capacidade - bits.length));
  anexar(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacidade; pad ^= 0xec ^ 0x11) anexar(pad, 8);

  const palavras: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    palavras.push(bits.slice(i, i + 8).reduce((acc, b) => (acc << 1) | (b ? 1 : 0), 0));
  }

  const matriz = new Matriz(versao);
  matriz.desenharPadroes();
  matriz.desenharDados(adicionarCorrecao(palavras, versao));

  let melhor = 0;
  let menorPenalidade = Infinity;
  for (let mascara = 0; mascara < 8; mascara++) {
    matriz.aplicarMascara(mascara);
    matriz.desenharFormato(mascara);
    const p = matriz.penalidade();
    if (p < menorPenalidade) {
      melhor = mascara;
      menorPenalidade = p;
    }
    matriz.aplicarMascara(mascara); // desfaz (a máscara é um XOR)
  }
  matriz.aplicarMascara(melhor);
  matriz.desenharFormato(melhor);
  return matriz.modulos;
}
