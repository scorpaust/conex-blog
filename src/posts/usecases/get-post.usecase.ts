import { PostOutput } from '../types/post-output'
import { PostsPrismaRepository } from '../repositories/posts-prisma.repository'

export namespace GetPostUseCase {
  export type Input = {
    id: string
  }

  export type Output = PostOutput

  export class UseCase {
    constructor(private postsRepository: PostsPrismaRepository) {}

    async execute(input: Input): Promise<Output> {
      const post = await this.postsRepository.findById(input.id)

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        published: post.published,
        authorId: post.authorId,
        createdAt: post.createdAt,
      }
    }
  }
}
