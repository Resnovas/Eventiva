import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ApplicationCreateManyInput } from '../../../inputs/ApplicationCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyApplicationArgs {
  @TypeGraphQL.Field((_type) => [ApplicationCreateManyInput], {
    nullable: false,
  })
  data!: ApplicationCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
