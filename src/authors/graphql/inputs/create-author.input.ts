import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

@InputType()
export class CreateAuthorInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  name: string

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Field()
  email: string
}
