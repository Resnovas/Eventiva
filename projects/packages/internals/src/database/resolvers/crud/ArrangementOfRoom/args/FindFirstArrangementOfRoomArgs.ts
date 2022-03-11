import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { ArrangementOfRoomOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/ArrangementOfRoomOrderByWithRelationAndSearchRelevanceInput";
import { ArrangementOfRoomWhereInput } from "../../../inputs/ArrangementOfRoomWhereInput";
import { ArrangementOfRoomWhereUniqueInput } from "../../../inputs/ArrangementOfRoomWhereUniqueInput";
import { ArrangementOfRoomScalarFieldEnum } from "../../../../enums/ArrangementOfRoomScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindFirstArrangementOfRoomArgs {
  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereInput, {
    nullable: true
  })
  where?: ArrangementOfRoomWhereInput | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: ArrangementOfRoomOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => ArrangementOfRoomWhereUniqueInput, {
    nullable: true
  })
  cursor?: ArrangementOfRoomWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [ArrangementOfRoomScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"roomId" | "arrangementId" | "capacity" | "details" | "createdAt" | "updatedAt"> | undefined;
}
