import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ArrangementWhereUniqueInput } from '../../../inputs/ArrangementWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class DeleteArrangementArgs {
  @TypeGraphQL.Field((_type) => ArrangementWhereUniqueInput, {
    nullable: false,
  })
  where!: ArrangementWhereUniqueInput;
}
