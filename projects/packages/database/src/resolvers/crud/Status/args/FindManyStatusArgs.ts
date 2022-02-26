import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { StatusOrderByWithRelationAndSearchRelevanceInput } from '../../../inputs/StatusOrderByWithRelationAndSearchRelevanceInput';
import { StatusWhereInput } from '../../../inputs/StatusWhereInput';
import { StatusWhereUniqueInput } from '../../../inputs/StatusWhereUniqueInput';
import { StatusScalarFieldEnum } from '../../../../enums/StatusScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class FindManyStatusArgs {
  @TypeGraphQL.Field((_type) => StatusWhereInput, {
    nullable: true,
  })
  where?: StatusWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [StatusOrderByWithRelationAndSearchRelevanceInput],
    {
      nullable: true,
    }
  )
  orderBy?: StatusOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field((_type) => StatusWhereUniqueInput, {
    nullable: true,
  })
  cursor?: StatusWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;

  @TypeGraphQL.Field((_type) => [StatusScalarFieldEnum], {
    nullable: true,
  })
  distinct?:
    | Array<'id' | 'name' | 'createdAt' | 'updatedAt' | 'deleted'>
    | undefined;
}
