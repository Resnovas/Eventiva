import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { DomainUpdateInput } from '../../../inputs/DomainUpdateInput';
import { DomainWhereUniqueInput } from '../../../inputs/DomainWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpdateDomainArgs {
  @TypeGraphQL.Field((_type) => DomainUpdateInput, {
    nullable: false,
  })
  data!: DomainUpdateInput;

  @TypeGraphQL.Field((_type) => DomainWhereUniqueInput, {
    nullable: false,
  })
  where!: DomainWhereUniqueInput;
}
