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

  test('should throw an error when updating an author not found', async () => {

    const data = AuthorDataBuilder({})

    const author = {
      id: 'f97caebc-bd7d-42db-bfa9-0947e4cebea9',
      ...data
    }

    await expect(repository.update(author)).rejects.toThrow(
      new NotFoundError(
        'Author not found using ID f97caebc-bd7d-42db-bfa9-0947e4cebea9.'
      )
    )
  });

  test('should update an author', async () => {
    const data = AuthorDataBuilder({})

    const author = await repository.create(data)

    const result = await repository.update({
      ...author,
      name: 'new name'
    })

    expect(result.name).toBe('new name')
  })

  test('should throw an error when deleting an author not found', async () => {

    await expect(repository.delete('f97caebc-bd7d-42db-bfa9-0947e4cebea9')).rejects.toThrow(
      new NotFoundError(
        'Author not found using ID f97caebc-bd7d-42db-bfa9-0947e4cebea9.'
      )
    )
  });

  test('should delete an author', async () => {
    const data = AuthorDataBuilder({})

    const author = await repository.create(data)

    const result = await repository.delete(author.id)

    expect(result).toMatchObject(author)
  })

  test('should return null if it does not find an author with the provided email', async () => {
    const result = await repository.findByEmail('scorpaust@hotmail.com')

    expect(result).toBeNull()
  })

  test('should return an author using search by email', async () => {
    const data = AuthorDataBuilder({ email: 'scorpaust@hotmail.com'})

    const author = await prisma.author.create({ data })

    const result = await repository.findByEmail('scorpaust@hotmail.com')

    expect(result).toMatchObject(author)

  })

  describe('Search method', () => {

    test('should only apply pagination when the parameters are null', async () => {
      const createdAt = new Date()

      const data = []

      const arrange = Array(16).fill(AuthorDataBuilder({}))

      arrange.forEach((element, index) => {
        const timestamp = createdAt.getTime() + index

        data.push({
          ...element,
          email: `author${index}@a.com`,
          createdAt: new Date(timestamp),
        })
      })

      await prisma.author.createMany({ data })

      const result = await repository.search({})

      expect(result.total).toBe(16)

      expect(result.items.length).toBe(15)

      result.items.forEach((item) => {
        expect(item.id).toBeDefined()
      })

      result.items.reverse().forEach((item, index) => {
        expect(item.email).toEqual(`author${index + 1}@a.com`)
      })
    })

    test('should apply pagination and ordering', async () => {
      const createdAt = new Date()

      const data = []

      const arrange = 'badec'

      arrange.split('').forEach((element, index) => {
        const timestamp = createdAt.getTime() + index

        data.push({
          ...AuthorDataBuilder({ name: element}),
          email: `author${index}@a.com`,
          createdAt: new Date(timestamp),
        })
      })

      await prisma.author.createMany({ data })

      const result1 = await repository.search({
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc'
      })

      expect(result1.items[0]).toMatchObject(data[1])

      expect(result1.items[1]).toMatchObject(data[0])

      const result2 = await repository.search({
        page: 2,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc'
      })

      expect(result2.items[0]).toMatchObject(data[4])

      expect(result2.items[1]).toMatchObject(data[2])

    })

    test('should apply pagination, filter and ordering', async () => {
      const createdAt = new Date()

      const data = []

      const arrange = ['test', 'a', 'TEST', 'b', 'Test']

      arrange.forEach((element, index) => {
        const timestamp = createdAt.getTime() + index

        data.push({
          ...AuthorDataBuilder({ name: element}),
          email: `author${index}@a.com`,
          createdAt: new Date(timestamp),
        })
      })

      await prisma.author.createMany({ data })

      const result1 = await repository.search({
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'TEST'
      })

      expect(result1.items[0]).toMatchObject(data[0])

      expect(result1.items[1]).toMatchObject(data[4])

      const result2 = await repository.search({
        page: 2,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'TEST'
      })

      expect(result2.items[0]).toMatchObject(data[2])

      expect(result2.items.length).toBe(1)

    })

  })
});
