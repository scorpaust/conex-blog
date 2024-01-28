import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository';
import { CreateAuthorUsecase } from './create-author.usecase';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'node:child_process';
import { AuthorDataBuilder } from '../helpers/author-data-builder';
import { ConflictError } from '../../shared/errors/conflict-error';
import { BadRequestError } from '../../shared/errors/bad-request-error';


describe('CreateAuthorUseCase Integration Tests', () => {
  let module: TestingModule

  let repository: AuthorsPrismaRepository

  let usecase: CreateAuthorUsecase.UseCase

  const prisma = new PrismaClient()

  const TIMEOUT = 50000; // Adjust this value as needed

  beforeAll(async() => {
    execSync('npm run prisma:migratetest')

    await prisma.$connect()

    module = await Test.createTestingModule({}).compile()

    repository = new AuthorsPrismaRepository(prisma as any)

    usecase = new CreateAuthorUsecase.UseCase(repository)

  }, TIMEOUT)

  beforeEach(async() => {
    await prisma.author.deleteMany()
  })

  afterAll(async() => {
    if (module)
      await module.close()
  })

  test('should create an author', async () => {
    const data = AuthorDataBuilder({})

    const author = await usecase.execute(data)

    expect(author.id).toBeDefined()

    expect(author.createdAt).toBeInstanceOf(Date)

    expect(author).toMatchObject(data)
  })

  test('should not be able to create a new author with an already registered email', async () => {
    const data = AuthorDataBuilder({ email: 'scorpaust@hotmail.com'})

    await usecase.execute(data)

    await expect(() => usecase.execute(data)).rejects.toBeInstanceOf(ConflictError)

  })

  test('should throw error when name or email are not provided', async () => {
    const data1 = AuthorDataBuilder({})

    data1.name = null

    const data2 = AuthorDataBuilder({})

    data2.email = null

    await expect(() => usecase.execute(data1)).rejects.toBeInstanceOf(BadRequestError)

    await expect(() => usecase.execute(data2)).rejects.toBeInstanceOf(BadRequestError)
  })

})
