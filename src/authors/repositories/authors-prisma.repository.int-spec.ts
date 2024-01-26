import { Test, TestingModule } from "@nestjs/testing"
import { AuthorsPrismaRepository } from "./authors-prisma.repository"
import { PrismaClient } from "@prisma/client"
import { execSync } from "node:child_process"
import { NotFoundError } from '../../shared/errors/not-found-error';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuthorDataBuilder } from "../helpers/author-data-builder";

describe('AuthorsPrismaRepository Integration Tests', () => {
  let module: TestingModule;
  let repository: AuthorsPrismaRepository;
  const prisma = new PrismaClient();

  const TIMEOUT = 50000; // Adjust this value as needed

  beforeAll(async () => {
    console.log('Running migrations...');
    execSync('npm run prisma:migratetest');

    console.log('Connecting to Prisma...');
    await prisma.$connect();

    console.log('Creating testing module...');
    module = await Test.createTestingModule({}).compile();
    console.log('Testing module created.');

    repository = new AuthorsPrismaRepository(prisma as PrismaService);
  }, TIMEOUT);

  beforeEach(async () => {
    console.log('Deleting all authors before each test...');
    await prisma.author.deleteMany();
  });

  afterAll(async () => {
    console.log('Closing module...');
    if (module) {
      await module.close();
      console.log('Module closed.');
    } else {
      console.log('Module was not initialized!');
    }
  });

  test('should throw an error when the id is not found', async () => {

    const result = repository.findById('f97caebc-bd7d-42db-bfa9-0947e4cebea9');

    await expect(result)
      .rejects.toThrow(
        new NotFoundError('Author not found using ID f97caebc-bd7d-42db-bfa9-0947e4cebea9.'),
      );
  });

  test('should find an author by id', async () => {

    const data = AuthorDataBuilder({});

    const author = await prisma.author.create({
      data
    })

    const result = await repository.findById(author.id)

    expect(result).toStrictEqual(author)
  });

  test('should create an author', async () => {

    const data = AuthorDataBuilder({});

    const author = await repository.create(data)

    expect(author).toMatchObject(data)
  });
});
