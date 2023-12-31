import { InMemoryQuestionRepository } from '@/../test/repositories/in-memory-question.repository';
import { ChooseQuestionBestAnswer } from './choose-question-best-answer';
import { makeQuestion } from '@/../test/factories/make-question';
import { UniqueEntityId } from '../../enterprise/entities/value-objects/unique-entity-id';
import { makeAnswer } from '@/../test/factories/make-answer';
import { NotAllowedError } from './errors/not-allowed.error';

let inMemoryQuestionRepository: InMemoryQuestionRepository;
let sut: ChooseQuestionBestAnswer;

describe('Choose Question Best Answer', () => {
  beforeEach(() => {
    inMemoryQuestionRepository = new InMemoryQuestionRepository();
    sut = new ChooseQuestionBestAnswer(inMemoryQuestionRepository);
  });

  it('should be able to choose question best answer', async () => {
    const newQuestion = makeQuestion(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('question-1'),
    );

    const answer = makeAnswer(
      {
        questionId: new UniqueEntityId('question-1'),
      },
      new UniqueEntityId('answer-1'),
    );

    await inMemoryQuestionRepository.create(newQuestion);

    const result = await sut.execute({
      questionAuthorId: newQuestion.authorId.toString(),
      questionId: newQuestion.id.toString(),
      bestAnswerId: answer.id.toString(),
    });

    if (result.isRight())
      expect(result.value.bestAnswerId!.toString()).toEqual(
        'answer-1',
      );
  });

  it('should not be able to choose another user question best answer', async () => {
    const newQuestion = makeQuestion(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('question-1'),
    );

    const answer = makeAnswer(
      {
        questionId: new UniqueEntityId('question-1'),
      },
      new UniqueEntityId('answer-1'),
    );

    await inMemoryQuestionRepository.create(newQuestion);

    const result = await sut.execute({
      questionAuthorId: 'author-2',
      questionId: newQuestion.id.toString(),
      bestAnswerId: answer.id.toString(),
    });

    if (result.isLeft())
      expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
