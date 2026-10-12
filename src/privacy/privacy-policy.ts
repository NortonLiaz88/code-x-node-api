// The privacy policy the app shows at sign-up and in settings. Changing the
// text means a new version: sign-up only accepts the current one.
//
// Draft for MVP 1 testers: the data controller's name and a contact
// channel still need to be added before it goes to real students.
export const PRIVACY_POLICY_VERSION = '2026-10-12';

export const PRIVACY_POLICY_SECTIONS: { title: string; text: string }[] = [
  {
    title: 'O que guardamos',
    text:
      'Seu nome de usuário, email, celular (se você informar) e senha protegida. ' +
      'Suas respostas do cadastro: linguagem, nível, temas de interesse e motivação. ' +
      'Seu progresso nas lições e as conversas com o tutor.',
  },
  {
    title: 'Para que usamos',
    text:
      'Para ensinar programação no seu ritmo: escolher lições, adaptar as respostas do tutor ' +
      'e mostrar seu progresso. Também olhamos números gerais de uso (por exemplo, quanto ' +
      'o tutor demora para responder) para melhorar o app. Não vendemos seus dados.',
  },
  {
    title: 'O tutor',
    text:
      'O que você escreve no chat é enviado a um modelo de linguagem para gerar a resposta. ' +
      'Nesta versão de testes, o modelo roda nos servidores do projeto. ' +
      'Evite escrever no chat informações de saúde ou outros dados pessoais que não sejam ' +
      'necessários. Se escrever, elas ficam guardadas junto com a conversa.',
  },
  {
    title: 'Por quanto tempo',
    text:
      'Guardamos seus dados e suas conversas enquanto sua conta existir. ' +
      'Quando você apaga a conta, apagamos tudo: conta, respostas, progresso e conversas.',
  },
  {
    title: 'Seus direitos',
    text:
      'No app, em Conta, você pode ler esta política, baixar uma cópia dos seus dados e ' +
      'apagar sua conta a qualquer momento. Esses direitos vêm da LGPD (Lei 13.709/2018).',
  },
];
