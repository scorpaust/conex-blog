import { Test, TestingModule } from "@nestjs/testing"
import { PostsPrismaRepository } from "./posts-prisma.repository"
import { PrismaClient } from "@prisma/client"
import { execSync } from "node:child_process";
import { NotFoundError } from '../../shared/errors/not-found-error';
import { PostsDataBuilder } from '../helpers/posts-data-builder';
import { AuthorDataBuilder } from '../../authors/helpers/author-data-builder';
import { printSchema } from "graphql";

describe('Posts Prisma Repository Integration Tests', () => {
  let module: TestingModule;
  let repository: PostsPrismaRepository;
  const prisma = new PrismaClient();

  const TIMEOUT = 50000; // Adjust this value as needed

  beforeAll(async () => {
    execSync("npm run prisma:migratetest")
    await prisma.$connect()
    module = await Test.createTestingModule({}).compile()
    repository = new PostsPrismaRepository(prisma as any)
  }, TIMEOUT)


  beforeEach(async () => {
    await prisma.post.deleteMany()
    await prisma.author.deleteMany()
  })

  afterAll(async () => {
    console.log('Closing module...');
    if (module) {
      await module.close();
      console.log('Module closed.');
    } else {
      console.log('Module was not initialized!');
    }
  })

  test("Should thrown an error when the id is not found", async () => {
    await expect(
      repository.findById('f97caebc-bd7d-42db-bfa9-0947e4cebea9')
    ).rejects.toThrow(
      new NotFoundError(
        'Post not found using ID f97caebc-bd7d-42db-bfa9-0947e4cebea9'
      )
    )
  })

  test("Should find a post by id", async () => {
    const postData = PostsDataBuilder({})
    const authorData = AuthorDataBuilder({})

    const author = await prisma.author.create({ data: authorData})

    const post = await prisma.post.create({ data: {
      ...postData,
      author: {
        connect: { ...author }
      }
    }})

    const result = await repository.findById(post.id)

    expect(result).toStrictEqual(post)
  })

  test('Should create a post', async () => {
    const postData = PostsDataBuilder({})
    const authorData = AuthorDataBuilder({})
    const author = await prisma.author.create({ data: authorData})

    const result = await repository.create({ ...postData, authorId: author.id })

    expect(result).toMatchObject(postData)
  })

  test('Should throw an error when updating a post not found', async () => {
    const data = PostsDataBuilder({})

    const post = {
      ...data,
      id: 'f97caebc-bd7d-42db-bfa9-0947e4cebea9',
      authorId: 'f97caebc-bd7d-42db-bfa9-0947e4cebea9'
    }

    await expect(repository.update(post)).rejects.toThrow( new NotFoundError(
      'Post not found using ID f97caebc-bd7d-42db-bfa9-0947e4cebea9'
    ))
  })

  test('Should update a post', async () => {
    const postData = PostsDataBuilder({})
    const authorData = AuthorDataBuilder({})
    const author = await prisma.author.create({ data: authorData})

    const post = await repository.create({ ...postData, authorId: author.id })

    const result = await repository.update({
      ...post,
      published: true,
      title: 'title-updated'
    })

    expect(result.published).toEqual(true)

    expect(result.title).toEqual('title-updated')
  })

  test('Should return null when it does not find a post with the slug provided', async () => {
    const result = await repository.findBySlug('fake-slug-data')

    expect(result).toBeNull()
  })

  test("Should find a post by slug", async () => {
    const postData = PostsDataBuilder({})
    const authorData = AuthorDataBuilder({})

    const author = await prisma.author.create({ data: authorData})

    const post = await prisma.post.create({ data: {
      ...postData,
      author: {
        connect: { ...author }
      }
    }})

    const result = await repository.findBySlug(post.slug)

    expect(result).toStrictEqual(post)
  })

})
