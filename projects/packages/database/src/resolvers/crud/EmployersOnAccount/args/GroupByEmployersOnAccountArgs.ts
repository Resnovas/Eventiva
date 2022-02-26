import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { EmployersOnAccountOrderByWithAggregationInput } from '../../../inputs/EmployersOnAccountOrderByWithAggregationInput';
import { EmployersOnAccountScalarWhereWithAggregatesInput } from '../../../inputs/EmployersOnAccountScalarWhereWithAggregatesInput';
import { EmployersOnAccountWhereInput } from '../../../inputs/EmployersOnAccountWhereInput';
import { EmployersOnAccountScalarFieldEnum } from '../../../../enums/EmployersOnAccountScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class GroupByEmployersOnAccountArgs {
  @TypeGraphQL.Field((_type) => EmployersOnAccountWhereInput, {
    nullable: true,
  })
  where?: EmployersOnAccountWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [EmployersOnAccountOrderByWithAggregationInput],
    {
      nullable: true,
    }
  )
  orderBy?: EmployersOnAccountOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field((_type) => [EmployersOnAccountScalarFieldEnum], {
    nullable: false,
  })
  by!: Array<'accountId' | 'employerId' | 'createdAt' | 'updatedAt'>;

  @TypeGraphQL.Field(
    (_type) => EmployersOnAccountScalarWhereWithAggregatesInput,
    {
      nullable: true,
    }
  )
  having?: EmployersOnAccountScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
