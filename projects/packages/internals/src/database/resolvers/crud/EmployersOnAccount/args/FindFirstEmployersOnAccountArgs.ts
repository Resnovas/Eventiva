import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { EmployersOnAccountOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/EmployersOnAccountOrderByWithRelationAndSearchRelevanceInput";
import { EmployersOnAccountWhereInput } from "../../../inputs/EmployersOnAccountWhereInput";
import { EmployersOnAccountWhereUniqueInput } from "../../../inputs/EmployersOnAccountWhereUniqueInput";
import { EmployersOnAccountScalarFieldEnum } from "../../../../enums/EmployersOnAccountScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindFirstEmployersOnAccountArgs {
  @TypeGraphQL.Field(_type => EmployersOnAccountWhereInput, {
    nullable: true
  })
  where?: EmployersOnAccountWhereInput | undefined;

  @TypeGraphQL.Field(_type => [EmployersOnAccountOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: EmployersOnAccountOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => EmployersOnAccountWhereUniqueInput, {
    nullable: true
  })
  cursor?: EmployersOnAccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [EmployersOnAccountScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"accountId" | "employerId" | "createdAt" | "updatedAt"> | undefined;
}
