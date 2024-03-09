import { Module } from '@nestjs/common'
import { AuthorsResolver } from './graphql/resolvers/authors.resolver'
import { DatabaseModule } from '../database/database.module'
import { PrismaService } from '../database/prisma/prisma.service'
import { AuthorsPrismaRepository } from './repositories/authors-prisma.repository'
import { ListAuthorsUsecase } from './usecases/list-authors.usecase'
import { GetAuthorUsecase } from './usecases/get-author.usecase'
import { CreateAuthorUsecase } from './usecases/create-author.usecase'
import { UpdateAuthorUsecase } from './usecases/update-author.usecase'
import { DeleteAuthorUsecase } from './usecases/delete-author.usecase'

@Module({
  imports: [DatabaseModule],
  providers: [
    AuthorsResolver,
    {
      provide: 'PrismaService',
      useClass: PrismaService,
    },
    {
      provide: 'AuthorsRepository',
      useFactory: (prisma: PrismaService) => {
        return new AuthorsPrismaRepository(prisma)
      },
      inject: ['PrismaService'],
    },
    {
      provide: ListAuthorsUsecase.UseCase,
      useFactory: (authorsRepository: AuthorsPrismaRepository) => {
        return new ListAuthorsUsecase.UseCase(authorsRepository)
      },
      inject: ['AuthorsRepository'],
    },
    {
      provide: GetAuthorUsecase.UseCase,
      useFactory: (authorsRepository: AuthorsPrismaRepository) => {
        return new GetAuthorUsecase.UseCase(authorsRepository)
      },
      inject: ['AuthorsRepository'],
    },
    {
      provide: CreateAuthorUsecase.UseCase,
      useFactory: (authorsRepository: AuthorsPrismaRepository) => {
        return new CreateAuthorUsecase.UseCase(authorsRepository)
      },
      inject: ['AuthorsRepository'],
    },
    {
      provide: UpdateAuthorUsecase.UseCase,
      useFactory: (authorsRepository: AuthorsPrismaRepository) => {
        return new UpdateAuthorUsecase.UseCase(authorsRepository)
      },
      inject: ['AuthorsRepository'],
    },
    {
      provide: DeleteAuthorUsecase.UseCase,
      useFactory: (authorsRepository: AuthorsPrismaRepository) => {
        return new DeleteAuthorUsecase.UseCase(authorsRepository)
      },
      inject: ['AuthorsRepository'],
    },
  ],
})
export class AuthorsModule {}
