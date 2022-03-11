import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ManagersOnAccountOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/ManagersOnAccountOrderByWithRelationAndSearchRelevanceInput";
import { ManagersOnAccountWhereInput } from "../../../inputs/ManagersOnAccountWhereInput";
import { ManagersOnAccountWhereUniqueInput } from "../../../inputs/ManagersOnAccountWhereUniqueInput";
import { ManagersOnAccountScalarFieldEnum } from "../../../../enums/ManagersOnAccountScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class AccountAccountsArgs {
  @TypeGraphQL.Field(_type => ManagersOnAccountWhereInput, {
    nullable: true
  })
  where?: ManagersOnAccountWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: ManagersOnAccountOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => ManagersOnAccountWhereUniqueInput, {
    nullable: true
  })
  cursor?: ManagersOnAccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [ManagersOnAccountScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"accountId" | "managersId" | "createdAt" | "updatedAt"> | undefined;
}
