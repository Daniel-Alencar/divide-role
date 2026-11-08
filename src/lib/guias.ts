// Guias para quem busca como dividir uma conta. Os valores do exemplo são calculados
// na página com o mesmo algoritmo do acerto, então o texto não cita o resultado.

import type { Gasto } from "./acerto.ts";

export type Pergunta = { p: string; r: string };

export type Guia = {
  slug: string;
  titulo: string;
  descricao: string;
  resumo: string;
  atualizadoEm: string;
  introducao: string[];
  secoes: { titulo: string; paragrafos: string[] }[];
  exemplo: {
    contexto: string;
    pessoas: string[];
    gastos: (Gasto & { descricao: string })[];
    comentario: string;
  };
  perguntas: Pergunta[];
};

const REAIS = 100;

export const GUIAS: Guia[] = [
  {
    slug: "como-dividir-a-conta-do-churrasco",
    titulo: "Como dividir a conta do churrasco",
    descricao:
      "Passo a passo para dividir carne, bebida e carvão de forma justa, com exemplo de cálculo e Pix no valor certo para cada pessoa do churrasco.",
    resumo: "Carne, bebida e carvão pagos por pessoas diferentes, e quem não bebe fora da cerveja.",
    atualizadoEm: "2026-11-08",
    introducao: [
      "O churrasco costuma ser pago aos pedaços: alguém compra a carne, outra pessoa passa no mercado para buscar a cerveja e uma terceira leva o carvão. Dividir o total pelo número de pessoas parece simples, mas ignora quem já pagou o quê e quem não consumiu parte das coisas.",
      "O jeito justo é tratar cada compra como um gasto separado, com quem pagou e quem participou. No fim, basta comparar o que cada pessoa pagou com o que consumiu.",
    ],
    secoes: [
      {
        titulo: "Anote cada compra separadamente",
        paragrafos: [
          "Peça para cada pessoa informar o valor de cada nota: açougue, mercado, gelo, carvão, descartáveis. Separar por tipo de item é o que permite tirar da conta quem não participou daquele gasto.",
          "Quem cedeu a churrasqueira ou passou o dia na grelha não precisa entrar nas contas de um jeito especial. Se o grupo combinar que essa pessoa não paga, basta desmarcá-la dos gastos.",
        ],
      },
      {
        titulo: "Quem não bebe não paga a cerveja",
        paragrafos: [
          "É a maior fonte de reclamação depois do churrasco. Lance a bebida alcoólica como um gasto à parte e divida só entre quem bebeu. O mesmo vale para vegetarianos e a carne: lance a carne separada dos acompanhamentos.",
        ],
      },
      {
        titulo: "Acerte com o menor número de transferências",
        paragrafos: [
          "Se cada pessoa pagar a sua parte de cada compra para quem comprou, um grupo de quatro pode precisar de muitos Pix. Compensando os saldos, quem deve paga direto para quem tem a receber, e o número de transferências cai.",
        ],
      },
    ],
    exemplo: {
      contexto: "Quatro amigos fizeram um churrasco. Carla não bebe cerveja e Ana e Bruno não tomaram refrigerante.",
      pessoas: ["Ana", "Bruno", "Carla", "Davi"],
      gastos: [
        { descricao: "Carne", valorCentavos: 240 * REAIS, pagoPor: "Ana", divididoEntre: ["Ana", "Bruno", "Carla", "Davi"] },
        { descricao: "Cerveja", valorCentavos: 120 * REAIS, pagoPor: "Bruno", divididoEntre: ["Ana", "Bruno", "Davi"] },
        { descricao: "Carvão e gelo", valorCentavos: 40 * REAIS, pagoPor: "Carla", divididoEntre: ["Ana", "Bruno", "Carla", "Davi"] },
        { descricao: "Refrigerante", valorCentavos: 20 * REAIS, pagoPor: "Davi", divididoEntre: ["Carla", "Davi"] },
      ],
      comentario: "Cada gasto foi dividido só entre quem participou dele, e os saldos foram compensados entre todos.",
    },
    perguntas: [
      {
        p: "Como dividir o churrasco quando alguém levou acompanhante?",
        r: "Adicione o acompanhante como mais um participante. Cada pessoa marcada em um gasto paga uma parte igual, e depois os dois podem combinar quem acerta.",
      },
      {
        p: "E se alguém chegar só no fim?",
        r: "Desmarque essa pessoa dos gastos que ela não aproveitou. A divisão é feita gasto por gasto.",
      },
    ],
  },
  {
    slug: "como-dividir-despesas-de-viagem",
    titulo: "Como dividir as despesas de uma viagem em grupo",
    descricao:
      "Como dividir hospedagem, gasolina, mercado e passeios entre amigos, quem deve para quem no fim da viagem e como acertar tudo com poucos Pix.",
    resumo: "Hospedagem, gasolina e passeios que só parte do grupo fez, acertados no fim da viagem.",
    atualizadoEm: "2026-11-08",
    introducao: [
      "Em uma viagem, as despesas se acumulam por dias e passam por várias mãos. Uma pessoa reserva a pousada, outra abastece o carro, outra paga o mercado. Se ninguém anotar, o acerto no fim vira discussão de memória.",
      "O que resolve é registrar tudo em um lugar só, de preferência na hora em que o gasto acontece, e deixar o cálculo final para o último dia.",
    ],
    secoes: [
      {
        titulo: "Lance os gastos durante a viagem",
        paragrafos: [
          "Deixe o link do grupo salvo e lance cada despesa logo depois de pagar. Guarde também a descrição: \"mercado do segundo dia\" ajuda quando alguém quiser conferir.",
        ],
      },
      {
        titulo: "Separe o que é de todos do que é de alguns",
        paragrafos: [
          "Hospedagem, transporte e o mercado da casa costumam ser de todos. Passeios, ingressos e jantares fora nem sempre são. Divida cada um desses gastos só entre quem foi.",
          "Se o grupo se dividiu em carros diferentes, lance a gasolina de cada carro separadamente, marcando só quem estava naquele carro.",
        ],
      },
      {
        titulo: "Gastos em outra moeda",
        paragrafos: [
          "O Divide Rolê trabalha em reais. Em viagem internacional, converta o valor pela cotação que apareceu na fatura ou no câmbio usado e lance em reais.",
        ],
      },
    ],
    exemplo: {
      contexto: "Três amigos passaram um fim de semana na praia. Lia não foi ao passeio de barco.",
      pessoas: ["Lia", "Marcos", "Nina"],
      gastos: [
        { descricao: "Pousada", valorCentavos: 900 * REAIS, pagoPor: "Lia", divididoEntre: ["Lia", "Marcos", "Nina"] },
        { descricao: "Gasolina e pedágio", valorCentavos: 300 * REAIS, pagoPor: "Marcos", divididoEntre: ["Lia", "Marcos", "Nina"] },
        { descricao: "Mercado", valorCentavos: 180 * REAIS, pagoPor: "Nina", divididoEntre: ["Lia", "Marcos", "Nina"] },
        { descricao: "Passeio de barco", valorCentavos: 200 * REAIS, pagoPor: "Marcos", divididoEntre: ["Marcos", "Nina"] },
      ],
      comentario: "Lia não entra na divisão do barco, e quem adiantou mais dinheiro recebe a diferença.",
    },
    perguntas: [
      {
        p: "Quando fazer o acerto da viagem?",
        r: "No fim, quando todas as despesas estiverem lançadas. Fazer o acerto só uma vez evita vários Pix pequenos durante os dias de viagem.",
      },
      {
        p: "Todo mundo precisa instalar algum aplicativo?",
        r: "Não. O link abre no navegador do celular e ninguém precisa criar conta.",
      },
    ],
  },
  {
    slug: "como-dividir-a-conta-do-bar",
    titulo: "Como dividir a conta do bar entre amigos",
    descricao:
      "Como dividir a conta do bar quando nem todo mundo consumiu o mesmo: petiscos, bebidas e taxa de serviço, com exemplo e acerto no Pix.",
    resumo: "Uma pessoa paga a comanda, e cada um acerta só pelo que consumiu.",
    atualizadoEm: "2026-11-08",
    introducao: [
      "Na hora de fechar a comanda, a divisão igual costuma ser injusta com quem tomou um refrigerante enquanto a mesa pedia rodadas de chope. E nem todo bar aceita dividir o pagamento em vários cartões.",
      "Uma saída prática é uma pessoa pagar a conta inteira e o restante acertar com ela por Pix, cada um pela parte que consumiu.",
    ],
    secoes: [
      {
        titulo: "Agrupe a comanda por tipo de consumo",
        paragrafos: [
          "Não é preciso lançar item por item. Agrupe em blocos: petiscos que a mesa dividiu, bebidas alcoólicas e bebidas sem álcool. Cada bloco vira um gasto, dividido entre quem consumiu.",
        ],
      },
      {
        titulo: "E a taxa de serviço?",
        paragrafos: [
          "Se a mesa decidir pagar os 10%, a forma mais simples é lançar o valor da taxa como um gasto separado, dividido entre todos. Quem quiser mais precisão pode somar 10% em cada bloco antes de lançar.",
        ],
      },
      {
        titulo: "Feche o acerto ainda na mesa",
        paragrafos: [
          "Quem pagou a conta informa a própria chave Pix. Cada pessoa copia o código com o valor certo, ou lê o QR Code, e paga antes de ir embora.",
        ],
      },
    ],
    exemplo: {
      contexto: "Rafa pagou a comanda inteira. Sofia não bebeu álcool e só ela e Vitor pediram refrigerante.",
      pessoas: ["Rafa", "Sofia", "Téo", "Vitor"],
      gastos: [
        { descricao: "Petiscos", valorCentavos: 96 * REAIS, pagoPor: "Rafa", divididoEntre: ["Rafa", "Sofia", "Téo", "Vitor"] },
        { descricao: "Chope", valorCentavos: 120 * REAIS, pagoPor: "Rafa", divididoEntre: ["Rafa", "Téo", "Vitor"] },
        { descricao: "Refrigerante", valorCentavos: 24 * REAIS, pagoPor: "Rafa", divididoEntre: ["Sofia", "Vitor"] },
        { descricao: "Taxa de serviço", valorCentavos: 24 * REAIS, pagoPor: "Rafa", divididoEntre: ["Rafa", "Sofia", "Téo", "Vitor"] },
      ],
      comentario: "Como Rafa pagou tudo, cada pessoa faz um único Pix para Rafa, no valor do que consumiu.",
    },
    perguntas: [
      {
        p: "É obrigatório pagar a taxa de serviço?",
        r: "Os 10% são opcionais para o cliente. Se a mesa decidir não pagar, basta não lançar esse gasto.",
      },
      {
        p: "Como dividir quando alguém saiu antes?",
        r: "Lance as rodadas em que a pessoa não estava como um gasto separado e desmarque o nome dela.",
      },
    ],
  },
  {
    slug: "como-dividir-as-contas-da-casa",
    titulo: "Como dividir as contas da casa ou da república",
    descricao:
      "Como dividir aluguel, luz, internet e mercado entre quem mora junto, inclusive quando um quarto custa mais, com acerto mensal no Pix.",
    resumo: "Aluguel, luz e internet entre quem mora junto, mesmo com um quarto maior que os outros.",
    atualizadoEm: "2026-11-08",
    introducao: [
      "Em uma república ou apartamento dividido, as contas chegam em nomes diferentes e em datas diferentes. Sem um registro, alguém sempre fica com a sensação de estar adiantando dinheiro.",
      "Combine um dia do mês para fechar as contas e lance tudo em um rolê daquele mês.",
    ],
    secoes: [
      {
        titulo: "Crie um rolê por mês",
        paragrafos: [
          "Um rolê chamado \"Casa: março\" mantém o acerto de cada mês separado e deixa fácil conferir o que foi pago. Quando todo mundo tiver acertado, o rolê pode ser apagado.",
        ],
      },
      {
        titulo: "Quando um quarto custa mais",
        paragrafos: [
          "A divisão de cada gasto é sempre em partes iguais entre as pessoas marcadas. Para um quarto maior, lance o aluguel em dois gastos: a parte igual para todos e a diferença do quarto, marcando só quem mora nele.",
        ],
      },
      {
        titulo: "Mercado e limpeza",
        paragrafos: [
          "Lance o que é da casa, como produtos de limpeza e papel higiênico, dividido entre todos. O que é de uma pessoa só fica fora da conta.",
        ],
      },
    ],
    exemplo: {
      contexto: "Três pessoas dividem um apartamento, e Iara fica com a suíte, que custa mais.",
      pessoas: ["Gabi", "Hugo", "Iara"],
      gastos: [
        { descricao: "Aluguel (parte igual)", valorCentavos: 2100 * REAIS, pagoPor: "Gabi", divididoEntre: ["Gabi", "Hugo", "Iara"] },
        { descricao: "Diferença da suíte", valorCentavos: 300 * REAIS, pagoPor: "Gabi", divididoEntre: ["Iara"] },
        { descricao: "Luz", valorCentavos: 180 * REAIS, pagoPor: "Hugo", divididoEntre: ["Gabi", "Hugo", "Iara"] },
        { descricao: "Internet", valorCentavos: 120 * REAIS, pagoPor: "Hugo", divididoEntre: ["Gabi", "Hugo", "Iara"] },
        { descricao: "Mercado da casa", valorCentavos: 270 * REAIS, pagoPor: "Iara", divididoEntre: ["Gabi", "Hugo", "Iara"] },
      ],
      comentario: "A diferença da suíte fica só com Iara, e as demais contas são divididas igualmente entre os três.",
    },
    perguntas: [
      {
        p: "Como dividir quando alguém passou parte do mês fora?",
        r: "Se o grupo combinar um desconto, lance o gasto em duas partes: uma dividida entre todos e outra só entre quem ficou em casa.",
      },
      {
        p: "Os dados ficam salvos para sempre?",
        r: "Não. Um rolê sem alterações por 180 dias é apagado automaticamente, e qualquer pessoa com o link pode apagá-lo antes.",
      },
    ],
  },
];

export const guiaPorSlug = (slug: string) => GUIAS.find((g) => g.slug === slug);
