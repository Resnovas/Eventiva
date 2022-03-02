import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { RTWCreateManyInput } from '../../../inputs/RTWCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyRTWArgs {
  @TypeGraphQL.Field((_type) => [RTWCreateManyInput], {
    nullable: false,
  })
  data!: RTWCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
