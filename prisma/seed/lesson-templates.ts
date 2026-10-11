// A few Python beginner lessons so a fresh stack has something to play.
// Multiple choice answers are the text of the right alternative; code
// completion answers are the right words joined without spaces, which is
// what the app sends back.
export const lessonTemplates: Record<string, Record<string, unknown>[]> = {
  python: [
    {
      template_name: 'multiple_choice',
      level: 'beginner',
      question: 'O que este código mostra na tela?',
      code: '```python\nx = 2\nprint(x * 3)\n```',
      answer: '6',
      alternatives: { a: '5', b: '6', c: '23', d: 'x * 3' },
    },
    {
      template_name: 'multiple_choice',
      level: 'beginner',
      question: 'Qual destes é um tipo de dado para números inteiros?',
      answer: 'int',
      alternatives: { a: 'str', b: 'bool', c: 'int', d: 'list' },
    },
    {
      template_name: 'code_completion_exercise',
      level: 'beginner',
      question: 'Complete o código para mostrar "Olá" na tela.',
      code: '```python\n____("Olá")\n```',
      answer: 'print',
      alternatives: { a: 'print', b: 'input', c: 'len', d: 'echo' },
    },
    {
      template_name: 'code_completion_exercise',
      level: 'beginner',
      question: 'Complete o laço para repetir 3 vezes.',
      code: '```python\nfor i in ____(3):\n    print(i)\n```',
      answer: 'range',
      alternatives: { a: 'list', b: 'range', c: 'loop', d: 'repeat' },
    },
  ],
};
