import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { EmailCreateManyInput } from '../../../inputs/EmailCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyEmailArgs {
  @TypeGraphQL.Field((_type) => [EmailCreateManyInput], {
    nullable: false,
  })
  data!: EmailCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
