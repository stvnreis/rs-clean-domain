import { InMemoryAnswerRepository } from '@/../test/repositories/in-memory-answer.repository';
import { EditAnswer } from './edit-answer';
import { makeAnswer } from '@/../test/factories/make-answer';
import { UniqueEntityId } from '../../enterprise/entities/value-objects/unique-entity-id';
import { NotAllowedError } from './errors/not-allowed.error';
import { ResourceNotFoundError } from './errors/resource-not-found.error';

let inMemoryAnswerRepository: InMemoryAnswerRepository;
let sut: EditAnswer;

describe('Edit Answer', () => {
  beforeEach(() => {
    inMemoryAnswerRepository = new InMemoryAnswerRepository();
    sut = new EditAnswer(inMemoryAnswerRepository);
  });

  it('should be able to edit an answer', async () => {
    const answer = makeAnswer(
      { authorId: new UniqueEntityId('author-1') },
      new UniqueEntityId('answer-1'),
    );

    await inMemoryAnswerRepository.create(answer);

    const result = await sut.execute({
      authorId: 'author-1',
      answerId: 'answer-1',
      content: 'conteudo teste',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryAnswerRepository.items[0]).toMatchObject({
      ...answer,
    });
  });

  it('should not be able to edit someone elses answer', async () => {
    const answer = makeAnswer(
      { authorId: new UniqueEntityId('author-1') },
      new UniqueEntityId('answer-1'),
    );

    await inMemoryAnswerRepository.create(answer);
    const result = await sut.execute({
      authorId: 'author-2',
      answerId: 'answer-1',
      content: 'conteudo teste',
    });

    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should not be able to edit an answer that does not exist', async () => {
    const answer = makeAnswer(
      { authorId: new UniqueEntityId('author-1') },
      new UniqueEntityId('answer-1'),
    );

    await inMemoryAnswerRepository.create(answer);

    const result = await sut.execute({
      authorId: 'author-1',
      answerId: 'answer-2',
      content: 'conteudo teste',
    });

    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
