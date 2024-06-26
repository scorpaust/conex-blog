import { DatabaseModule } from '@/database/database.module'
import { PrismaService } from '@/database/prisma/prisma.service'
import { Module, forwardRef } from '@nestjs/common'
import { PostsPrismaRepository } from './repositories/posts-prisma.repository'
import { CreatePostUseCase } from './usecases/create-post.usecase'
import { AuthorsPrismaRepository } from '../authors/repositories/authors-prisma.repository'
import { GetPostUseCase } from './usecases/get-post.usecase'
import { PublishPostUseCase } from './usecases/publish-post.usecase'
import { UnpublishPostUseCase } from './usecases/unpublish-post.usecase'
import { PostsResolver } from './graphql/resolvers/posts.resolver'
import { GetAuthorUsecase } from '@/authors/usecases/get-author.usecase'

@Module({
  imports: [forwardRef(() => DatabaseModule)],
  providers: [
    PostsResolver,
    {
      provide: 'PrismaService',
      useClass: PrismaService,
    },
    {
      provide: 'PostsRepository',
      useFactory: (prismaService: PrismaService) => {
        return new PostsPrismaRepository(prismaService)
      },
      inject: ['PrismaService'],
    },
    {
      provide: 'AuthorsRepository',
      useFactory: (prismaService: PrismaService) => {
        return new AuthorsPrismaRepository(prismaService)
      },
      inject: ['PrismaService'],
    },
    {
      provide: CreatePostUseCase.UseCase,
      useFactory: (
        postsRepository: PostsPrismaRepository,
        authorsRepository: AuthorsPrismaRepository,
      ) => {
        return new CreatePostUseCase.UseCase(postsRepository, authorsRepository)
      },
      inject: ['PostsRepository', 'AuthorsRepository'],
    },
    {
      provide: GetPostUseCase.UseCase,
      useFactory: (postsRepository: PostsPrismaRepository) => {
        return new GetPostUseCase.UseCase(postsRepository)
      },
      inject: ['PostsRepository'],
    },
    {
      provide: GetAuthorUsecase.UseCase,
      useFactory: (authorsRepository: AuthorsPrismaRepository) => {
        return new GetAuthorUsecase.UseCase(authorsRepository)
      },
      inject: ['AuthorsRepository'],
    },
    {
      provide: PublishPostUseCase.UseCase,
      useFactory: (postsRepository: PostsPrismaRepository) => {
        return new PublishPostUseCase.UseCase(postsRepository)
      },
      inject: ['PostsRepository'],
    },
    {
      provide: UnpublishPostUseCase.UseCase,
      useFactory: (postsRepository: PostsPrismaRepository) => {
        return new UnpublishPostUseCase.UseCase(postsRepository)
      },
      inject: ['PostsRepository'],
    },
  ],
})
export class PostsModule {}
