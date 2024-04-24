import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import path from 'node:path'
import { AppResolver } from './app.resolver'
import { AuthorsModule } from './authors/authors.module'
import { PostsModule } from './posts/posts.module'
import { forwardRef } from '@nestjs/common'

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: path.resolve(process.cwd(), 'src/schema.gql'),
    }),
    forwardRef(() => AuthorsModule),
    forwardRef(() => PostsModule),
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
