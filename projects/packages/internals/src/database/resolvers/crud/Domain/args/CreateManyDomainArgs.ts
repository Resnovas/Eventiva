import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { DomainCreateManyInput } from '../../../inputs/DomainCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyDomainArgs {
  @TypeGraphQL.Field((_type) => [DomainCreateManyInput], {
    nullable: false,
  })
  data!: DomainCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
