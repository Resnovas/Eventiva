import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { StatusWhereUniqueInput } from '../../../inputs/StatusWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class FindUniqueStatusArgs {
  @TypeGraphQL.Field((_type) => StatusWhereUniqueInput, {
    nullable: false,
  })
  where!: StatusWhereUniqueInput;
}
