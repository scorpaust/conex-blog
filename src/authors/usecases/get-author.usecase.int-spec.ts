import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository';
import { GetAuthorUsecase } from './get-author.usecase';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'node:child_process';
import { AuthorDataBuilder } from '../helpers/author-data-builder';
import { NotFoundError } from '@/shared/errors/not-found-error';


describe('GetAuthorUseCase Integration Tests', () => {
  let module: TestingModule

  let repository: AuthorsPrismaRepository

  let usecase: GetAuthorUsecase.UseCase

  const prisma = new PrismaClient()

  const TIMEOUT = 50000; // Adjust this value as needed

  beforeAll(async() => {
    execSync('npm run prisma:migratetest')

    await prisma.$connect()

    module = await Test.createTestingModule({}).compile()

    repository = new AuthorsPrismaRepository(prisma as any)

    usecase = new GetAuthorUsecase.UseCase(repository)

  }, TIMEOUT)

  beforeEach(async() => {
    await prisma.author.deleteMany()
  })

  afterAll(async() => {
    if (module)
      await module.close()
  })

  test('should throw an error when id cannot be found', async () => {
    await expect(() => usecase.execute({ id: 'f97caebc-bd7d-42db-bfa9-0947e4cebea9' })).rejects.toBeInstanceOf(NotFoundError)
  })

  test('should return an author when a valid id is provided', async () => {
    const data = AuthorDataBuilder({})

    const author = await repository.create(data)

    const result = await usecase.execute({ id: author.id})

    expect(result).toStrictEqual(author)
  })

})
