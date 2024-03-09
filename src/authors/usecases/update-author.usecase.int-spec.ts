import { Test, TestingModule } from '@nestjs/testing'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { UpdateAuthorUsecase } from './update-author.usecase'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { AuthorDataBuilder } from '../helpers/author-data-builder'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { BadRequestError } from '@/shared/errors/bad-request-error'
import { ConflictError } from '../../shared/errors/conflict-error'

describe('UpdateAuthorUseCase Integration Tests', () => {
  let module: TestingModule

  let repository: AuthorsPrismaRepository

  let usecase: UpdateAuthorUsecase.UseCase

  const prisma = new PrismaClient()

  const TIMEOUT = 50000 // Adjust this value as needed

  beforeAll(async () => {
    execSync('npm run prisma:migratetest')

    await prisma.$connect()

    module = await Test.createTestingModule({}).compile()

    repository = new AuthorsPrismaRepository(prisma as any)

    usecase = new UpdateAuthorUsecase.UseCase(repository)
  }, TIMEOUT)

  beforeEach(async () => {
    await prisma.author.deleteMany()
  })

  afterAll(async () => {
    if (module) await module.close()
  })

  test('should throw an error when id cannot be found', async () => {
    const input = {
      id: null,
    }

    await expect(() => usecase.execute(input)).rejects.toBeInstanceOf(
      BadRequestError,
    )
  })

  test('should throw an error when provided email is duplicated', async () => {
    const data = AuthorDataBuilder({ email: 'aa@a.pt' })

    await prisma.author.create({ data })

    const secondAuthor = await prisma.author.create({
      data: AuthorDataBuilder({}),
    })

    secondAuthor.email = 'aa@a.pt'

    await expect(() => usecase.execute(secondAuthor)).rejects.toBeInstanceOf(
      ConflictError,
    )
  })

  test('should be able to update author', async () => {
    const data = AuthorDataBuilder({})

    const author = await repository.create(data)

    const result = await usecase.execute({
      ...author,
      name: 'Name updated',
      email: 'aa@a.pt',
    })

    expect(result.name).toEqual('Name updated')

    expect(result.email).toEqual('aa@a.pt')
  })
})
